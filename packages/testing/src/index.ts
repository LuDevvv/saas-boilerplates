import { beforeEach, afterEach, vi, type Vitest } from "vitest";

export * from "./mock";
export * from "./db-test-client";

interface MockOverrides {
  headers?: Record<string, string>;
  body?: unknown;
  env?: Record<string, unknown>;
  user?: unknown;
  workspace?: unknown;
  [key: string]: unknown;
}

export const createMockContext = (overrides: MockOverrides = {}) => {
  return {
    req: {
      header: vi.fn((name: string) => overrides.headers?.[name] ?? null),
      parseBody: vi.fn().mockResolvedValue({}),
      json: vi.fn().mockResolvedValue({}),
      valid: vi.fn().mockResolvedValue(overrides.body ?? {}),
    },
    env: {
      DATABASE_URL: "postgres://test:test@localhost:5432/testdb",
      JWT_SECRET: "test-secret-key",
      ...(overrides.env || {}),
    },
    var: {
      user: overrides.user ?? null,
      workspace: overrides.workspace ?? null,
    },
    ...overrides,
  };
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

export const suppressLogs = (fn: () => void | Promise<void>) => {
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = vi.fn();
  console.warn = vi.fn();
  try {
    return fn();
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
};

export const cleanupAsyncMocks = async () => {
  await vi.runAllTimersAsync?.();
  vi.restoreAllMocks();
};

export const setupGlobalMocks = () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
};

export { vi };
