const request = require('supertest');
const app = require('../src/app');

describe('Security & Middleware Architecture', () => {
  it('includes essential Helmet security headers in HTTP responses', async () => {
    const res = await request(app).get('/api/health');

    // Helmet security headers
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
  });

  it('handles 404 for unknown API routes with structured JSON error', async () => {
    const res = await request(app).get('/api/non-existent-endpoint-12345');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects unauthenticated requests to protected profile routes', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
