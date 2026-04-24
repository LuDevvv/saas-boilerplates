/**
 * Mock Adapters for External Services
 * 
 * Provides mock implementations for:
 * - Polar.sh Billing Adapter
 * - AI Service Adapter
 * 
 * These mocks intercept calls during integration tests while still
 * allowing the full controller → service → repository → outbox chain to execute.
 */

import { vi } from 'vitest';

// ============================================
// Billing Adapter Mocks
// ============================================

export interface MockBillingConfig {
  shouldFail?: boolean;
  mockSubscriptionId?: string;
  mockCustomerId?: string;
  mockPlanId?: string;
}

export const defaultBillingConfig: MockBillingConfig = {
  shouldFail: false,
  mockSubscriptionId: 'sub_mock_1234567890',
  mockCustomerId: 'cus_mock_1234567890',
  mockPlanId: 'plan_mock_1234567890',
};

/**
 * Create a mock billing provider that can be used in test modules
 */
export function createMockBillingProvider(config: Partial<MockBillingConfig> = {}) {
  const finalConfig = { ...defaultBillingConfig, ...config };

  return {
    // Subscription management
    createSubscription: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('Billing provider error: Subscription creation failed');
      }
      return {
        id: finalConfig.mockSubscriptionId!,
        customerId: finalConfig.mockCustomerId!,
        status: 'active',
        recurringInterval: 'month',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),

    cancelSubscription: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('Billing provider error: Subscription cancellation failed');
      }
      return { id: finalConfig.mockSubscriptionId, status: 'cancelled' };
    }),

    // Customer management
    createCustomer: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('Billing provider error: Customer creation failed');
      }
      return {
        id: finalConfig.mockCustomerId!,
        email: 'test@example.com',
        name: 'Test Customer',
        createdAt: new Date(),
      };
    }),

    getCustomer: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('Billing provider error: Customer lookup failed');
      }
      return {
        id: finalConfig.mockCustomerId!,
        email: 'test@example.com',
        name: 'Test Customer',
      };
    }),

    updateCustomer: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('Billing provider error: Customer update failed');
      }
      return {
        id: finalConfig.mockCustomerId!,
        email: 'updated@example.com',
        name: 'Updated Customer',
      };
    }),

    // Webhook verification
    verifyWebhookSignature: vi.fn().mockImplementation((payload: string, signature: string) => {
      // Always return true in test mode
      return true;
    }),

    // Plan/pricing
    getPlans: vi.fn().mockImplementation(async () => {
      return [
        { id: 'plan_free', name: 'Free', price: 0, interval: 'month' },
        { id: 'plan_pro', name: 'Pro', price: 29, interval: 'month' },
        { id: 'plan_enterprise', name: 'Enterprise', price: 99, interval: 'month' },
      ];
    }),

    // Reset all mocks
    resetAll: function() {
      this.createSubscription.mockReset();
      this.cancelSubscription.mockReset();
      this.createCustomer.mockReset();
      this.getCustomer.mockReset();
      this.updateCustomer.mockReset();
      this.verifyWebhookSignature.mockReset();
      this.getPlans.mockReset();
    },
  };
}

/**
 * Module-level billing mock for test isolation
 */
export class BillingMockModule {
  private mock = createMockBillingProvider();

  getMock() {
    return this.mock;
  }

  reset() {
    this.mock.resetAll();
  }

  setFailure(enabled: boolean) {
    this.mock.createSubscription.mockImplementation(async () => {
      if (enabled) throw new Error('Billing provider error: Simulated failure');
      return {
        id: 'sub_mock_1234567890',
        customerId: 'cus_mock_1234567890',
        status: 'active',
      };
    });
  }
}

// ============================================
// AI Service Mocks
// ============================================

export interface MockAIConfig {
  shouldFail?: boolean;
  mockResponse?: string;
  mockModel?: string;
}

export const defaultAIConfig: MockAIConfig = {
  shouldFail: false,
  mockResponse: 'This is a mock AI response for testing purposes.',
  mockModel: 'gpt-4o-mini-test',
};

/**
 * Create a mock AI provider that can be used in test modules
 */
export function createMockAIProvider(config: Partial<MockAIConfig> = {}) {
  const finalConfig = { ...defaultAIConfig, ...config };

  return {
    // Chat completion
    chat: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('AI provider error: Chat completion failed');
      }
      return {
        id: `msg_${Date.now()}`,
        model: finalConfig.mockModel!,
        content: finalConfig.mockResponse!,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
        finishReason: 'stop',
      };
    }),

    // Streaming chat
    chatStream: vi.fn().mockImplementation(async function* () {
      if (finalConfig.shouldFail) {
        throw new Error('AI provider error: Stream failed');
      }
      const words = (finalConfig.mockResponse!).split(' ');
      for (const word of words) {
        yield {
          content: word + ' ',
          done: false,
        };
      }
      yield { done: true };
    }),

    // Embeddings
    embed: vi.fn().mockImplementation(async () => {
      if (finalConfig.shouldFail) {
        throw new Error('AI provider error: Embedding failed');
      }
      // Return a mock embedding vector
      return new Array(1536).fill(0).map(() => Math.random());
    }),

    // Model info
    getModel: vi.fn().mockImplementation(() => finalConfig.mockModel),

    // Reset all mocks
    resetAll: function() {
      this.chat.mockReset();
      this.chatStream.mockReset();
      this.embed.mockReset();
      this.getModel.mockReset();
    },
  };
}

/**
 * Module-level AI mock for test isolation
 */
export class AIMockModule {
  private mock = createMockAIProvider();

  getMock() {
    return this.mock;
  }

  reset() {
    this.mock.resetAll();
  }

  setResponse(response: string) {
    this.mock.chat.mockImplementation(async () => ({
      id: `msg_${Date.now()}`,
      model: 'gpt-4o-mini-test',
      content: response,
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      finishReason: 'stop',
    }));
  }

  setFailure(enabled: boolean) {
    if (enabled) {
      this.mock.chat.mockRejectedValue(new Error('AI provider error: Simulated failure'));
    } else {
      this.mock.chat.mockResolvedValue({
        id: `msg_${Date.now()}`,
        model: 'gpt-4o-mini-test',
        content: 'Default mock response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        finishReason: 'stop',
      });
    }
  }
}

// ============================================
// Combined Mock Manager
// ============================================

export interface MockManagerConfig {
  billing?: Partial<MockBillingConfig>;
  ai?: Partial<MockAIConfig>;
}

/**
 * Manager for all test mocks - provides easy reset and configuration
 */
export class MockManager {
  private billing: BillingMockModule;
  private ai: AIMockModule;

  constructor(config: MockManagerConfig = {}) {
    this.billing = new BillingMockModule();
    this.ai = new AIMockModule();

    if (config.billing) {
      Object.assign(this.billing.getMock(), createMockBillingProvider(config.billing));
    }
    if (config.ai) {
      Object.assign(this.ai.getMock(), createMockAIProvider(config.ai));
    }
  }

  getBillingMock() {
    return this.billing.getMock();
  }

  getAIMock() {
    return this.ai.getMock();
  }

  resetAll() {
    this.billing.reset();
    this.ai.reset();
  }

  // Quick helpers
  simulateBillingFailure() {
    this.billing.setFailure(true);
  }

  simulateAIFailure() {
    this.ai.setFailure(true);
  }

  setAIResponse(response: string) {
    this.ai.setResponse(response);
  }

  clearFailures() {
    this.billing.setFailure(false);
    this.ai.setFailure(false);
  }
}

// ============================================
// Jest/Vitest Mock Helpers
// ============================================

/**
 * Mock module at runtime for dependency injection testing
 */
export function mockModule<T extends object>(modulePath: string, mockImplementation: Partial<T>): T {
  return vi.mocked(require(modulePath), true) as unknown as T;
}

/**
 * Spy on a method and record calls
 */
export function spyOnMethod<T extends object, K extends keyof T>(
  obj: T,
  method: K
): {
  mock: ReturnType<typeof vi.fn>;
  calls: T[K] extends (...args: infer A) => infer R ? A[] : never[];
  results: T[K] extends (...args: any[]) => infer R ? R[] : never[];
} {
  const original = obj[method] as any;
  const calls: any[] = [];
  const results: any[] = [];

  const spy = vi.fn(async (...args: any[]) => {
    calls.push(args);
    const result = await original.apply(obj, args);
    results.push(result);
    return result;
  });

  (obj as any)[method] = spy;

  return {
    get mock() { return spy; },
    get calls() { return calls; },
    get results() { return results; },
  };
}

// Export default mock factory
export default {
  createMockBillingProvider,
  createMockAIProvider,
  MockManager,
  BillingMockModule,
  AIMockModule,
};