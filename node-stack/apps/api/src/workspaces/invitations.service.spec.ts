import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceRepository, InvitationRepository, UserRepository, AuditLogRepository, DB_TOKEN } from '@node-stack/db';
import { vi } from 'vitest';

const mockTx: any = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  for: vi.fn(),
};
mockTx.select.mockReturnValue(mockTx);
mockTx.from.mockReturnValue(mockTx);
mockTx.where.mockReturnValue(mockTx);

vi.mock('@node-stack/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@node-stack/db')>();
  return {
    ...actual,
    withTenantTx: vi.fn(async (_id: string, cb: (tx: unknown) => unknown) => cb(mockTx)),
    withSystemTx: vi.fn(async (cb: (tx: unknown) => unknown) => cb(mockTx)),
  };
});

import { OutboxService } from '@/common/services/outbox.service.js';
import { InvitationsService } from '@/workspaces/invitations.service.js';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockWorkspaceRepo = {
    findById: vi.fn(),
    findMembership: vi.fn(),
    createMembership: vi.fn(),
  };

  const mockInvitationRepo = {
    findPendingByEmailAndWorkspace: vi.fn(),
    create: vi.fn(),
    findManyPendingByEmail: vi.fn(),
    findManyByWorkspace: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
    findByToken: vi.fn(),
    update: vi.fn(),
  };

  const mockUserRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };

  const mockAuditLog = {
    create: vi.fn(),
  };

  const mockOutbox = {
    createEvent: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: WorkspaceRepository, useValue: mockWorkspaceRepo },
        { provide: InvitationRepository, useValue: mockInvitationRepo },
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: AuditLogRepository, useValue: mockAuditLog },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: DB_TOKEN, useValue: {} },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    vi.clearAllMocks();
    // Re-attach chain after clearAllMocks
    mockTx.select.mockReturnValue(mockTx);
    mockTx.from.mockReturnValue(mockTx);
    mockTx.where.mockReturnValue(mockTx);
  });

  describe('acceptInvitation', () => {
    it('creates membership when token is valid', async () => {
      const invitation = {
        id: 'i1',
        token: 'valid-token',
        status: 'pending',
        workspaceId: 'w1',
        role: 'member',
        email: 'u1@test.com',
        expiresAt: new Date(Date.now() + 1000000),
      };

      (mockUserRepo.findById as any).mockResolvedValue({ id: 'u1', email: 'u1@test.com' });
      mockTx.for.mockResolvedValue([invitation]);
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue(null);

      const result = await service.acceptInvitation('valid-token', 'u1');

      expect(result).toMatchObject({ success: true });
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', workspaceId: 'w1' }),
        expect.anything(),
      );
      expect(mockInvitationRepo.update).toHaveBeenCalledWith('i1', { status: 'accepted' }, expect.anything());
    });

    it('throws NotFoundException when token not found', async () => {
      (mockUserRepo.findById as any).mockResolvedValue({ id: 'u1', email: 'u1@test.com' });
      mockTx.for.mockResolvedValue([]);

      await expect(service.acceptInvitation('invalid', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if user already a member', async () => {
      const invitation = {
        id: 'i1',
        status: 'pending',
        workspaceId: 'w1',
        email: 'u@t.com',
        expiresAt: new Date(Date.now() + 1000000),
      };

      (mockUserRepo.findById as any).mockResolvedValue({ id: 'u1', email: 'u@t.com' });
      mockTx.for.mockResolvedValue([invitation]);
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue({ role: 'member' });

      await expect(service.acceptInvitation('token', 'u1')).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException when invitation has expired', async () => {
      const invitation = {
        id: 'i1',
        status: 'pending',
        email: 'u@t.com',
        expiresAt: new Date(Date.now() - 1000000),
      };

      (mockUserRepo.findById as any).mockResolvedValue({ id: 'u1', email: 'u@t.com' });
      mockTx.for.mockResolvedValue([invitation]);

      await expect(service.acceptInvitation('token', 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});
