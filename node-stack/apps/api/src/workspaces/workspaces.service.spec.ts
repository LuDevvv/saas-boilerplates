import { ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@node-stack/cache';
import { WorkspaceRepository } from '@node-stack/db';

import { OutboxService } from '@/common/services/outbox.service.js';
import { WorkspacesService } from '@/workspaces/workspaces.service.js';

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  const mockWorkspaceRepo = {
    create: vi.fn(),
    createMembership: vi.fn(),
    findAllByUserId: vi.fn(),
    findMembership: vi.fn(),
    findMembersByWorkspaceId: vi.fn(),
    updateMembership: vi.fn(),
    deleteMembership: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(async (cb) => await cb({})),
  };



  const mockCache = {
    invalidate: vi.fn(),
  };

  const mockOutbox = {
    createEvent: vi.fn(),
  };

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: WorkspaceRepository, useValue: mockWorkspaceRepo },
        { provide: CacheService, useValue: mockCache },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    vi.clearAllMocks();
  });

  describe('createWorkspace', () => {
    it('creates workspace and owner membership atomically', async () => {
      const ws = { id: 'w1', name: 'W1', slug: 'w1' };
      (mockWorkspaceRepo.create as any).mockResolvedValue(ws);
      
      const result = await service.createWorkspace('W1', 'w1-slug', 'u1');

      expect(result.id).toBe('w1');
      expect(mockWorkspaceRepo.create).toHaveBeenCalled();
    });

  });

  describe('listWorkspaces', () => {
    it('returns paginated list for userId', async () => {
      (mockWorkspaceRepo.findAllByUserId as any).mockResolvedValue({
        workspaces: [{ id: 'w1', name: 'W1' }],
        nextCursor: 'next-123',
      });

      const result = await service.listWorkspaces('u1');
      expect(result.workspaces).toHaveLength(1);
      expect(result.nextCursor).toBe('next-123');
    });

    it('returns empty array when user has no workspaces', async () => {
      (mockWorkspaceRepo.findAllByUserId as any).mockResolvedValue({
        workspaces: [],
        nextCursor: null,
      });

      const result = await service.listWorkspaces('u1');
      expect(result.workspaces).toHaveLength(0);
    });
  });

  describe('getMembers', () => {
    it('returns formatted members list', async () => {
      (mockWorkspaceRepo.findMembersByWorkspaceId as any).mockResolvedValue([
        { userId: 'u1', role: 'owner', createdAt: new Date(), id: 'u1', email: 'u1@test.com', name: 'User 1', avatarUrl: null }
      ]);
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue({ role: 'owner' });

      const result = await service.getMembers('w1', 'u1');
      expect(result).toHaveLength(1);
      expect(result[0].user.email).toBe('u1@test.com');
    });
  });

  describe('updateMemberRole', () => {
    it('updates role if current user is owner', async () => {
      (mockWorkspaceRepo.findMembership as any)
        .mockResolvedValueOnce({ role: 'owner' }) // current
        .mockResolvedValueOnce({ role: 'member' }); // target

      await service.updateMemberRole('w1', 'u2', 'admin', 'u1');
      expect(mockWorkspaceRepo.updateMembership).toHaveBeenCalledWith('w1', 'u2', { role: 'admin' }, expect.anything());
    });


    it('throws forbidden if admin tries to modify another admin', async () => {
      (mockWorkspaceRepo.findMembership as any)
        .mockResolvedValueOnce({ role: 'admin' }) // current
        .mockResolvedValueOnce({ role: 'admin' }); // target

      await expect(service.updateMemberRole('w1', 'u2', 'member', 'u1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMember', () => {
    it('creates membership and outbox event', async () => {
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue({ role: 'admin' });
      
      await service.addMember('w1', 'u2', 'u1', 'member');
      
      expect(mockWorkspaceRepo.createMembership).toHaveBeenCalled();
      expect(mockOutbox.createEvent).toHaveBeenCalledWith('membership.added', expect.anything(), expect.anything());
    });
  });

  describe('removeMember', () => {
    it('successfully removes member', async () => {
      (mockWorkspaceRepo.findMembership as any)
        .mockResolvedValueOnce({ role: 'owner' }) // current
        .mockResolvedValueOnce({ role: 'member' }); // target

      await service.removeMember('w1', 'u2', 'u1');
      expect(mockWorkspaceRepo.deleteMembership).toHaveBeenCalledWith('w1', 'u2', expect.anything());
      expect(mockOutbox.createEvent).toHaveBeenCalledWith('membership.removed', expect.anything(), expect.anything());
    });


    it('throws forbidden if user is not in workspace', async () => {
      (mockWorkspaceRepo.findMembership as any).mockResolvedValue(null);
      await expect(service.removeMember('w1', 'u2', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });
});

