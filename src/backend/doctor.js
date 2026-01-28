const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { db } = require('./db');
const { getPublicKey } = require('./ssh');

function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.substring(1).split('.')[0], 10);
    return {
      name: 'Node.js Version',
      status: major >= 16 ? 'ok' : 'warn',
      message: `Current: ${version} (Recommended: >= v16)`
    };
  } catch (e) {
    return { name: 'Node.js Version', status: 'error', message: e.message };
  }
}

function checkDatabase() {
  try {
    const count = db.prepare('SELECT 1').get();
    return {
      name: 'Database (SQLite)',
      status: count ? 'ok' : 'error',
      message: count ? 'Connection successful' : 'Query failed'
    };
  } catch (e) {
    return { name: 'Database (SQLite)', status: 'error', message: e.message };
  }
}

function checkDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    try {
      const info = execSync('docker info --format "{{.Swarm.LocalNodeState}}"', { encoding: 'utf8' }).trim();
      return {
        name: 'Docker Swarm',
        status: info === 'active' ? 'ok' : 'warn',
        message: info === 'active' ? 'Swarm is active' : `Swarm state: ${info}`
      };
    } catch (e) {
       return { name: 'Docker Swarm', status: 'warn', message: 'Could not check Swarm state specifically' };
    }
  } catch (e) {
    return { name: 'Docker Engine', status: 'error', message: 'Docker CLI not found or daemon not running' };
  }
}

function checkDiskSpace() {
  try {
    const output = execSync('df -h .', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.replace(/\s+/g, ' ').split(' ');
    // Depending on df output, avail is often 4th column (index 3), use% is 5th (index 4)
    // Filesystem Size Used Avail Use% Mounted on
    const avail = parts[3];
    const usePercent = parts[4];
    
    const useNum = parseInt(usePercent.replace('%', ''));

    return {
      name: 'Disk Space',
      status: useNum > 90 ? 'warn' : 'ok',
      message: `${avail} available (${usePercent} used)`
    };
  } catch (e) {
    return { name: 'Disk Space', status: 'warn', message: 'Could not determine disk space' };
  }
}

function checkGit() {
    try {
        const version = execSync('git --version', { encoding: 'utf8' }).trim();
        return {
            name: 'Git',
            status: 'ok',
            message: version
        };
    } catch (e) {
        return { name: 'Git', status: 'error', message: 'Git is not installed' };
    }
}

function checkSSH() {
     const key = getPublicKey();
     return {
         name: 'SSH Key',
         status: key ? 'ok' : 'warn',
         message: key ? 'Public key available' : 'No public key found'
     };
}

function runAllChecks() {
  return [
    checkNodeVersion(),
    checkDatabase(),
    checkDocker(),
    checkDiskSpace(),
    checkGit(),
    checkSSH()
  ];
}

module.exports = { runAllChecks };
