import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service.js';
import { TwoFactorService } from '@/auth/two-factor/two-factor.service.js';
import { SessionRepository, AuthRepository } from '@node-stack/db';
import { CacheService } from '@node-stack/cache';
import * as bcrypt from 'bcrypt';

// Mock otplib to avoid ESM export parse errors
vi.mock('otplib', () => ({
  generateSecret: vi.fn(),
  generateURI: vi.fn(),
  verify: vi.fn(),
}));

// Mock DB module before anything else
vi.mock('@node-stack/db', async () => {
  const actual = await vi.importActual<any>('@node-stack/db');
  return {
    ...actual,
    db: {
      query: {
        users: { findFirst: vi.fn() },
        sessions: { findFirst: vi.fn() },
        oauthAccounts: { findFirst: vi.fn() },
      },
      delete: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
    },
    withTransaction: vi.fn((cb) => cb({
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'u123', email: 'test@test.com', name: 'Test' }]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      query: {
        users: { findFirst: vi.fn() },
        sessions: { findFirst: vi.fn() },
        oauthAccounts: { findFirst: vi.fn() },
      },
    })),
  };
});

// Mock OutboxProducer
vi.mock('@node-stack/outbox-queue', () => ({
  OutboxProducer: {
    addProcessOutboxJob: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let sessionRepo: SessionRepository;

  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('token'),
    sign: vi.fn().mockReturnValue('token'),
    verify: vi.fn().mockReturnValue({ sub: 'u1', type: 'access', sessionId: 's1' }),
  };

  const mockConfigService = {
    get: vi.fn().mockImplementation((key) => {
      if (key === 'JWT_SECRET') return 'secret';
      return null;
    }),
  };

  const mockTwoFactorService = {
    generateTempToken: vi.fn().mockReturnValue('temp-token'),
  };

  const mockSessionRepo = {
    findActiveByUserId: vi.fn(),
    deleteById: vi.fn(),
    deleteAllExcept: vi.fn(),
  };

  const mockCacheService = {
    del: vi.fn(),
  };

  const mockAuthRepo = {
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    createSession: vi.fn(),
    createOutboxEvent: vi.fn(),
    findOAuthLink: vi.fn(),
    createOAuthAccount: vi.fn(),
    updateOAuthAccessToken: vi.fn(),
    deleteVerificationTokensByUser: vi.fn(),
    createVerificationToken: vi.fn(),
    findActiveSessionById: vi.fn(),
    rotateSession: vi.fn(),
    db: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TwoFactorService, useValue: mockTwoFactorService },
        { provide: SessionRepository, useValue: mockSessionRepo },
        { provide: AuthRepository, useValue: mockAuthRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    sessionRepo = module.get<SessionRepository>(SessionRepository);
    vi.clearAllMocks();
  });


  describe('register', () => {
    it('creates user and returns tokens when email is new', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValue(null);
      mockAuthRepo.createUser.mockResolvedValue({ id: 'u123', email: 'test@test.com', name: 'Test' });
      mockAuthRepo.createSession.mockResolvedValue({ id: 's123' });
      mockAuthRepo.createOutboxEvent.mockResolvedValue('e123');

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
      mockAuthRepo.findUserByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'taken@test.com', password: 'Pw123!', name: 'X' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'Pw123!' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct', 12);
      mockAuthRepo.findUserByEmail.mockResolvedValue({
        id: 'u1', email: 'u@t.com',
        passwordHash,
      });

      await expect(
        service.login({ email: 'u@t.com', password: 'WrongPass1!' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on successful login', async () => {
      const passwordHash = await bcrypt.hash('pass', 12);
      mockAuthRepo.findUserByEmail.mockResolvedValue({ id: 'u1', email: 'u@t.com', passwordHash });
      mockAuthRepo.findUserById.mockResolvedValue({ id: 'u1', twoFactorEnabled: false });
      mockAuthRepo.createSession.mockResolvedValue({ id: 's1' });

      const result = await service.login({ email: 'u@t.com', password: 'pass' });
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('handleOAuthLogin', () => {
    it('links OAuth to existing user when email matches', async () => {
      const oauthProfile = {
        provider: 'google' as const,
        providerAccountId: 'google-123',
        email: 'existing@test.com',
        name: 'Existing User',
        accessToken: 'at',
        refreshToken: null,
      };

      mockAuthRepo.findOAuthLink.mockResolvedValue(null);
      mockAuthRepo.findUserByEmail.mockResolvedValue({ id: 'u123', email: 'existing@test.com' });
      mockAuthRepo.createOAuthAccount.mockResolvedValue({ id: 'oa1' });
      mockAuthRepo.createSession.mockResolvedValue({ id: 's1' });
      mockAuthRepo.findUserById.mockResolvedValue({ id: 'u123' });

      const result = await service.handleOAuthLogin(oauthProfile);
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('getActiveSessions', () => {
    it('marks current session with isCurrent: true', async () => {
      (sessionRepo.findActiveByUserId as any).mockResolvedValue([
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

