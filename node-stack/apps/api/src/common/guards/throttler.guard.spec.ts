import { Reflector } from "@nestjs/core";
import { ThrottlerStorageService } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "./throttler.guard";
import { mockExecutionContext } from "./test-helpers/mock-context";

describe("CustomThrottlerGuard", () => {
  let guard: CustomThrottlerGuard;
  let reflector: jest.Mocked<Reflector>;
  let storageService: jest.Mocked<ThrottlerStorageService>;

  beforeEach(() => {
    reflector = {} as any;
    storageService = {
      increment: jest.fn(),
    } as any;

    // The @nestjs/throttler guard requires these dependencies.
    // We mock only the parts needed for our test.
    guard = new CustomThrottlerGuard(
      { throttlers: [{ name: "default", limit: 10, ttl: 60000 }] },
      storageService,
      reflector
    );
  });

  it("sets X-RateLimit headers correctly", async () => {
    const limit = 10;
    const ttl = 60000;
    const totalHits = 1;
    
    storageService.increment.mockResolvedValue({
      totalHits,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
    });

    const ctx = mockExecutionContext();
    const res = ctx.switchToHttp().getResponse();

    // handleRequest is protected, we can access it during tests or test canActivate which calls it.
    // canActivate in ThrottlerGuard calls handleRequest for each throttler.
    await (guard as any).handleRequest({
      context: ctx,
      limit,
      ttl,
      throttler: { name: "default", limit, ttl },
      blockDuration: 0,
    });

    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", limit);
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", limit - totalHits);
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Reset", expect.any(String));
  });

  it("sets Retry-After header when limit exceeded", async () => {
    const limit = 10;
    const ttl = 60000;
    const totalHits = 11;
    
    storageService.increment.mockResolvedValue({
      totalHits,
      timeToExpire: ttl,
      isBlocked: true,
      timeToBlockExpire: 60000,
    });

    // Mock throwThrottlingException to avoid actual throw during header check
    // or wrap in try/catch
    jest.spyOn(guard as any, 'throwThrottlingException').mockImplementation(async () => {});

    const ctx = mockExecutionContext();
    const res = ctx.switchToHttp().getResponse();

    await (guard as any).handleRequest({
      context: ctx,
      limit,
      ttl,
      throttler: { name: "default", limit, ttl },
      blockDuration: 0,
    });

    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", Math.ceil(ttl / 1000));
  });
});
