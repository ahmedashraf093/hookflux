const fs = require('fs');
const path = require('path');

// Set up a temporary test database
const TEST_DATA_DIR = path.join(__dirname, '../tmp_test_data');
if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
process.env.DATA_DIR = TEST_DATA_DIR;

const { db, initSchema } = require('../../src/backend/db');

describe('Database Logic', () => {
  beforeAll(() => {
    initSchema();
  });

  afterAll(() => {
    db.close();
    // Clean up test DB
    if (fs.existsSync(path.join(TEST_DATA_DIR, 'data.db'))) {
      fs.unlinkSync(path.join(TEST_DATA_DIR, 'data.db'));
    }
    fs.rmdirSync(TEST_DATA_DIR);
  });

  test('should initialize schema and create users table', () => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(table).toBeDefined();
    expect(table.name).toBe('users');
  });

  test('should create default admin user', () => {
    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    expect(admin).toBeDefined();
    expect(admin.role).toBe('ADMIN');
  });

  test('should allow inserting and retrieving an app', () => {
    const app = {
      id: 'test-app',
      name: 'Test App',
      repo: 'user/repo',
      branch: 'main',
      script: 'deploy.sh',
      cwd: '.'
    };
    
    db.prepare('INSERT INTO apps (id, name, repo, branch, script, cwd) VALUES (?, ?, ?, ?, ?, ?)')
      .run(app.id, app.name, app.repo, app.branch, app.script, app.cwd);
      
    const retrieved = db.prepare('SELECT * FROM apps WHERE id = ?').get('test-app');
    expect(retrieved.name).toBe('Test App');
  });
});
