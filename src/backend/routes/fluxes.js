const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { runDeploy } = require('../deployer');

module.exports = (io) => {
  router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM apps').all());
  });

  router.get('/statuses', (req, res) => {
    const statuses = db.prepare(`
      SELECT app_id, status 
      FROM deployments
      WHERE id IN (
        SELECT MAX(id) FROM deployments GROUP BY app_id
      )
    `).all();
    const statusMap = statuses.reduce((acc, row) => {
      acc[row.app_id] = row.status;
      return acc;
    }, {});
    res.json(statusMap);
  });

  router.post('/', (req, res) => {
    const { id, name, repo, branch, script, cwd, webhook_secret, strategy, template_id, template_params, flow_config, ssh_host, ssh_user } = req.body;
    try {
      db.prepare('INSERT INTO apps (id, name, repo, branch, script, cwd, webhook_secret, strategy, template_id, template_params, flow_config, ssh_host, ssh_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, name, repo, branch, script, cwd, webhook_secret, strategy || 'script', template_id || null, template_params || '{}', flow_config || '[]', ssh_host || null, ssh_user || null);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', (req, res) => {
    const { name, repo, branch, script, cwd, webhook_secret, strategy, template_id, template_params, flow_config, ssh_host, ssh_user } = req.body;
    try {
      db.prepare('UPDATE apps SET name = ?, repo = ?, branch = ?, script = ?, cwd = ?, webhook_secret = ?, strategy = ?, template_id = ?, template_params = ?, flow_config = ?, ssh_host = ?, ssh_user = ? WHERE id = ?')
        .run(name, repo, branch, script, cwd, webhook_secret, strategy || 'script', template_id || null, template_params || '{}', flow_config || '[]', ssh_host || null, ssh_user || null, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  router.get('/:id/deployments', (req, res) => {
    const deployments = db.prepare('SELECT id, status, start_time, end_time FROM deployments WHERE app_id = ? ORDER BY start_time DESC LIMIT 50')
      .all(req.params.id);
    res.json(deployments);
  });

  router.post('/:id/deploy', (req, res) => {
    const targetApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    if (targetApp) {
      const deploymentId = runDeploy(targetApp, io);
      res.status(202).json({ success: true, deploymentId });
    } else {
      res.status(404).send('Flux not found');
    }
  });

  return router;
};