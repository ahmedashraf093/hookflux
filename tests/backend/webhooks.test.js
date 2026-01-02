const { verifySignature } = require('../../src/backend/routes/webhooks');
const crypto = require('crypto');

describe('Webhook Signature Verification', () => {
  const secret = 'test-webhook-secret';
  const payload = JSON.stringify({ repository: { full_name: 'user/repo' }, ref: 'refs/heads/main' });
  const rawBody = Buffer.from(payload);

  test('should return true for valid signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    
    const req = {
      headers: { 'x-hub-signature-256': digest },
      rawBody: rawBody
    };

    expect(verifySignature(req, secret)).toBe(true);
  });

  test('should return false for invalid signature', () => {
    const req = {
      headers: { 'x-hub-signature-256': 'sha256=invalid' },
      rawBody: rawBody
    };

    expect(verifySignature(req, secret)).toBe(false);
  });

  test('should return false if secret is missing', () => {
    const req = {
      headers: { 'x-hub-signature-256': 'some-sig' },
      rawBody: rawBody
    };

    expect(verifySignature(req, null)).toBe(false);
  });
});
