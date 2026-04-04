import { createApp, getRequest } from './setup';

describe('Auth (e2e)', () => {
  beforeAll(async () => { await createApp(); });

  // Flow 1: register → access profile → auth failure on me
  describe('Full auth flow', () => {
    const user = { 
      email: `e2e-${Date.now()}@test.com`,
      password: 'Password123!', 
      name: 'E2E User' 
    };
    let accessToken: string;

    it('POST /v1/auth/register creates user and returns tokens', async () => {
      const res = await getRequest()
        .post('/v1/auth/register')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken;
    });

    it('GET /v1/auth/me returns user with valid token', async () => {
      const res = await getRequest()
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(user.email.toLowerCase());
    });

    it('GET /v1/auth/me returns 401 with no token', async () => {
      await getRequest().get('/v1/auth/me').expect(401);
    });
  });

  // Flow 2: invalid payload returns 422 (Zod)
  describe('Validation', () => {
    it('POST /v1/auth/register with invalid email returns 422', async () => {
      const res = await getRequest()
        .post('/v1/auth/register')
        .send({ email: 'notanemail', password: 'weak', name: 'X' })
        .expect(422);

      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('POST /v1/auth/register with unknown field strips it silently', async () => {
      // Should not 422 on extra fields — Zod strips them if configured (default is strip)
      const res = await getRequest()
        .post('/v1/auth/register')
        .send({
          email: `strip-${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Strip Test',
          injected: 'malicious',
        })
        .expect(201);

      // Response should not contain the injected field in the user object
      expect(JSON.stringify(res.body.user)).not.toContain('malicious');
    });
  });

  // Flow 3: billing webhook with invalid HMAC returns 401
  describe('Webhook security', () => {
    it('POST /v1/billing/webhook without valid signature returns 401', async () => {
      // Note: Billing webhook might have global prefix exclusions in main.ts
      await getRequest()
        .post('/billing/webhook')
        .set('polar-signature', 'invalid-sig')
        .send({ type: 'subscription.created' })
        .expect(401);
    });
  });
});
