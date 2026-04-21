import { ConflictException } from "@nestjs/common";
import { IdempotencyGuard, IDEMPOTENCY_KEY_HEADER } from "./idempotency.guard.js";
import { IdempotencyService } from "../services/idempotency.service.js";
import { mockExecutionContext } from "./test-helpers/mock-context.js";

describe("IdempotencyGuard", () => {
  let guard: IdempotencyGuard;
  let service: jest.Mocked<IdempotencyService>;

  beforeEach(() => {
    service = {
      get: jest.fn(),
      setWithLock: jest.fn(),
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
    const cached = { status: 200, body: { data: "cached" } };
    service.get.mockResolvedValue(cached);

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
    service.get.mockResolvedValue(null);
    service.setWithLock.mockResolvedValue(true);

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
    service.get.mockResolvedValue(null);
    service.setWithLock.mockResolvedValue(false);

    const ctx = mockExecutionContext({
      headers: { [IDEMPOTENCY_KEY_HEADER.toLowerCase()]: "locked-key" },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ConflictException);
  });
});
