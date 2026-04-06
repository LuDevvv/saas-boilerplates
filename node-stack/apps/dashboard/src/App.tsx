import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Loading from "@/components/Loading";
import Toasts from "@/components/alerts/Toasts";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { SWUpdateProvider } from "@/hooks/useSWUpdate";

const DashboardPage = lazy(() => import("@pages/index"));

// Account & Profile
const PersonalProfile = lazy(() => import("@pages/profile/PersonalProfile"));
const SecurityPage = lazy(() => import("@pages/profile/SecurityPage"));

// Workspace & Settings
const WorkspacesPage = lazy(() => import("@pages/workspaces/Workspaces"));
const SettingsPage = lazy(() => import("@pages/settings/Settings"));

// Auth
const LoginPage = lazy(() => import("@pages/auth/SignIn"));
const RegisterPage = lazy(() => import("@pages/auth/SignUp"));
const ForgotPasswordPage = lazy(() => import("@pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@pages/auth/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@pages/auth/VerifyEmail"));
const AuthCallback = lazy(() => import("@pages/AuthCallback"));
const NotFound = lazy(() => import("@pages/error/NotFound"));

const LoadingFallback = () => <Loading />;

const App = () => {
  return (
    <SWUpdateProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Toasts />
        <PWAInstallPrompt />
        <UpdatePrompt />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/sign-in" element={<LoginPage />} />
          <Route path="/auth/sign-up" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/register" element={<Navigate to="/auth/sign-up" replace />} />

          {/* Protected Dashboard Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/profile" element={<PersonalProfile />} />
            <Route path="settings/security" element={<SecurityPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SWUpdateProvider>
  );
};

export default App;