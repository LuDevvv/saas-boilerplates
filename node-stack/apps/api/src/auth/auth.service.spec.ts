import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { TwoFactorService } from './two-factor/two-factor.service.js';
import { SessionRepository } from '@node-stack/db';
import { CacheService } from '@node-stack/cache';
import * as bcrypt from 'bcrypt';

// Mock otplib to avoid ESM export parse errors in jest
jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verify: jest.fn(),
}));

// Mock DB module before anything else
jest.mock('@node-stack/db', () => {
  const actual = jest.requireActual('@node-stack/db');
  return {
    ...actual,
    db: {
      query: {
        users: { findFirst: jest.fn() },
        sessions: { findFirst: jest.fn() },
        oauthAccounts: { findFirst: jest.fn() },
      },
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    },
    withTransaction: jest.fn((cb) => cb({
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'u123', email: 'test@test.com', name: 'Test' }]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      query: {
        users: { findFirst: jest.fn() },
        sessions: { findFirst: jest.fn() },
        oauthAccounts: { findFirst: jest.fn() },
      },
    })),
  };
});

// Mock OutboxProducer
jest.mock('@node-stack/outbox-queue', () => ({
  OutboxProducer: {
    addProcessOutboxJob: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let sessionRepo: SessionRepository;

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn().mockReturnValue({ sub: 'u1', type: 'access', sessionId: 's1' }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'JWT_SECRET') return 'secret';
      return null;
    }),
  };

  const mockTwoFactorService = {
    generateTempToken: jest.fn().mockReturnValue('temp-token'),
  };

  const mockSessionRepo = {
    findActiveByUserId: jest.fn(),
    deleteById: jest.fn(),
    deleteAllExcept: jest.fn(),
  };

  const mockCacheService = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TwoFactorService, useValue: mockTwoFactorService },
        { provide: SessionRepository, useValue: mockSessionRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    sessionRepo = module.get<SessionRepository>(SessionRepository);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and returns tokens when email is new', async () => {
      const { db } = require('@node-stack/db');
      db.query.users.findFirst.mockResolvedValue(null);

      const result = await service.register({
        email: 'test@test.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@test.com');
    });

    it('throws ConflictException when email already exists', async () => {
      const { db } = require('@node-stack/db');
      db.query.users.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'taken@test.com', password: 'Pw123!', name: 'X' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      const { db } = require('@node-stack/db');
      db.query.users.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'Pw123!' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const { db } = require('@node-stack/db');
      const passwordHash = await bcrypt.hash('correct', 12);
      db.query.users.findFirst.mockResolvedValue({
        id: 'u1', email: 'u@t.com',
        passwordHash,
      });

      await expect(
        service.login({ email: 'u@t.com', password: 'WrongPass1!' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on successful login', async () => {
      const { db } = require('@node-stack/db');
      const passwordHash = await bcrypt.hash('pass', 12);
      db.query.users.findFirst.mockResolvedValueOnce({ id: 'u1', email: 'u@t.com', passwordHash });
      db.query.users.findFirst.mockResolvedValueOnce({ id: 'u1', twoFactorEnabled: false });

      const result = await service.login({ email: 'u@t.com', password: 'pass' });
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('handleOAuthLogin', () => {
    it('links OAuth to existing user when email matches', async () => {
      const { withTransaction } = require('@node-stack/db');
      const oauthProfile = {
        provider: 'google' as const,
        providerAccountId: 'google-123',
        email: 'existing@test.com',
        name: 'Existing User',
        accessToken: 'at',
        refreshToken: null,
      };

      // Mock transaction query for existing user but NO existing link
      withTransaction.mockImplementationOnce(async (cb: any) => {
        const tx = {
          query: {
            oauthAccounts: { findFirst: jest.fn().mockResolvedValue(null) },
            users: { findFirst: jest.fn().mockResolvedValue({ id: 'u123', email: 'existing@test.com' }) },
          },
          insert: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ id: 'u123' }]),
        };
        return cb(tx);
      });

      const result = await service.handleOAuthLogin(oauthProfile);
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('getActiveSessions', () => {
    it('marks current session with isCurrent: true', async () => {
      (sessionRepo.findActiveByUserId as jest.Mock).mockResolvedValue([
        { id: 'sess-1', userId: 'u1', createdAt: new Date(), expiresAt: new Date(Date.now() + 1000000) },
        { id: 'sess-2', userId: 'u1', createdAt: new Date(), expiresAt: new Date(Date.now() + 1000000) },
      ]);

      const sessions = await service.getActiveSessions('u1', 'sess-1');
      const current = sessions.find(s => s.isCurrent);

      expect(current).toBeDefined();
      expect(current!.id).toBe('sess-1');
      expect(sessions.filter(s => !s.isCurrent)).toHaveLength(1);
    });
  });
});
