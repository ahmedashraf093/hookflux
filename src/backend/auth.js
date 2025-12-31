const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('./db');

function login(req, res) {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || 'admin');
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const isDefault = username === 'admin' && bcrypt.compareSync(process.env.ADMIN_PASSWORD || 'admin123', user.password);
      
      const token = jwt.sign({ 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        changeRequired: isDefault
      }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      return res.json({ token, changeRequired: isDefault });
    }
    
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Invalid current password' });
    }
    
    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
    
    // Return a new token without the changeRequired flag
    const newToken = jwt.sign({ 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      changeRequired: false
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
}

module.exports = { login, authMiddleware, changePassword };
