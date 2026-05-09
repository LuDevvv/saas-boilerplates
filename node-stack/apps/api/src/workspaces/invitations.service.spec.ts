import { NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceRepository, InvitationRepository, UserRepository } from '@node-stack/db';

import { OutboxService } from '@/common/services/outbox.service.js';
import { InvitationsService } from '@/workspaces/invitations.service.js';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockWorkspaceRepo = {
    findById: vi.fn(),
    findMembership: vi.fn(),
    createMembership: vi.fn(),
    transaction: vi.fn(cb => cb({})),
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
        { provide: OutboxService, useValue: mockOutbox },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    vi.clearAllMocks();
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
      (mockInvitationRepo.findByToken as any).mockResolvedValue(invitation);
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue(null);
      
      // Mock tx for row lock
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([invitation]),
      };
      (mockWorkspaceRepo.transaction as any).mockImplementation(async (cb: any) => cb(mockTx));
      
      const result = await service.acceptInvitation('valid-token', 'u1');

      expect(result.success).toBe(true);
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', workspaceId: 'w1' }),
        expect.anything()
      );
      expect(mockInvitationRepo.update).toHaveBeenCalledWith('i1', { status: 'accepted' }, expect.anything());
    });

    it('throws NotFoundException when token not found', async () => {
      (mockUserRepo.findById as any).mockResolvedValue({ id: 'u1', email: 'u1@test.com' });
      
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([]), // Return empty array
      };
      (mockWorkspaceRepo.transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

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
      (mockInvitationRepo.findByToken as any).mockResolvedValue(invitation);
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue({ role: 'member' });

      // Mock tx for row lock
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([invitation]),
      };
      (mockWorkspaceRepo.transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

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
      (mockInvitationRepo.findByToken as any).mockResolvedValue(invitation);

      // Mock tx for row lock
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([invitation]),
      };
      (mockWorkspaceRepo.transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

      await expect(service.acceptInvitation('token', 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});

