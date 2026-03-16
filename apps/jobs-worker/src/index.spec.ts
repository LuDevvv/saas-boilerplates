import { describe, it, expect, vi, beforeEach } from "vitest";
import worker from "./index";
import { renderEmail } from "./render";
import { Resend } from "resend";

// Mock Resend
vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn(),
      },
    })),
  };
});

// Mock renderEmail
vi.mock("./render", () => ({
  renderEmail: vi
    .fn()
    .mockReturnValue("<html><body>Email Content</body></html>"),
}));

describe("Jobs Worker", () => {
  const env = { RESEND_API_KEY: "test-key" };
  let mockResendInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResendInstance = new Resend(env.RESEND_API_KEY);
    (Resend as any).mockReturnValue(mockResendInstance);
  });

  it("should process valid email jobs successfully", async () => {
    const payload = {
      to: "test@example.com",
      subject: "Welcome",
      templateName: "welcome",
      templateData: { name: "Test User" },
    };

    const mockMessage = {
      id: "msg-123",
      body: payload,
      ack: vi.fn(),
      retry: vi.fn(),
    };

    const batch = {
      messages: [mockMessage],
    } as any;

    mockResendInstance.emails.send.mockResolvedValue({
      data: { id: "resend-id" },
      error: null,
    });

    await worker.queue(batch, env);

    expect(renderEmail).toHaveBeenCalledWith("welcome", { name: "Test User" });
    expect(mockResendInstance.emails.send).toHaveBeenCalled();
    expect(mockMessage.ack).toHaveBeenCalled();
    expect(mockMessage.retry).not.toHaveBeenCalled();
  });

  it("should ack and skip invalid payloads", async () => {
    const mockMessage = {
      id: "msg-bad",
      body: { invalid: "field" },
      ack: vi.fn(),
      retry: vi.fn(),
    };

    const batch = {
      messages: [mockMessage],
    } as any;

    await worker.queue(batch, env);

    expect(mockMessage.ack).toHaveBeenCalled();
    expect(mockResendInstance.emails.send).not.toHaveBeenCalled();
  });

  it("should retry if Resend returns an error", async () => {
    const payload = {
      to: "error@example.com",
      subject: "Fail",
      templateName: "welcome",
      templateData: { name: "Fail" },
    };

    const mockMessage = {
      id: "msg-err",
      body: payload,
      ack: vi.fn(),
      retry: vi.fn(),
    };

    const batch = {
      messages: [mockMessage],
    } as any;

    mockResendInstance.emails.send.mockResolvedValue({
      data: null,
      error: { message: "API Down" },
    });

    await worker.queue(batch, env);

    expect(mockMessage.retry).toHaveBeenCalled();
    expect(mockMessage.ack).not.toHaveBeenCalled();
  });

  it("should retry if rendering throws an error", async () => {
    (renderEmail as any).mockImplementationOnce(() => {
      throw new Error("Render Fail");
    });

    const mockMessage = {
      id: "msg-render-err",
      body: {
        to: "test@example.com",
        subject: "Fail",
        templateName: "welcome",
        templateData: {},
      },
      ack: vi.fn(),
      retry: vi.fn(),
    };

    const batch = {
      messages: [mockMessage],
    } as any;

    await worker.queue(batch, env);

    expect(mockMessage.retry).toHaveBeenCalled();
  });
});
