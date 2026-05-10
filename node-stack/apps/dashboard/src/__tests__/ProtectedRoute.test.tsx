import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// Mock useAuth so we can control authentication state
vi.mock("@/hooks/stores/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Loading component uses Web Animations API not available in jsdom
vi.mock("@/components/ui/Loading", () => ({
  default: () => <div data-testid="loading-spinner" />,
}));

import { useAuth } from "@/hooks/stores/useAuth";
import ProtectedRoute from "@/routes/ProtectedRoute";

const SignInPage = () => <div>Sign In Page</div>;
const ProtectedPage = () => <div>Protected Content</div>;

function renderWithRouter(isAuthenticated: boolean, isLoading = false) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { id: "u-1", email: "test@test.com", role: "user" } : null,
    isLoading,
  });

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /auth/sign-in when not authenticated", () => {
    renderWithRouter(false);
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderWithRouter(true);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Sign In Page")).not.toBeInTheDocument();
  });

  it("shows loading spinner while isLoading=true (no redirect)", () => {
    renderWithRouter(true, true);
    // Loading component is rendered; neither the protected content nor sign-in page appears
    expect(screen.queryByText("Sign In Page")).not.toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});
