import { describe, it, expect } from "vitest";
import { renderEmail } from "./render";

describe("Email Renderer", () => {
  it("should render welcome template correctly", () => {
    const html = renderEmail("welcome", { name: "Antigravity Reader" });
    expect(html).toContain("Antigravity Reader");
    expect(html).toContain("Welcome");
  });

  it("should render password reset template correctly", () => {
    const html = renderEmail("reset_password", {
      resetUrl: "https://example.com/reset",
    });
    expect(html).toContain("https://example.com/reset");
    expect(html).toContain("Reset");
  });

  it("should render team invitation template correctly", () => {
    const html = renderEmail("invitation", {
      workspaceName: "L.A. Labs",
      inviteLink: "https://example.com/join",
    });
    expect(html).toContain("L.A. Labs");
    expect(html).toContain("https://example.com/join");
  });

  it("should throw an error for unknown templates", () => {
    expect(() => {
      renderEmail("non_existent" as any, {});
    }).toThrow('Unknown email template: "non_existent"');
  });
});
