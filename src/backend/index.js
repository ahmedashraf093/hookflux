require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;
const LOGS_DIR = path.join(__dirname, '../../logs');
const db = new Database('data.db');

// Initialize SQLite Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    repo TEXT NOT NULL,
    branch TEXT NOT NULL,
    script TEXT NOT NULL,
    cwd TEXT NOT NULL,
    webhook_secret TEXT
  )
`);

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Migration: Load from apps.json if DB is empty and file exists
const APPS_FILE = path.join(__dirname, '../../apps.json');
if (fs.existsSync(APPS_FILE)) {
  const count = db.prepare('SELECT COUNT(*) as count FROM apps').get().count;
  if (count === 0) {
    try {
      const apps = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
      const insert = db.prepare('INSERT INTO apps (id, name, repo, branch, script, cwd, webhook_secret) VALUES (?, ?, ?, ?, ?, ?, ?)');
      apps.forEach(app => {
        insert.run(app.id, app.name, app.repo, app.branch, app.script, app.cwd, process.env.WEBHOOK_SECRET || '');
      });
      console.log('Migrated apps.json to SQLite');
    } catch (err) {
      console.error('Migration failed:', err.message);
    }
  }
}

// Helper to load apps
function getApps() {
  return db.prepare('SELECT * FROM apps').all();
}

// Verify GitHub Signature for a specific app
function verifySignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Execute Deployment Script
function runDeploy(appConfig, socket = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOGS_DIR, `${appConfig.id}-${timestamp}.log`);
  const logStream = fs.createWriteStream(logFile);

  const msg = `Starting deployment for ${appConfig.name}...
`;
  logStream.write(msg);
  if (socket) socket.emit('log', { appId: appConfig.id, data: msg });

  const child = spawn('bash', [appConfig.script], {
    cwd: appConfig.cwd,
    env: { ...process.env, APP_ID: appConfig.id }
  });

  child.stdout.on('data', (data) => {
    const text = data.toString();
    logStream.write(text);
    io.emit('log', { appId: appConfig.id, data: text });
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    logStream.write(`ERROR: ${text}`);
    io.emit('log', { appId: appConfig.id, data: `ERROR: ${text}`, type: 'error' });
  });

  child.on('close', (code) => {
    const endMsg = `
Deployment finished with code ${code}
`;
    logStream.write(endMsg);
    logStream.end();
    io.emit('status', { appId: appConfig.id, status: code === 0 ? 'success' : 'failed' });
  });
}

// Webhook Endpoint
app.post('/webhook', (req, res) => {
  const { repository, ref } = req.body;
  if (!repository || !ref) return res.status(400).send('Invalid payload');

  const repoFullName = repository.full_name;
  const branch = ref.replace('refs/heads/', '');

  // Find app first to get its specific secret
  const targetApp = db.prepare('SELECT * FROM apps WHERE repo = ? AND branch = ?').get(repoFullName, branch);

  if (!targetApp) {
    return res.status(404).send('No matching app found');
  }

  if (!verifySignature(req, targetApp.webhook_secret)) {
    return res.status(401).send('Invalid signature');
  }

  runDeploy(targetApp);
  res.status(202).send('Deployment started');
});

// Simple Auth
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid password' });
});

// Middleware to check JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
};

app.get('/api/apps', auth, (req, res) => {
  res.json(getApps());
});

app.post('/api/apps', auth, (req, res) => {
  const { id, name, repo, branch, script, cwd, webhook_secret } = req.body;
  try {
    db.prepare('INSERT INTO apps (id, name, repo, branch, script, cwd, webhook_secret) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, repo, branch, script, cwd, webhook_secret);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/apps/:id', auth, (req, res) => {
  const { name, repo, branch, script, cwd, webhook_secret } = req.body;
  try {
    db.prepare('UPDATE apps SET name = ?, repo = ?, branch = ?, script = ?, cwd = ?, webhook_secret = ? WHERE id = ?')
      .run(name, repo, branch, script, cwd, webhook_secret, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/apps/:id', auth, (req, res) => {
  db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/deploy/:id', auth, (req, res) => {
  const targetApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (targetApp) {
    runDeploy(targetApp);
    res.status(202).send('Deployment triggered');
  } else {
    res.status(404).send('App not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});