import { ConflictException } from "@nestjs/common";
import { IdempotencyGuard, IDEMPOTENCY_KEY_HEADER } from "@/common/guards/idempotency.guard.js";
import { IdempotencyService } from "@/common/services/idempotency.service.js";
import { mockExecutionContext } from "@/common/guards/test-helpers/mock-context.js";
import { Mocked } from "vitest";

describe("IdempotencyGuard", () => {
  let guard: IdempotencyGuard;
  let service: Mocked<IdempotencyService>;

  beforeEach(() => {
    service = {
      get: vi.fn(),
      setWithLock: vi.fn(),
    } as any;
    guard = new IdempotencyGuard(service);
  });

  it("passes through if no idempotency key provided", async () => {
    const ctx = mockExecutionContext({ headers: {} });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(service.get).not.toHaveBeenCalled();
  });

  it("returns cached response if key found in storage", async () => {
    const cached = { statusCode: 200, data: "cached" };
    (service.get as any).mockResolvedValue(cached);

    const ctx = mockExecutionContext({
      headers: { [IDEMPOTENCY_KEY_HEADER.toLowerCase()]: "test-key" },
    });
    const req = ctx.switchToHttp().getRequest();

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.idempotencyCachedResponse).toBe(cached);
    expect(service.setWithLock).not.toHaveBeenCalled();
  });

  it("sets lock and proceeds for a new key", async () => {
    (service.get as any).mockResolvedValue(null);
    (service.setWithLock as any).mockResolvedValue(true);

    const ctx = mockExecutionContext({
      headers: { [IDEMPOTENCY_KEY_HEADER.toLowerCase()]: "new-key" },
    });
    const req = ctx.switchToHttp().getRequest();

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.idempotencyKey).toBe("new-key");
    expect(service.setWithLock).toHaveBeenCalledWith("new-key");
  });

  it("throws ConflictException if lock acquisition fails", async () => {
    (service.get as any).mockResolvedValue(null);
    (service.setWithLock as any).mockResolvedValue(false);

    const ctx = mockExecutionContext({
      headers: { [IDEMPOTENCY_KEY_HEADER.toLowerCase()]: "locked-key" },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ConflictException);
  });
});

