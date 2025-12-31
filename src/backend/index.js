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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;
const APPS_FILE = path.join(__dirname, '../../apps.json');
const LOGS_DIR = path.join(__dirname, '../../logs');

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Helper to load apps
function getApps() {
  return JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
}

// Verify GitHub Signature
function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Execute Deployment Script
function runDeploy(appConfig, socket = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(LOGS_DIR, `${appConfig.id}-${timestamp}.log`);
  const logStream = fs.createWriteStream(logFile);

  const msg = `Starting deployment for ${appConfig.name}...\n`;
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
    const endMsg = `\nDeployment finished with code ${code}\n`;
    logStream.write(endMsg);
    logStream.end();
    io.emit('status', { appId: appConfig.id, status: code === 0 ? 'success' : 'failed' });
  });
}

// Webhook Endpoint
app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  const { repository, ref } = req.body;
  const repoFullName = repository.full_name;
  const branch = ref.replace('refs/heads/', '');

  const apps = getApps();
  const targetApp = apps.find(a => a.repo === repoFullName && a.branch === branch);

  if (targetApp) {
    runDeploy(targetApp);
    res.status(202).send('Deployment started');
  } else {
    res.status(404).send('No matching app found');
  }
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

app.post('/api/deploy/:id', auth, (req, res) => {
  const apps = getApps();
  const targetApp = apps.find(a => a.id === req.params.id);
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
