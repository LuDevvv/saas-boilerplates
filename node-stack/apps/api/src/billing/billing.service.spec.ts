import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { ConfigService } from '@nestjs/config';
import { OutboxService } from '../common/services/outbox.service';
import { PolarProvider } from '@node-stack/billing-adapter';
import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';

// Mock PolarProvider
jest.mock('@node-stack/billing-adapter', () => ({
  PolarProvider: jest.fn().mockImplementation(() => ({
    createCheckoutSession: jest.fn(),
    handleWebhook: jest.fn(),
  })),
}));

describe('BillingService', () => {
  let service: BillingService;
  let polarProvider: any;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'POLAR_WEBHOOK_SECRET') return 'secret';
      if (key === 'POLAR_ACCESS_TOKEN') return 'token';
      return null;
    }),
  };

  const mockOutbox = {
    createEvent: jest.fn(),
    transaction: jest.fn(cb => cb({})),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OutboxService, useValue: mockOutbox },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    polarProvider = (service as any).polarProvider;
    jest.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('calls payment provider and writes outbox event', async () => {
      polarProvider.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.test',
        expiresAt: '2026-01-01',
      });

      const result = await service.createCheckout({
        planId: 'plan-1',
        successUrl: 'https://success',
        cancelUrl: 'https://cancel',
        workspaceId: 'w1',
        userId: 'u1',
      });

      expect(result.url).toBe('https://checkout.test');
      expect(polarProvider.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ planId: 'plan-1', metadata: { workspace_id: 'w1', user_id: 'u1' } })
      );
      expect(mockOutbox.createEvent).toHaveBeenCalledWith(
        'checkout.created',
        expect.objectContaining({ checkoutUrl: 'https://checkout.test', workspaceId: 'w1' }),
        expect.anything()
      );
    });
  });

  describe('verifyWebhook', () => {
    it('throws UnauthorizedException on signature mismatch', async () => {
      const headers = { 'polar-signature': 'wrong' };
      const rawBody = '{"event":"test"}';

      await expect(service.verifyWebhook(headers, rawBody))
        .rejects.toThrow(UnauthorizedException);
    });

    it('returns event on valid signature', async () => {
      const rawBody = '{"type":"checkout.created"}';
      const signature = createHmac('sha256', 'secret').update(rawBody).digest('hex');
      const headers = { 'polar-signature': signature };

      polarProvider.handleWebhook.mockResolvedValue({ type: 'checkout.created' });

      const result = await service.verifyWebhook(headers, rawBody);
      expect(result.type).toBe('checkout.created');
      expect(polarProvider.handleWebhook).toHaveBeenCalledWith({ type: 'checkout.created' });
    });
  });
});
