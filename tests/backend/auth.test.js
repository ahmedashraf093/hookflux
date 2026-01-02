const { login, verifyToken } = require('../../src/backend/auth');
const { db, initSchema } = require('../../src/backend/db');
const bcrypt = require('bcrypt');

describe('Authentication Logic', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    initSchema();
  });

  test('should verify a valid token', () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 1, username: 'admin' }, 'test-secret');
    const decoded = verifyToken(token);
    expect(decoded.username).toBe('admin');
  });

  test('should throw on invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});
