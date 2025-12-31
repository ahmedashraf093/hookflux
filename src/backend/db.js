const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../');
const dbPath = path.join(DATA_DIR, 'data.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      repo TEXT NOT NULL,
      branch TEXT NOT NULL,
      script TEXT NOT NULL,
      cwd TEXT NOT NULL,
      webhook_secret TEXT,
      strategy TEXT DEFAULT 'script',
      template_id TEXT,
      template_params TEXT,
      flow_config TEXT,
      ssh_host TEXT,
      ssh_user TEXT
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      status TEXT DEFAULT 'running',
      logs TEXT DEFAULT '',
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      params TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Migrations
  try {
    db.exec("ALTER TABLE apps ADD COLUMN strategy TEXT DEFAULT 'script'");
    db.exec("ALTER TABLE apps ADD COLUMN template_id TEXT");
    db.exec("ALTER TABLE apps ADD COLUMN template_params TEXT");
    db.exec("ALTER TABLE apps ADD COLUMN flow_config TEXT");
    db.exec("ALTER TABLE apps ADD COLUMN ssh_host TEXT");
    db.exec("ALTER TABLE apps ADD COLUMN ssh_user TEXT");
  } catch (e) {}

  // Create initial admin user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(adminPass, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'ADMIN');
    console.log('[Security] Initial admin user created.');
  }

  // Seed default templates
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get().count;
  if (templateCount === 0) {
    const laravelContent = `#!/bin/bash
set -e
echo "--- Starting Laravel Deployment [{{STACK_NAME}}] ---"
if [ ! -d ".git" ]; then
    git clone -b {{BRANCH}} {{REPO_URL}} .
else
    git fetch origin {{BRANCH}}
    git reset --hard origin/{{BRANCH}}
fi
docker build -t {{IMAGE_NAME}}:latest .
docker stack deploy -c docker-compose.yml --with-registry-auth {{STACK_NAME}}
echo "Deployment finished for {{DOMAIN}}"`;

    const nodejsContent = `#!/bin/bash
set -e
echo "--- Starting Node.js Deployment [{{SERVICE_NAME}}] ---"
if [ ! -d ".git" ]; then
    git clone -b {{BRANCH}} {{REPO_URL}} .
else
    git fetch origin {{BRANCH}}
    git reset --hard origin/{{BRANCH}}
fi
docker build -t {{IMAGE_NAME}}:latest .
docker service update --image {{IMAGE_NAME}}:latest --with-registry-auth {{SERVICE_NAME}}
echo "Service {{SERVICE_NAME}} updated for {{DOMAIN}}"`;

    db.prepare('INSERT INTO templates (id, name, content, params) VALUES (?, ?, ?, ?)').run('laravel-swarm', 'Laravel Pipeline', laravelContent, JSON.stringify(['IMAGE_NAME', 'STACK_NAME', 'DOMAIN']));
    db.prepare('INSERT INTO templates (id, name, content, params) VALUES (?, ?, ?, ?)').run('nodejs-swarm', 'Node.js Update', nodejsContent, JSON.stringify(['IMAGE_NAME', 'SERVICE_NAME', 'DOMAIN']));
    db.prepare('INSERT INTO templates (id, name, content, params) VALUES (?, ?, ?, ?)').run('generic-bash', 'Custom Script', '#!/bin/bash\n{{SCRIPT_CONTENT}}', JSON.stringify(['SCRIPT_CONTENT']));
  }

  // apps.json migration
  const APPS_FILE = path.join(__dirname, '../../apps.json');
  if (fs.existsSync(APPS_FILE)) {
    const count = db.prepare('SELECT COUNT(*) as count FROM apps').get().count;
    if (count === 0) {
      try {
        const apps = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
        const insert = db.prepare('INSERT INTO apps (id, name, repo, branch, script, cwd, webhook_secret) VALUES (?, ?, ?, ?, ?, ?, ?)');
        apps.forEach(app => {
          insert.run(app.id, app.name, app.repo, app.branch, app.script, app.cwd, process.env.WEBHOOK_SECRET || '');
        });
        console.log('Migrated apps.json to SQLite');
      } catch (err) {
        console.error('Migration failed:', err.message);
      }
    }
  }
}

module.exports = { db, initSchema };