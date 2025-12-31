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
const UI_DIST = path.join(__dirname, '../frontend/dist');
const db = new Database('data.db');
db.pragma('foreign_keys = ON');

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
  );

  CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    logs TEXT DEFAULT '',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
  );
`);

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve static files from the React app
app.use(express.static(UI_DIST));

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
function runDeploy(appConfig) {
  try {
    const deployment = db.prepare('INSERT INTO deployments (app_id, status) VALUES (?, ?)').run(appConfig.id, 'running');
    const deploymentId = deployment.lastInsertRowid;
    let fullLogs = '';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
    const logFile = path.join(LOGS_DIR, `${appConfig.id}-${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile);

    const startMsg = `Starting deployment for ${appConfig.name} (ID: ${deploymentId})...
`;
    fullLogs += startMsg;
    logStream.write(startMsg);
    io.emit('log', { appId: appConfig.id, deploymentId, data: startMsg });

    const scriptPath = appConfig.script.startsWith('~') 
      ? appConfig.script.replace('~', process.env.HOME || process.env.USERPROFILE)
      : appConfig.script;

    const child = spawn('bash', [scriptPath], {
      cwd: appConfig.cwd.startsWith('~') 
        ? appConfig.cwd.replace('~', process.env.HOME || process.env.USERPROFILE)
        : appConfig.cwd,
      env: { ...process.env, APP_ID: appConfig.id, DEPLOYMENT_ID: deploymentId }
    });

    child.on('error', (err) => {
      const errMsg = `
Failed to start deployment process: ${err.message}
`;
      fullLogs += errMsg;
      logStream.write(errMsg);
      io.emit('log', { appId: appConfig.id, deploymentId, data: errMsg, type: 'error' });
      
      db.prepare('UPDATE deployments SET status = ?, logs = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run('failed', fullLogs, deploymentId);
      io.emit('status', { appId: appConfig.id, deploymentId, status: 'failed' });
    });

    child.stdout.on('data', (data) => {
      const text = data.toString();
      fullLogs += text;
      logStream.write(text);
      io.emit('log', { appId: appConfig.id, deploymentId, data: text });
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      const errorText = `ERROR: ${text}`;
      fullLogs += errorText;
      logStream.write(errorText);
      io.emit('log', { appId: appConfig.id, deploymentId, data: errorText, type: 'error' });
    });

    child.on('close', (code) => {
      const status = code === 0 ? 'success' : 'failed';
      const endMsg = `
Deployment finished with code ${code}
`;
      fullLogs += endMsg;
      logStream.write(endMsg);
      logStream.end();

      db.prepare('UPDATE deployments SET status = ?, logs = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, fullLogs, deploymentId);

      io.emit('status', { appId: appConfig.id, deploymentId, status });
    });

    return deploymentId;
  } catch (err) {
    console.error('Failed to run deployment:', err);
    io.emit('error', { message: 'Failed to start deployment' });
  }
}

// Webhook Endpoint
app.post('/webhook/:id', (req, res) => {
  const { id } = req.params;
  const { repository, ref } = req.body;
  
  const targetApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);

  if (!targetApp) {
    return res.status(404).send('App not found');
  }

  if (repository && ref) {
    const repoFullName = repository.full_name;
    const branch = ref.replace('refs/heads/', '');
    if (targetApp.repo !== repoFullName || targetApp.branch !== branch) {
      return res.status(400).send('Payload mismatch for this slug');
    }
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

app.get('/api/apps/:id/deployments', auth, (req, res) => {
  const deployments = db.prepare('SELECT id, status, start_time, end_time FROM deployments WHERE app_id = ? ORDER BY start_time DESC LIMIT 50')
    .all(req.params.id);
  res.json(deployments);
});

app.get('/api/deployments/:id', auth, (req, res) => {
  const deployment = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id);
  if (deployment) {
    res.json(deployment);
  } else {
    res.status(404).send('Deployment not found');
  }
});

app.post('/api/deploy/:id', auth, (req, res) => {
  const targetApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (targetApp) {
    const deploymentId = runDeploy(targetApp);
    res.status(202).json({ success: true, deploymentId });
  } else {
    res.status(404).send('App not found');
  }
});

// All other requests return the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(UI_DIST, 'index.html'));
});

app.get('*splat', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) return;
  const indexPath = path.join(UI_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('UI not built. Run npm run build.');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});