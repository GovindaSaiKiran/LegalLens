const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  it('should return 200 and healthy status for /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'LegalLens API');
  });

  it('should return 200 and online status for root /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
  });
});
