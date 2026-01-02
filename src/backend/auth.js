const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('./db');
const { logAction } = require('./audit');

// Helper to get JWT_SECRET with fallback
const getSecret = () => process.env.JWT_SECRET || 'fallback-secret-use-env-variable-in-production';

function login(req, res) {
  const { username, password } = req.body;
  const secret = getSecret();
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || 'admin');
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const isDefault = username === 'admin' && bcrypt.compareSync(process.env.ADMIN_PASSWORD || 'admin123', user.password);
      
      const token = jwt.sign({ 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        changeRequired: isDefault
      }, secret, { expiresIn: '1d' });
      
      logAction(user.id, 'LOGIN_SUCCESS', { username: user.username }, req.ip);
      return res.json({ token, changeRequired: isDefault });
    }
    
    logAction(null, 'LOGIN_FAILURE', { attemptedUsername: username }, req.ip);
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function authMiddleware(req, res, next) {
  // Allow public health check
  if (req.path === '/health') return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret);
    
    // Check if user still exists in DB
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const secret = getSecret();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Invalid current password' });
    }
    
    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
    
    logAction(user.id, 'PASSWORD_CHANGE', { username: user.username }, req.ip);
    
    // Return a new token without the changeRequired flag
    const newToken = jwt.sign({ 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      changeRequired: false
    }, secret, { expiresIn: '1d' });
    
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
}

function verifyToken(token) {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret);
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
  if (!user) throw new Error('User no longer exists');
  return decoded;
}

module.exports = { login, authMiddleware, changePassword, verifyToken };