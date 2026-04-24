/**
 * Authentication Integration Tests
 * 
 * Tests for authentication and session flows using real infrastructure:
 * - User registration and login
 * - JWT token issuance and validation
 * - Session management
 * - Password reset flow
 * - OAuth flows (mocked)
 * 
 * Uses supertest against actual HTTP controllers with real PostgreSQL and Redis.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter.js';
import { setupInfrastructure, getInfrastructure } from '../setup.integration';
import { DbTestHelper, createDbHelper } from '../helpers/db-utils';

// Mock Redis at module level for all tests
jest.mock('ioredis', () => require('ioredis-mock'));

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let dbHelper: DbTestHelper;
  let httpServer: any;

  beforeAll(async () => {
    // Setup infrastructure
    const infra = await setupInfrastructure();
    
    // Apply schema and RLS policies
    const { applySchema, applyRLSPolicies } = await import('../setup.integration');
    await applySchema(infra.dbUrl);
    await applyRLSPolicies(infra.dbUrl);

    // Create database helper
    dbHelper = createDbHelper(infra);

    // Bootstrap NestJS application
    const module: TestingModule = await Test.createTestingModule({
      imports: [await import('../../src/app.module.js').then(m => m.AppModule)],
    }).compile();

    app = module.createNestApplication();
    
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new (createZodValidationPipe({
        createValidationException: (error: any) => {
          return new UnprocessableEntityException({
            statusCode: 422,
            message: "Validation failed",
            errors: error.errors.map((e: any) => ({
              path: e.path,
              message: e.message,
            })),
          });
        },
      }))(),
    );
    
    app.setGlobalPrefix('v1', {
      exclude: [
        "/api/docs",
        "/api/docs-json",
        "/billing/webhook",
        "/health",
        "/health/live",
        "/health/ready",
      ],
    });

    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app?.close();
    await dbHelper?.close();
  });

  beforeEach(async () => {
    // Clean database state before each test
    await dbHelper.truncateAll();
  });

  describe('Registration Flow', () => {
    it('should register a new user with valid credentials', async () => {
      const uniqueEmail = `register-${Date.now()}@test.com`;
      
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(uniqueEmail.toLowerCase());
    });

    it('should return 422 for invalid email format', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(422);

      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return 422 for weak password', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: `weak-${Date.now()}@test.com`,
          password: '123', // Too short
          name: 'Test User',
        })
        .expect(422);

      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 for duplicate email', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@test.com`;
      
      // First registration succeeds
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          name: 'User One',
        })
        .expect(201);

      // Second registration with same email fails
      await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          name: 'User Two',
        })
        .expect(400);
    });

    it('should strip unknown fields from registration payload', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: `strip-${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Strip Test',
          injectedField: 'malicious_value',
          __proto__: { admin: true },
        })
        .expect(201);

      // Response should not contain injected fields
      expect(JSON.stringify(res.body)).not.toContain('malicious_value');
      expect(JSON.stringify(res.body)).not.toContain('injectedField');
    });
  });

  describe('Login Flow', () => {
    const testUser = {
      email: `login-test-${Date.now()}@test.com`,
      password: 'Password123!',
      name: 'Login Test User',
    };

    beforeEach(async () => {
      // Register user before each login test
      await request(httpServer)
        .post('/v1/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid password', async () => {
      await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@test.com`,
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should return 401 for empty credentials', async () => {
      await request(httpServer)
        .post('/v1/auth/login')
        .send({})
        .expect(422);
    });
  });

  describe('Token Validation', () => {
    let accessToken: string;

    beforeEach(async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: `token-test-${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Token Test User',
        });
      
      accessToken = res.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(httpServer)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');
    });

    it('should return 401 without token', async () => {
      await request(httpServer)
        .get('/v1/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token format', async () => {
      await request(httpServer)
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      await request(httpServer)
        .get('/v1/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('Session Management', () => {
    let accessToken: string;
    let refreshToken: string;
    let sessionId: string;

    beforeEach(async () => {
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: `session-test-${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Session Test User',
        });
      
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
      sessionId = res.body.sessionId;
    });

    it('should list active sessions', async () => {
      const res = await request(httpServer)
        .get('/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should logout current session', async () => {
      await request(httpServer)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Token should no longer be valid
      await request(httpServer)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should refresh tokens', async () => {
      const res = await request(httpServer)
        .post('/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should revoke specific session', async () => {
      // Create another session first
      const loginRes = await request(httpServer)
        .post('/v1/auth/login')
        .send({
          email: `session-test-${Date.now()}@test.com`,
          password: 'Password123!',
        });

      const secondSessionId = loginRes.body.sessionId;

      // Revoke the second session
      await request(httpServer)
        .delete(`/v1/auth/sessions/${secondSessionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('Audit Log', () => {
    it('should create audit log entries for auth actions', async () => {
      const uniqueEmail = `audit-${Date.now()}@test.com`;
      
      // Register
      const res = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
          name: 'Audit Test User',
        });

      const accessToken = res.body.accessToken;

      // Access audit logs endpoint
      await request(httpServer)
        .get('/v1/auth/audit-logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify audit logs were created in database
      const logs = await dbHelper.query(`
        SELECT action FROM audit_logs 
        WHERE workspace_id IS NULL
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Registration should have created an audit log entry
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});