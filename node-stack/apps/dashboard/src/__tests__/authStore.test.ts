import type { UserEntity } from "@node-stack/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock cookie-storage before importing authStore
vi.mock("@/lib/cookie-storage", () => ({
  cookieTokenStorage: { clear: vi.fn() },
}));

// Import after mock so the module uses the mock
const { useAuthStore } = await import("@/stores/authStore");

const mockUser: UserEntity = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  phone: null,
  role: "user",
  createdAt: new Date().toISOString(),
  twoFactorEnabled: false,
  emailVerified: true,
};

describe("authStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({ user: null, isAuthenticated: false });
    vi.clearAllMocks();
    // Suppress window.location.href assignment errors in jsdom
    Object.defineProperty(window, "location", {
      value: { ...window.location, pathname: "/dashboard", href: "/" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with null user and not authenticated", () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it("setUser stores user entity and sets isAuthenticated=true", () => {
    useAuthStore.getState().setUser(mockUser);

    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isAuthenticated).toBe(true);
  });

  it("clearUser resets user to null and isAuthenticated to false", () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });

    useAuthStore.getState().clearUser();

    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it("clearUser removes localStorage tokens", () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });

    useAuthStore.getState().clearUser();

    expect(removeItemSpy).toHaveBeenCalledWith("auth_token");
    expect(removeItemSpy).toHaveBeenCalledWith("refresh_token");
  });

  it("setUser followed by clearUser restores empty state", () => {
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().clearUser();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
