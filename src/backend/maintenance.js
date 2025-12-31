const { db } = require('./db');
const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');

/**
 * Prunes old deployment records and their associated log files.
 * @param {number} daysToKeep - Number of days of history to retain.
 */
function pruneLogs(daysToKeep = 30) {
  console.log(`[Maintenance] Starting log pruning (Retention: ${daysToKeep} days)...`);
  
  try {
    // 1. Identify deployments to delete
    const oldDeployments = db.prepare(`
      SELECT id, app_id, start_time 
      FROM deployments 
      WHERE start_time < datetime('now', '-${daysToKeep} days')
    `).all();

    if (oldDeployments.length === 0) {
      console.log('[Maintenance] No old logs to prune.');
      return;
    }

    // 2. Delete deployment records from DB
    const deleteStmt = db.prepare("DELETE FROM deployments WHERE id = ?");
    
    // We also need to find associated files in the logs directory.
    // Files are named: {appId}-{isoTimestamp}.log
    // This part is tricky because the timestamp in filename isn't 1:1 with DB start_time.
    // A better approach is to rely on file modification time.

    const transaction = db.transaction((deployments) => {
      for (const d of deployments) {
        deleteStmt.run(d.id);
      }
    });

    transaction(oldDeployments);
    console.log(`[Maintenance] Pruned ${oldDeployments.length} records from database.`);

    // 3. Optional: Reclaim SQLite space
    db.exec("VACUUM");

    // 4. File-based pruning (clean logs directory)
    const files = fs.readdirSync(LOGS_DIR);
    const now = Date.now();
    const retentionMs = daysToKeep * 24 * 60 * 60 * 1000;
    
    let filesDeleted = 0;
    files.forEach(file => {
      const filePath = path.join(LOGS_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > retentionMs) {
        fs.unlinkSync(filePath);
        filesDeleted++;
      }
    });
    console.log(`[Maintenance] Deleted ${filesDeleted} old log files.`);

  } catch (err) {
    console.error('[Maintenance] Pruning failed:', err);
  }
}

// Run maintenance every 24 hours
function startMaintenanceTask() {
  // Run once on startup after a delay
  setTimeout(() => pruneLogs(), 5000);
  
  // Schedule daily run
  setInterval(() => pruneLogs(), 24 * 60 * 60 * 1000);
}

module.exports = { startMaintenanceTask };
