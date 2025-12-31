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
// ... (schema code)

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve static files from the React app
app.use(express.static(UI_DIST));

// Migration: Load from apps.json if DB is empty and file exists
// ... (migration logic)

// ... (other functions and endpoints)

// All other requests return the React app
app.get('*splat', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) return;
  res.sendFile(path.join(UI_DIST, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
