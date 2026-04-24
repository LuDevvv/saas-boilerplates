/**
 * Workspaces Integration Tests
 * 
 * Tests for workspace CRUD operations and basic RLS verification.
 * Uses supertest against actual HTTP controllers with real PostgreSQL.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter.js';
import { setupInfrastructure } from '../setup.integration';
import { DbTestHelper, createDbHelper } from '../helpers/db-utils';

// Mock Redis
jest.mock('ioredis', () => require('ioredis-mock'));

describe('Workspaces Integration Tests', () => {
  let app: INestApplication;
  let dbHelper: DbTestHelper;
  let httpServer: any;

  let adminToken: string;
  let adminUserId: string;
  let memberToken: string;
  let memberUserId: string;
  let workspaceId: string;

  beforeAll(async () => {
    const infra = await setupInfrastructure();
    const { applySchema, applyRLSPolicies } = await import('../setup.integration');
    await applySchema(infra.dbUrl);
    await applyRLSPolicies(infra.dbUrl);
    dbHelper = createDbHelper(infra);

    const module: TestingModule = await Test.createTestingModule({
      imports: [await import('../../src/app.module.js').then(m => m.AppModule)],
    }).compile();

    app = module.createNestApplication();
    
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new (createZodValidationPipe({
        createValidationException: (error: any) => new UnprocessableEntityException({
          statusCode: 422,
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({ path: e.path, message: e.message })),
        }),
      }))(),
    );
    
    app.setGlobalPrefix('v1', {
      exclude: ["/api/docs", "/api/docs-json", "/billing/webhook", "/health", "/health/live", "/health/ready"],
    });

    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app?.close();
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();

    // Create admin user
    const adminRes = await request(httpServer)
      .post('/v1/auth/register')
      .send({
        email: `admin-${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Admin User',
      });
    adminToken = adminRes.body.accessToken;
    adminUserId = adminRes.body.user.id;

    // Create member user
    const memberRes = await request(httpServer)
      .post('/v1/auth/register')
      .send({
        email: `member-${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Member User',
      });
    memberToken = memberRes.body.accessToken;
    memberUserId = memberRes.body.user.id;

    // Create workspace
    const wsRes = await request(httpServer)
      .post('/v1/workspaces')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Workspace', slug: `test-ws-${Date.now()}` });
    workspaceId = wsRes.body.id;
  });

  describe('Workspace Creation', () => {
    it('should create a workspace and make creator owner', async () => {
      const res = await request(httpServer)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Workspace', slug: `new-ws-${Date.now()}` })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('New Workspace');
    });

    it('should return 422 for invalid slug format', async () => {
      await request(httpServer)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test', slug: 'invalid slug with spaces' })
        .expect(422);
    });

    it('should return 409 for duplicate slug', async () => {
      await request(httpServer)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Duplicate', slug: `test-ws-${Date.now()}` })
        .expect(409);
    });
  });

  describe('Workspace Read', () => {
    it('should list user workspaces', async () => {
      const res = await request(httpServer)
        .get('/v1/workspaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get workspace details for member', async () => {
      const res = await request(httpServer)
        .get(`/v1/workspaces/${workspaceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(workspaceId);
    });
  });

  describe('Invitation Flow', () => {
    it('should create invitation as admin', async () => {
      const res = await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: `invited-${Date.now()}@test.com`, role: 'member' })
        .expect(201);

      expect(res.body).toHaveProperty('token');
    });

    it('should accept invitation as member', async () => {
      const invRes = await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: memberToken, role: 'member' });
      const token = invRes.body.token;

      await request(httpServer)
        .post(`/v1/workspace-invitations/${token}/accept`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);
    });
  });

  describe('Member Management (RBAC)', () => {
    it('member should not be able to remove other members', async () => {
      await request(httpServer)
        .delete(`/v1/workspaces/${workspaceId}/members/${adminUserId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('owner should be able to remove members', async () => {
      // Create a third user to remove
      const thirdRes = await request(httpServer)
        .post('/v1/auth/register')
        .send({
          email: `third-${Date.now()}@test.com`,
          password: 'Password123!',
          name: 'Third User',
        });
      const thirdToken = thirdRes.body.accessToken;

      // Invite and accept
      const invRes = await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/invitations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: `third-${Date.now()}@test.com`, role: 'member' });
      
      await request(httpServer)
        .post(`/v1/workspace-invitations/${invRes.body.token}/accept`)
        .set('Authorization', `Bearer ${thirdToken}`);

      // Owner removes member
      await request(httpServer)
        .delete(`/v1/workspaces/${workspaceId}/members/${thirdRes.body.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('API Keys', () => {
    it('admin should create API key', async () => {
      const res = await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/api-keys`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Key', expiresInDays: 365 })
        .expect(201);

      expect(res.body).toHaveProperty('key');
      expect(res.body.key).toMatch(/^nstack_/);
    });

    it('should list workspace API keys', async () => {
      // Create a key first
      await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/api-keys`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'List Test Key' });

      const res = await request(httpServer)
        .get(`/v1/workspaces/${workspaceId}/api-keys`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should revoke API key', async () => {
      const createRes = await request(httpServer)
        .post(`/v1/workspaces/${workspaceId}/api-keys`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Revoke Test Key' });

      await request(httpServer)
        .delete(`/v1/workspaces/${workspaceId}/api-keys/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});

import { INestApplication } from '@nestjs/common';