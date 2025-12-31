const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM templates').all());
});

router.post('/', (req, res) => {
  const { id, name, content, params } = req.body;
  try {
    const finalParams = Array.isArray(params) ? JSON.stringify(params) : (typeof params === 'string' ? params : '[]');
    db.prepare('INSERT INTO templates (id, name, content, params) VALUES (?, ?, ?, ?)')
      .run(id, name, content, finalParams);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const { name, content, params } = req.body;
  try {
    const finalParams = Array.isArray(params) ? JSON.stringify(params) : (typeof params === 'string' ? params : '[]');
    db.prepare('UPDATE templates SET name = ?, content = ?, params = ? WHERE id = ?')
      .run(name, content, finalParams, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;