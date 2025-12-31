const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database('data.db');
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
