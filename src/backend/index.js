require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const { initSchema, db } = require('./db');
const { login, authMiddleware } = require('./auth');
const { startMaintenanceTask } = require('./maintenance');
const { getPublicKey } = require('./ssh');

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
const UI_DIST = path.join(__dirname, '../frontend/dist');

// Initialize Database
initSchema();
startMaintenanceTask();

// Middleware
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

// Serve Static Frontend
app.use(express.static(UI_DIST));

// Routes
const fluxRoutes = require('./routes/fluxes')(io);
const moduleRoutes = require('./routes/modules');
const webhookRoutes = require('./routes/webhooks')(io);

app.post('/api/login', login);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/system/public-key', authMiddleware, (req, res) => {
  const key = getPublicKey();
  key ? res.json({ publicKey: key }) : res.status(500).send('Failed to generate key');
});
app.use('/api/fluxes', authMiddleware, fluxRoutes);
app.use('/api/modules', authMiddleware, moduleRoutes);
app.use('/webhook', webhookRoutes);

// Deployment Log Retrieval
app.get('/api/deployments/:id', authMiddleware, (req, res) => {
  const deployment = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id);
  deployment ? res.json(deployment) : res.status(404).send('Not found');
});

// SPA Catch-all
app.get('/', (req, res) => res.sendFile(path.join(UI_DIST, 'index.html')));
app.get('*splat', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) return;
  const indexPath = path.join(UI_DIST, 'index.html');
  fs.existsSync(indexPath) ? res.sendFile(indexPath) : res.status(404).send('UI not built');
});

// Start Server
server.listen(PORT, () => {
  console.log(`HookFlux server running on port ${PORT}`);
});
