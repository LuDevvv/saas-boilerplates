import { ExecutionContext } from "@nestjs/common";

export function mockExecutionContext(
  overrides: {
    user?: Record<string, any>;
    headers?: Record<string, string>;
    method?: string;
    url?: string;
    handlerMetadata?: Record<string, any>;
    classMetadata?: Record<string, any>;
  } = {},
): ExecutionContext {
  const request = {
    user: overrides.user ?? {},
    headers: overrides.headers ?? {},
    method: overrides.method ?? "GET",
    url: overrides.url ?? "/test",
    ip: "127.0.0.1",
  };

  const response = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getHandler: () => ({
      name: "testHandler",
    }),
    getClass: () => ({
      name: "TestController",
    }),
  } as unknown as ExecutionContext;
}
