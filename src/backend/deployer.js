const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { db } = require('./db');

const LOGS_DIR = process.env.LOGS_DIR || path.join(__dirname, '../../logs');

function sanitize(val, regex) {
  const str = String(val);
  if (!regex.test(str)) {
    throw new Error(`Invalid value detected: ${str}`);
  }
  return str;
}

function prepareScript(appConfig, flowSteps) {
  let fullFlowScript = '#!/bin/bash\nset -e\n';
  
  for (const [index, step] of flowSteps.entries()) {
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(step.template_id);
    if (!template) throw new Error(`Template ${step.template_id} not found for step ${index + 1}`);
    
    let stepContent = template.content;
    
    const safeRepo = sanitize(`git@github.com:${appConfig.repo}.git`, /^git@github\.com:[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+\.git$/);
    const safeBranch = sanitize(appConfig.branch, /^[a-zA-Z0-9-_/.]+$/);
    const safeAppId = sanitize(appConfig.id, /^[a-zA-Z0-9-_]+$/);

    const allParams = {
      ...step.params,
      REPO_URL: safeRepo,
      BRANCH: safeBranch,
      APP_ID: safeAppId,
      DOMAIN: process.env.DOMAIN || 'localhost'
    };

    Object.keys(allParams).forEach(key => {
      if (/[;&|`$]/.test(String(allParams[key]))) {
           throw new Error(`Potential injection detected in parameter ${key}`);
      }
      const regex = new RegExp(`{{${key}}}`, 'g');
      stepContent = stepContent.replace(regex, allParams[key]);
    });

    fullFlowScript += `\n# --- STEP ${index + 1}: ${template.name} ---\n`;
    fullFlowScript += stepContent + '\n';
  }
  return fullFlowScript;
}

function runDeploy(appConfig, io) {
  try {
    const deployment = db.prepare('INSERT INTO deployments (app_id, status) VALUES (?, ?)').run(appConfig.id, 'running');
    const deploymentId = deployment.lastInsertRowid;
    let fullLogs = '';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
    const logFile = path.join(LOGS_DIR, `${appConfig.id}-${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile);

    const emitLog = (data, type = 'info') => {
      fullLogs += data;
      logStream.write(data);
      io.emit('log', { appId: appConfig.id, deploymentId, data, type });
    };

    emitLog(`Initializing pipeline for ${appConfig.name} (ID: ${deploymentId})...
`);

    const flowSteps = JSON.parse(appConfig.flow_config || '[]');
    if (flowSteps.length === 0) {
      throw new Error("No deployment steps defined in flow configuration.");
    }

    const fullFlowScript = prepareScript(appConfig, flowSteps);

    const tempScriptDir = path.join(__dirname, '../../temp_scripts');
    if (!fs.existsSync(tempScriptDir)) fs.mkdirSync(tempScriptDir, { recursive: true });
    const finalScriptPath = path.join(tempScriptDir, `${appConfig.id}-${deploymentId}.sh`);
    fs.writeFileSync(finalScriptPath, fullFlowScript, { mode: 0o755 });
    
    emitLog(`Generated pipeline script with ${flowSteps.length} steps.\n`);

    let spawnCmd = 'bash';
    let spawnArgs = [finalScriptPath];

    if (appConfig.ssh_host) {
      const user = appConfig.ssh_user || 'root';
      emitLog(`Target: Remote Host (${user}@${appConfig.ssh_host}) via SSH\n`);
      
      spawnCmd = 'ssh';
      spawnArgs = [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'BatchMode=yes',
        `${user}@${appConfig.ssh_host}`,
        'bash -s'
      ];
    }

    const child = spawn(spawnCmd, spawnArgs, {
      cwd: appConfig.cwd.startsWith('~') 
        ? appConfig.cwd.replace('~', process.env.HOME || process.env.USERPROFILE)
        : appConfig.cwd,
      env: { ...process.env, APP_ID: appConfig.id, DEPLOYMENT_ID: deploymentId }
    });

    const timeoutMinutes = parseInt(process.env.PIPELINE_TIMEOUT) || 10;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    let isTimedOut = false;

    const timeoutTimer = setTimeout(() => {
      isTimedOut = true;
      const timeoutMsg = `\n[PIPELINE_TIMEOUT] after ${timeoutMinutes} minutes. Terminating process...\n`;
      emitLog(timeoutMsg, 'error');
      
      try {
        child.kill('SIGTERM');
        setTimeout(() => {
          if (child.exitCode === null) child.kill('SIGKILL');
        }, 2000);
      } catch (e) {
        console.error('Failed to kill timed out process:', e);
      }
    }, timeoutMs);

    if (appConfig.ssh_host) {
      const scriptContent = fs.readFileSync(finalScriptPath);
      child.stdin.write(scriptContent);
      child.stdin.end();
    }

    child.on('error', (err) => {
      clearTimeout(timeoutTimer);
      const errMsg = `\n[PIPELINE_START_FAILED]: ${err.message}\n`;
      emitLog(errMsg, 'error');
      db.prepare('UPDATE deployments SET status = ?, logs = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run('failed', fullLogs, deploymentId);
      io.emit('status', { appId: appConfig.id, deploymentId, status: 'failed' });
    });

    child.stdout.on('data', (data) => emitLog(data.toString()));
    child.stderr.on('data', (data) => emitLog(data.toString(), 'error'));

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      const status = isTimedOut ? 'failed' : (code === 0 ? 'success' : 'failed');
      const endMsg = isTimedOut 
        ? `\nPipeline terminated due to timeout.\n`
        : `\nPipeline finished with code ${code}\n`;
      
      emitLog(endMsg);
      logStream.end();

      const MAX_DB_LOG_SIZE = 500 * 1024;
      const dbLogs = fullLogs.length > MAX_DB_LOG_SIZE 
        ? "...[Truncated, view full file for details]...\n" + fullLogs.slice(-MAX_DB_LOG_SIZE)
        : fullLogs;

      db.prepare('UPDATE deployments SET status = ?, logs = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, dbLogs, deploymentId);

      io.emit('status', { appId: appConfig.id, deploymentId, status });
      
      if (fs.existsSync(finalScriptPath)) fs.unlinkSync(finalScriptPath);
    });

    return deploymentId;
  } catch (err) {
    console.error('Failed to run deployment:', err);
    io.emit('error', { message: 'Failed to start deployment: ' + err.message });
  }
}

module.exports = { runDeploy, sanitize, prepareScript };
