import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService, IUserProvider, IPreferenceProvider } from './NotificationService.js';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockUserProvider: IUserProvider;
  let mockPreferenceProvider: IPreferenceProvider;
  let mockEmailSender: any;

  beforeEach(() => {
    mockUserProvider = {
      getUserEmail: vi.fn(),
    };
    mockPreferenceProvider = {
      getPreferences: vi.fn(),
    };
    mockEmailSender = {
      sendEmail: vi.fn(),
    };

    service = new NotificationService({
      userProvider: mockUserProvider,
      preferenceProvider: mockPreferenceProvider,
      emailSender: mockEmailSender,
    });
  });

  it('sends email when enabled and user has email', async () => {
    (mockPreferenceProvider.getPreferences as any).mockResolvedValue({ EMAIL: true });
    (mockUserProvider.getUserEmail as any).mockResolvedValue('user@example.com');

    await service.notify({
      userId: 'user-1',
      channels: ['EMAIL'],
      template: { name: 'WELCOME', data: { name: 'Test User', loginUrl: 'http://localhost' } },
    });

    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
    }));
  });

  it('does NOT send email when disabled in preferences', async () => {
    (mockPreferenceProvider.getPreferences as any).mockResolvedValue({ EMAIL: false });
    (mockUserProvider.getUserEmail as any).mockResolvedValue('user@example.com');

    await service.notify({
      userId: 'user-1',
      channels: ['EMAIL'],
      template: { name: 'WELCOME', data: { name: 'Test User', loginUrl: 'http://localhost' } },
    });

    expect(mockEmailSender.sendEmail).not.toHaveBeenCalled();
  });

  it('calls custom handler for IN_APP channel', async () => {
    (mockPreferenceProvider.getPreferences as any).mockResolvedValue({ IN_APP: true });
    const handler = vi.fn();
    service.setChannelHandler('IN_APP', handler);

    await service.notify({
      userId: 'user-1',
      channels: ['IN_APP'],
      template: { name: 'WELCOME', data: { name: 'Test User', loginUrl: 'http://localhost' } },
    });

    expect(handler).toHaveBeenCalled();
  });

  it('gracefully handles one channel failing while others succeed', async () => {
    (mockPreferenceProvider.getPreferences as any).mockResolvedValue({ EMAIL: true, IN_APP: true });
    (mockUserProvider.getUserEmail as any).mockResolvedValue('user@example.com');
    
    mockEmailSender.sendEmail.mockRejectedValue(new Error('SMTP Error'));
    const inAppHandler = vi.fn();
    service.setChannelHandler('IN_APP', inAppHandler);

    await service.notify({
      userId: 'user-1',
      channels: ['EMAIL', 'IN_APP'],
      template: { name: 'WELCOME', data: { name: 'Test User', loginUrl: 'http://localhost' } },
    });

    expect(mockEmailSender.sendEmail).toHaveBeenCalled();
    expect(inAppHandler).toHaveBeenCalled();
  });
});
