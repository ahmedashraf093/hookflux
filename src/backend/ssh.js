const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SSH_DIR = path.join(os.homedir(), '.ssh');
const PRIVATE_KEY_PATH = path.join(SSH_DIR, 'id_rsa');
const PUBLIC_KEY_PATH = path.join(SSH_DIR, 'id_rsa.pub');

function ensureSshKey() {
  if (!fs.existsSync(SSH_DIR)) {
    fs.mkdirSync(SSH_DIR, { recursive: true, mode: 0o700 });
  }

  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.log('[SSH] Generating system RSA key pair...');
    execSync(`ssh-keygen -t rsa -b 4096 -f ${PRIVATE_KEY_PATH} -N ""`, { stdio: 'inherit' });
    console.log('[SSH] Key pair generated successfully.');
  }
}

function getPublicKey() {
  try {
    ensureSshKey();
    return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8').trim();
  } catch (err) {
    console.error('[SSH] Failed to retrieve public key:', err);
    return null;
  }
}

module.exports = { ensureSshKey, getPublicKey };
