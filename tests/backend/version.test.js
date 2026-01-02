const { getVersionInfo, isNewer } = require('../../src/backend/version');
const fs = require('fs');
const path = require('path');

describe('Version Logic', () => {
  test('isNewer should correctly compare versions', () => {
    expect(isNewer('0.2.7', '0.2.6')).toBe(true);
    expect(isNewer('1.0.0', '0.9.9')).toBe(true);
    expect(isNewer('0.2.6', '0.2.7')).toBe(false);
    expect(isNewer('0.2.6', '0.2.6')).toBe(false);
    expect(isNewer('v0.2.7', '0.2.6')).toBe(true);
    expect(isNewer('0.2.10', '0.2.9')).toBe(true);
  });

  test('isNewer should handle different lengths', () => {
    expect(isNewer('1.0', '1.0.0')).toBe(false);
    expect(isNewer('1.0.1', '1.0')).toBe(true);
  });
});
