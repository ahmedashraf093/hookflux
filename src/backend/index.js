const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const { initSchema, db } = require('./db');
const { login, authMiddleware, changePassword, verifyToken } = require('./auth');
const { startMaintenanceTask } = require('./maintenance');
const { getPublicKey } = require('./ssh');
const { getRecentLogs } = require('./audit');
const { getVersionInfo } = require('./version');

const DOMAIN = process.env.DOMAIN || 'localhost';

// Initialize App
const app = express();
app.set('trust proxy', 1); // Trust Traefik/Load Balancer
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' && process.env.DOMAIN
      ? [new RegExp(`^https?://.*\\.${process.env.DOMAIN.replace('.', '\\.')}$`), `https://${process.env.DOMAIN}`]
      : "*" 
  } 
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const user = verifyToken(token);
    socket.user = user;
    next();
  } catch (e) {
    next(new Error('Authentication error'));
  }
});

// 1. Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://cdn.tailwindcss.com"], // Allow Tailwind CDN
      "img-src": ["'self'", "data:", "https://*"],
    },
  },
}));

// 2. Compression
app.use(compression());

// 3. Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// 4. Strict Auth Rate Limiting (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 failed login attempts per hour
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});
app.use('/api/login', authLimiter);

const PORT = process.env.PORT || 3000;
const UI_DIST = path.join(__dirname, '../frontend/dist');

// Initialize Database
initSchema();
startMaintenanceTask();

// Middleware
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(bodyParser.urlencoded({
  extended: true,
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

// Serve Static Frontend
app.use(express.static(UI_DIST));

// Routes
const fluxRoutes = require('./routes/fluxes')(io);
const moduleRoutes = require('./routes/modules');
const webhookRoutes = require('./routes/webhooks')(io);

app.post('/api/login', login);
app.use('/api', authMiddleware);

app.post('/api/auth/change-password', changePassword);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/system/version', getVersionInfo);
app.get('/api/system/public-key', (req, res) => {
  const key = getPublicKey();
  key ? res.json({ publicKey: key }) : res.status(500).send('Failed to generate key');
});

app.get('/api/system/audit', (req, res) => {
  res.json(getRecentLogs(50));
});
app.use('/api/fluxes', fluxRoutes);
app.use('/api/modules', moduleRoutes);
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`HookFlux server running on port ${PORT}`);
});