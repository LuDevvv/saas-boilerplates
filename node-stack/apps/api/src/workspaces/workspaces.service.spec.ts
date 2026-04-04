import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceRepository } from '@node-stack/db';
import { CacheService } from '@node-stack/cache';
import { OutboxService } from '../common/services/outbox.service';
import { ForbiddenException } from '@nestjs/common';

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  const mockWorkspaceRepo = {
    create: jest.fn(),
    createMembership: jest.fn(),
    findAllByUserId: jest.fn(),
    findMembership: jest.fn(),
    findMembersByWorkspaceId: jest.fn(),
    updateMembership: jest.fn(),
    deleteMembership: jest.fn(),
    transaction: jest.fn(cb => cb({})),
  };

  const mockCache = {
    invalidate: jest.fn(),
  };

  const mockOutbox = {
    createEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: WorkspaceRepository, useValue: mockWorkspaceRepo },
        { provide: CacheService, useValue: mockCache },
        { provide: OutboxService, useValue: mockOutbox },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  describe('createWorkspace', () => {
    it('creates workspace and owner membership atomically', async () => {
      mockWorkspaceRepo.create.mockResolvedValue({ id: 'w1', name: 'W1', slug: 'w1' });
      
      const result = await service.createWorkspace('W1', 'w1-slug', 'u1');

      expect(result.id).toBe('w1');
      expect(mockWorkspaceRepo.create).toHaveBeenCalled();
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'owner', userId: 'u1' }),
        expect.anything()
      );
      expect(mockOutbox.createEvent).toHaveBeenCalledWith('workspace.created', expect.anything(), expect.anything());
    });
  });

  describe('listWorkspaces', () => {
    it('returns paginated list for userId', async () => {
      mockWorkspaceRepo.findAllByUserId.mockResolvedValue({
        workspaces: [{ id: 'w1', name: 'W1' }],
        nextCursor: 'next-123',
      });

      const result = await service.listWorkspaces('u1');
      expect(result.workspaces).toHaveLength(1);
      expect(result.nextCursor).toBe('next-123');
    });

    it('returns empty array when user has no workspaces', async () => {
      mockWorkspaceRepo.findAllByUserId.mockResolvedValue({
        workspaces: [],
        nextCursor: null,
      });

      const result = await service.listWorkspaces('u1');
      expect(result.workspaces).toHaveLength(0);
    });
  });

  describe('getMembers', () => {
    it('returns formatted members list', async () => {
      mockWorkspaceRepo.findMembersByWorkspaceId.mockResolvedValue([
        { userId: 'u1', role: 'owner', createdAt: new Date(), id: 'u1', email: 'u1@test.com', name: 'User 1', avatarUrl: null }
      ]);
      mockWorkspaceRepo.findMembership.mockResolvedValue({ role: 'owner' });

      const result = await service.getMembers('w1', 'u1');
      expect(result).toHaveLength(1);
      expect(result[0].user.email).toBe('u1@test.com');
    });
  });

  describe('updateMemberRole', () => {
    it('updates role if current user is owner', async () => {
      mockWorkspaceRepo.findMembership
        .mockResolvedValueOnce({ role: 'owner' }) // current
        .mockResolvedValueOnce({ role: 'member' }); // target

      await service.updateMemberRole('w1', 'u2', 'admin', 'u1');
      expect(mockWorkspaceRepo.updateMembership).toHaveBeenCalledWith('w1', 'u2', { role: 'admin' });
    });

    it('throws forbidden if admin tries to modify another admin', async () => {
      mockWorkspaceRepo.findMembership
        .mockResolvedValueOnce({ role: 'admin' }) // current
        .mockResolvedValueOnce({ role: 'admin' }); // target

      await expect(service.updateMemberRole('w1', 'u2', 'member', 'u1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMember', () => {
    it('creates membership and outbox event', async () => {
      mockWorkspaceRepo.findMembership.mockResolvedValue({ role: 'admin' });
      
      await service.addMember('w1', 'u2', 'u1', 'member');
      
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalled();
      expect(mockOutbox.createEvent).toHaveBeenCalledWith('membership.added', expect.anything(), expect.anything());
    });
  });

  describe('removeMember', () => {
    it('successfully removes member', async () => {
      mockWorkspaceRepo.findMembership
        .mockResolvedValueOnce({ role: 'owner' }) // current
        .mockResolvedValueOnce({ role: 'member' }); // target

      await service.removeMember('w1', 'u2', 'u1');
      expect(mockWorkspaceRepo.deleteMembership).toHaveBeenCalled();
      expect(mockOutbox.createEvent).toHaveBeenCalledWith('membership.removed', expect.anything(), expect.anything());
    });

    it('throws forbidden if user is not in workspace', async () => {
      mockWorkspaceRepo.findMembership.mockResolvedValue(null);
      await expect(service.removeMember('w1', 'u2', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });
});
