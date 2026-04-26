import { Reflector } from "@nestjs/core";
import { ThrottlerStorage } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "@/common/guards/throttler.guard.js";
import { mockExecutionContext } from "@/common/guards/test-helpers/mock-context.js";
import { Mocked } from "vitest";

describe("CustomThrottlerGuard", () => {
  let guard: CustomThrottlerGuard;
  let reflector: Mocked<Reflector>;
  let storageService: any;
  let cacheService: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as any;
    
    storageService = {
      increment: vi.fn(),
    };

    cacheService = {
      getOrSet: vi.fn(),
    };

    // The @nestjs/throttler guard requires these dependencies.
    // We mock only the parts needed for our test.
    guard = new CustomThrottlerGuard(
      { throttlers: [{ name: "default", limit: 10, ttl: 60000 }] },
      storageService as unknown as ThrottlerStorage,
      reflector
    );

    // Inject mocked services
    Object.assign(guard, { cacheService });
  });

  it("sets X-RateLimit headers correctly", async () => {
    const limit = 100; // Default for 'jwt' identity in CustomThrottlerGuard
    const ttl = 60000;
    const totalHits = 1;
    
    (storageService.increment as any).mockResolvedValue({
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
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Reset", expect.any(String)); // We use toISOString()
  });

  it("sets Retry-After header when limit exceeded", async () => {
    const limit = 100; // Default for 'jwt' identity
    const ttl = 60000;
    const totalHits = 101;
    
    (storageService.increment as any).mockResolvedValue({
      totalHits,
      timeToExpire: ttl,
      isBlocked: true,
      timeToBlockExpire: 60,
    });

    // Mock throwThrottlingException to avoid actual throw during header check
    vi.spyOn(guard as any, 'throwThrottlingException').mockImplementation(async () => {});

    const ctx = mockExecutionContext();
    const res = ctx.switchToHttp().getResponse();

    await (guard as any).handleRequest({
      context: ctx,
      limit,
      ttl,
      throttler: { name: "default", limit, ttl },
      blockDuration: 0,
    });

    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", 60);
  });
});


