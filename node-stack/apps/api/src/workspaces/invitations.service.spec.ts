import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { WorkspaceRepository, InvitationRepository, UserRepository } from '@node-stack/db';
import { OutboxService } from '../common/services/outbox.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockWorkspaceRepo = {
    findById: jest.fn(),
    findMembership: jest.fn(),
    createMembership: jest.fn(),
    transaction: jest.fn(cb => cb({})),
  };

  const mockInvitationRepo = {
    findPendingByEmailAndWorkspace: jest.fn(),
    create: jest.fn(),
    findManyPendingByEmail: jest.fn(),
    findManyByWorkspace: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findByToken: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockOutbox = {
    createEvent: jest.fn(),
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
    jest.clearAllMocks();
  });

  describe('acceptInvitation', () => {
    it('creates membership when token is valid', async () => {
      const invitation = {
        id: 'i1',
        token: 'valid-token',
        status: 'pending',
        workspaceId: 'w1',
        role: 'member',
        expiresAt: new Date(Date.now() + 1000000),
      };
      
      mockInvitationRepo.findByToken.mockResolvedValue(invitation);
      mockWorkspaceRepo.findMembership.mockResolvedValue(null);
      
      const result = await service.acceptInvitation('valid-token', 'u1');

      expect(result.success).toBe(true);
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', workspaceId: 'w1' }),
        expect.anything()
      );
      expect(mockInvitationRepo.update).toHaveBeenCalledWith('i1', { status: 'accepted' }, expect.anything());
    });

    it('throws NotFoundException when token not found', async () => {
      mockInvitationRepo.findByToken.mockResolvedValue(null);
      await expect(service.acceptInvitation('invalid', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if user already a member', async () => {
      const invitation = {
        id: 'i1',
        status: 'pending',
        workspaceId: 'w1',
        expiresAt: new Date(Date.now() + 1000000),
      };
      mockInvitationRepo.findByToken.mockResolvedValue(invitation);
      mockWorkspaceRepo.findMembership.mockResolvedValue({ role: 'member' });

      await expect(service.acceptInvitation('token', 'u1')).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException when invitation has expired', async () => {
      const invitation = {
        id: 'i1',
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000000),
      };
      mockInvitationRepo.findByToken.mockResolvedValue(invitation);

      await expect(service.acceptInvitation('token', 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});
