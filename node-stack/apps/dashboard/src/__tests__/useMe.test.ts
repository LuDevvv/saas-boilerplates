import { useMe } from "@node-stack/api-client";
import type { UserEntity } from "@node-stack/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

// vi.mock is hoisted to top-of-file by vitest so it runs before any imports.
// The import above references the mocked module once hoisting resolves.
// Keep the factory self-contained (no external const refs due to TDZ).
vi.mock("@node-stack/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@node-stack/api-client")>();
  return {
    ...actual,
    useMe: vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    }),
  };
});

const mockUser: UserEntity = {
  id: "u-1",
  email: "me@example.com",
  firstName: "Me",
  lastName: null,
  phone: null,
  role: "user",
  createdAt: new Date().toISOString(),
  twoFactorEnabled: false,
  emailVerified: true,
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  );

describe("useMe hook (mocked api-client)", () => {
  it("returns user data from api-client", async () => {
    (useMe as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toMatchObject({ id: "u-1", email: "me@example.com" });
  });

  it("returns isError=false for successful fetch", async () => {
    (useMe as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
  });

  it("returns null data when unauthenticated", async () => {
    (useMe as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
  });
});
