const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db');
const { runDeploy } = require('../deployer');

function verifySignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (e) {
    return false;
  }
}

const webhookRouter = (io) => {
  router.post('/:id', (req, res) => {
    const { id } = req.params;
    
    // GitHub can send payload as JSON or urlencoded 'payload' field
    let payload = req.body;
    if (req.body && req.body.payload && typeof req.body.payload === 'string') {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (e) {
        return res.status(400).send('Invalid urlencoded payload JSON');
      }
    }

    const { repository, ref } = payload;
    
    const targetFlux = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
    if (!targetFlux) return res.status(404).send('Flux not found');

    if (repository && ref) {
      const repoFullName = repository.full_name;
      const branch = ref.replace('refs/heads/', '');
      if (targetFlux.repo !== repoFullName || targetFlux.branch !== branch) {
        return res.status(400).send('Payload mismatch for this flux');
      }
    }

    if (!verifySignature(req, targetFlux.webhook_secret)) {
      return res.status(401).send('Invalid signature');
    }

    runDeploy(targetFlux, io);
    res.status(202).send('Flux triggered');
  });

  return router;
};

module.exports = webhookRouter;
module.exports.verifySignature = verifySignature;
