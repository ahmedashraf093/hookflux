const { sanitize, prepareScript } = require('../../src/backend/deployer');
const { db, initSchema } = require('../../src/backend/db');
const fs = require('fs');
const path = require('path');

describe('Deployer Logic', () => {
  const TEST_DATA_DIR = path.join(__dirname, '../tmp_test_data_deployer_' + Date.now());

  beforeAll(() => {
    // Set up a temporary test database for prepareScript to work
    if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    process.env.DATA_DIR = TEST_DATA_DIR;
    initSchema();
  });

  afterAll(() => {
    db.close();
    try {
      if (fs.existsSync(path.join(TEST_DATA_DIR, 'data.db'))) {
        fs.unlinkSync(path.join(TEST_DATA_DIR, 'data.db'));
      }
      fs.rmdirSync(TEST_DATA_DIR);
    } catch (e) {
      console.warn('Cleanup failed:', e.message);
    }
  });

  test('sanitize should allow safe values', () => {
    expect(sanitize('main', /^[a-z]+$/)).toBe('main');
    expect(sanitize('my-app-123', /^[a-z0-9-]+$/)).toBe('my-app-123');
  });

  test('sanitize should throw on invalid values', () => {
    expect(() => sanitize('main; rm -rf /', /^[a-z]+$/)).toThrow();
  });

  test('prepareScript should detect injection in extra params', () => {
    const appConfig = { id: 'test', repo: 'user/repo', branch: 'main' };
    const flowSteps = [
      { 
        template_id: 'generic-bash', 
        params: { SCRIPT_CONTENT: 'echo "hello"; rm -rf /' } 
      }
    ];
    // In db.js generic-bash template uses {{SCRIPT_CONTENT}}
    // prepareScript checks for [;&|$`] in all params
    expect(() => prepareScript(appConfig, flowSteps)).toThrow(/Potential injection detected/);
  });

  test('prepareScript should generate valid script', () => {
    const appConfig = { id: 'testapp', repo: 'user/repo', branch: 'prod' };
    
    // Seed a specific template for this test if needed, but generic-bash exists.
    // Let's modify generic-bash content in DB for this test
    db.prepare("UPDATE templates SET content = '#!/bin/bash\necho \"{{BRANCH}}\" \"{{SCRIPT_CONTENT}}\"' WHERE id = 'generic-bash'").run();

    const flowSteps = [
      { 
        template_id: 'generic-bash', 
        params: { SCRIPT_CONTENT: 'hello world' } 
      }
    ];
    const script = prepareScript(appConfig, flowSteps);
    expect(script).toContain('#!/bin/bash');
    expect(script).toContain('hello world');
    expect(script).toContain('prod'); // Verify branching logic
  });
});