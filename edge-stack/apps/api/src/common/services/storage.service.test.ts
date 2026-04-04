import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStorageService } from "./storage.service";

describe("StorageService Unit Tests (R2 Signing)", () => {
  let storageService: ReturnType<typeof createStorageService>;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockEnv = {
      R2_ACCESS_KEY_ID: "mock-key",
      R2_SECRET_ACCESS_KEY: "mock-secret",
      R2_ENDPOINT: "https://r2.mock.com",
      R2_BUCKET_NAME: "mock-bucket",
    };
    storageService = createStorageService(mockEnv);
  });

  it("generates an upload URL", async () => {
    const key = "uploads/test-file.png";
    const contentType = "image/png";

    const url = await storageService.getUploadUrl(key, contentType, 1800);

    expect(url).toContain(
      "https://r2.mock.com/mock-bucket/uploads/test-file.png",
    );
    expect(url).toContain("X-Amz-Signature=");
  });

  it("generates a download URL", async () => {
    const key = "uploads/test-file.png";

    const url = await storageService.getDownloadUrl(key);

    expect(url).toContain(
      "https://r2.mock.com/mock-bucket/uploads/test-file.png",
    );
    expect(url).toContain("X-Amz-Signature=");
  });
});
