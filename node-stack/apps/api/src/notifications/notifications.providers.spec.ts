import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProviders } from './notifications.providers.js';
import { eq } from '@node-stack/db';

describe('NotificationProviders', () => {
  let providers: NotificationProviders;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      query: {
        users: {
          findFirst: vi.fn(),
        },
        notificationSettings: {
          findFirst: vi.fn(),
        },
      },
    };
    providers = new NotificationProviders(mockDb);
  });

  describe('getUserEmail', () => {
    it('returns email when user exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue({ email: 'test@example.com' });
      const email = await providers.getUserEmail('user-1');
      expect(email).toBe('test@example.com');
      expect(mockDb.query.users.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object),
      }));
    });

    it('returns null when user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);
      const email = await providers.getUserEmail('user-1');
      expect(email).toBeNull();
    });
  });

  describe('getPreferences', () => {
    it('returns settings from DB when they exist', async () => {
      mockDb.query.notificationSettings.findFirst.mockResolvedValue({
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
      });
      const prefs = await providers.getPreferences('user-1');
      expect(prefs).toEqual({
        EMAIL: true,
        PUSH: false,
        IN_APP: true,
      });
    });

    it('returns default settings when none in DB', async () => {
      mockDb.query.notificationSettings.findFirst.mockResolvedValue(null);
      const prefs = await providers.getPreferences('user-1');
      expect(prefs).toEqual({
        EMAIL: true,
        PUSH: true,
        IN_APP: true,
      });
    });
  });
});
