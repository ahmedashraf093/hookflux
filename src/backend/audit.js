const { db } = require('./db');

/**
 * Records a sensitive action in the audit log.
 * @param {number|null} userId - ID of the user who performed the action.
 * @param {string} action - Brief description of the action (e.g., 'CREATE_FLUX').
 * @param {object|string} details - Additional contextual data.
 * @param {string|null} ip - IP address of the request.
 */
function logAction(userId, action, details = {}, ip = null) {
  try {
    const detailsString = typeof details === 'string' ? details : JSON.stringify(details);
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, details, ip_address) 
      VALUES (?, ?, ?, ?)
    `).run(userId, action, detailsString, ip);
  } catch (err) {
    console.error('[Audit] Failed to record action:', err);
  }
}

/**
 * Retrieves the most recent audit logs.
 * @param {number} limit - Number of logs to retrieve.
 */
function getRecentLogs(limit = 100) {
  return db.prepare(`
    SELECT a.*, u.username 
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC 
    LIMIT ?
  `).all(limit);
}

module.exports = { logAction, getRecentLogs };
