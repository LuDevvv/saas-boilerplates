import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Loading from "@/components/Loading";
import Toasts from "@/components/alerts/Toasts";

// Lazy-loaded pages
const DashboardPage = lazy(() => import("@pages/index"));
const WorkspacesPage = lazy(() => import("@pages/workspaces/WorkspacesPage"));
const AnalyticsPage = lazy(() => import("@pages/analytics/AnalyticsPage"));
const ReportsPage = lazy(() => import("@pages/reports/ReportsPage"));
const PersonalProfile = lazy(() => import("@pages/profile/PersonalProfile"));
const AIPlayground = lazy(() => import("@pages/ai/AIPlayground"));
const WorkspaceSettingsPage = lazy(() => import("@pages/workspaces/WorkspaceSettingsPage"));
const AdminOverview = lazy(() => import("@pages/admin/AdminOverview"));
const ManageUsers = lazy(() => import("@pages/admin/ManageUsers"));

// Auth pages
const LoginPage = lazy(() => import("@pages/auth/SignIn"));
const RegisterPage = lazy(() => import("@pages/auth/SignUp"));
const ForgotPasswordPage = lazy(() => import("@pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@pages/auth/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@pages/auth/VerifyEmail"));
const AuthCallback = lazy(() => import("@pages/AuthCallback"));
const NotFound = lazy(() => import("@pages/error/NotFound"));

// Fallback for Suspense
const LoadingFallback = () => <Loading />;

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Toasts />
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

        {/* Protected Dashboard Layout (With Sidebar) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile/personal" element={<PersonalProfile />} />
          
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="workspaces/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="ai-playground" element={<AIPlayground />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<AdminOverview />} />
          <Route path="admin/users" element={<ManageUsers />} />
          
          {/* Internal tool placeholders */}
          <Route path="notifications" element={<DashboardPage />} />
          <Route path="organization/security" element={<DashboardPage />} />
          <Route path="organization/logs" element={<DashboardPage />} />
          <Route path="profile/billing" element={<DashboardPage />} />
          <Route path="profile/company" element={<DashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
