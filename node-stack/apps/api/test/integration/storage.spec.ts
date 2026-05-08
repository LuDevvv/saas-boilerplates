/**
 * Storage Integration Tests
 * 
 * Tests for file management flows:
 * - Requesting presigned upload URLs
 * - Confirming uploads
 * - Retrieving download URLs
 * - RLS verification for files
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter.js';
import { DbTestHelper, createDbHelper } from '../helpers/db-utils.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
import path from 'path';

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

describe('Storage Integration Tests', () => {
  let app: INestApplication;
  let dbHelper: DbTestHelper;
  let httpServer: any;
  const storagePath = path.join(process.cwd(), 'test-storage');

  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    // Infrastructure setup
    const dbUrl = process.env.DATABASE_URL!;
    
    // Provide mock env vars
    process.env.GOOGLE_CLIENT_ID = 'dummy';
    process.env.GOOGLE_CLIENT_SECRET = 'dummy';
    process.env.GOOGLE_CALLBACK_URL = 'dummy';
    process.env.GITHUB_CLIENT_ID = 'dummy';
    process.env.GITHUB_CLIENT_SECRET = 'dummy';
    process.env.GITHUB_CALLBACK_URL = 'dummy';
    process.env.API_KEY_PEPPER = 'dummy';
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.JWT_SECRET = 'test-secret-at-least-16-chars-long';
    process.env.STORAGE_PROVIDER = 'local';
    process.env.STORAGE_LOCAL_PATH = storagePath;
    process.env.REDIS_URL = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

    if (!existsSync(storagePath)) {
      mkdirSync(storagePath, { recursive: true });
    }

    const infra = { dbUrl } as any;
    dbHelper = createDbHelper(infra);

    const module: TestingModule = await Test.createTestingModule({
      imports: [await import('../../src/app.module.js').then(m => m.AppModule)],
    })
    .overrideProvider('STORAGE_SERVICE').useValue({
      getUploadUrl: vi.fn().mockResolvedValue('http://mock-upload-url'),
      getDownloadUrl: vi.fn().mockImplementation((key) => Promise.resolve(`http://mock-download-url/${key}`)),
      // Default: report a tiny text payload that matches the
      // declared size + MIME used by the confirm-upload spec.
      headObject: vi.fn().mockResolvedValue({ contentLength: 100, contentType: 'text/plain' }),
      // 'hello world from test\n' as printable-text magic-byte probe.
      getObjectBytes: vi.fn().mockResolvedValue(new TextEncoder().encode('hello world from test\n')),
      delete: vi.fn().mockResolvedValue(undefined),
    })
    .compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new (createZodValidationPipe({
        createValidationException: (error: any) => new UnprocessableEntityException({
          statusCode: 422,
          message: "Validation failed",
          errors: Array.isArray(error.errors) ? error.errors.map((e: any) => ({ path: e.path, message: e.message })) : [],
        }),
      }))(),
    );
    app.setGlobalPrefix('v1');
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app?.close();
    await dbHelper?.close();
    if (existsSync(storagePath)) {
      rmSync(storagePath, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();

    // Register admin user
    const adminRes = await request(httpServer)
      .post('/v1/auth/register')
      .send({
        email: 'storage-admin@test.com',
        password: 'Password123!',
        name: 'Storage Admin',
      });
    adminToken = adminRes.body.accessToken;

    // Create workspace
    const wsRes = await request(httpServer)
      .post('/v1/workspaces')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Storage WS',
        slug: 'storage-ws-' + Date.now(),
      });
    workspaceId = wsRes.body.id;
  });

  describe('Presigned URLs', () => {
    it('should generate a presigned upload URL', async () => {
      const res = await request(httpServer)
        .post('/v1/storage/upload-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-workspace-id', workspaceId)
        .send({
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          context: 'attachment',
        })
        .expect(201);

      expect(res.body.url).toBeDefined();
      expect(res.body.fileId).toBeDefined();
    });

    it('should fail if file size exceeds limit (simulated)', async () => {
      await request(httpServer)
        .post('/v1/storage/upload-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-workspace-id', workspaceId)
        .send({
          fileName: 'huge.iso',
          mimeType: 'application/octet-stream',
          fileSize: 10 * 1024 * 1024 * 1024, // 10GB
          context: 'attachment',
        })
        .expect(422);
    });
  });

  describe('Upload Confirmation', () => {
    it('should confirm a successful upload', async () => {
      // 1. Get URL
      const urlRes = await request(httpServer)
        .post('/v1/storage/upload-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-workspace-id', workspaceId)
        .send({
          fileName: 'upload.txt',
          mimeType: 'text/plain',
          fileSize: 100,
          context: 'attachment',
        });

      const fileId = urlRes.body.fileId;

      // 2. Confirm 
      const res = await request(httpServer)
        .post('/v1/storage/confirm-upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-workspace-id', workspaceId)
        .send({ fileId })
        .expect(201);

      expect(res.body.status).toBe('uploaded');
    });
  });

  describe('File Retrieval', () => {
    it('should get a download URL for an existing file', async () => {
      // Seed a file
      const fileId = generateUuid();
      await dbHelper.query(`
        INSERT INTO files (id, workspace_id, user_id, name, key, size, mime_type, provider, status)
        VALUES ('${fileId}', '${workspaceId}', (SELECT id FROM users LIMIT 1), 'manual.pdf', 'keys/manual.pdf', 2048, 'application/pdf', 'local', 'uploaded')
      `);

      const res = await request(httpServer)
        .get(`/v1/storage/${fileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-workspace-id', workspaceId)
        .expect(200);

      expect(res.body.url).toContain('mock-download-url');
    });

    it('should block access to files from another workspace', async () => {
      // 1. Create Tenant B
      const resB = await request(httpServer)
        .post('/v1/auth/register')
        .send({ email: 'tenant-b@test.com', password: 'Password123!', name: 'Tenant B' });
      const tokenB = resB.body.accessToken;

      const wsB = await request(httpServer)
        .post('/v1/workspaces')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'WS B', slug: 'ws-b-' + Date.now() });
      const workspaceIdB = wsB.body.id;

      // 2. Seed file in Workspace A
      const fileIdA = generateUuid();
      await dbHelper.query(`
        INSERT INTO files (id, workspace_id, user_id, name, key, size, mime_type, provider, status)
        VALUES ('${fileIdA}', '${workspaceId}', (SELECT id FROM users WHERE email = 'storage-admin@test.com'), 'secret.pdf', 'keys/secret.pdf', 1024, 'application/pdf', 'local', 'uploaded')
      `);

      // 3. Try to access from Tenant B
      await request(httpServer)
        .get(`/v1/storage/${fileIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .set('x-workspace-id', workspaceIdB)
        .expect(404);
    });
  });
});
