import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { protectedGuard, guestGuard, adminGuard } from "./routeguards";

import { PageSkeleton } from "@/components/shared/ErrorBoundary";
import Loading from "@/components/ui/Loading";
import { AnalyticsLayoutSkeleton } from "@/features/analytics/components/AnalyticsSkeletons";
import {
  BillingLayoutSkeleton,
  PricingPageSkeleton,
  CheckoutPageSkeleton,
} from "@/features/billing/components/BillingSkeletons";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { ProfileLayoutSkeleton } from "@/features/profile";
import { StorageSkeleton } from "@/features/storage/components/StorageSkeleton";
import { MembersLayoutSkeleton } from "@/features/workspaces/components/MembersSkeletons";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useAuth } from "@/hooks/stores/useAuth";
import MainLayout from "@/layouts/MainLayout";

// Auth
const SignInPage = lazy(() => import("@pages/auth/SignIn"));
const SignUpPage = lazy(() => import("@pages/auth/SignUp"));
const ForgotPasswordPage = lazy(() => import("@pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@pages/auth/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@pages/auth/VerifyEmail"));
const OAuthCallbackPage = lazy(() => import("@pages/auth/OAuthCallback"));

// Dashboard
const DashboardPage = lazy(() => import("@pages/index"));
const AnalyticsPage = lazy(() => import("@pages/analytics/Analytics"));
const StoragePage = lazy(() => import("@pages/_dashboard/StoragePage"));

// Payments
const BillingPage = lazy(() => import("@pages/payments/Billing"));
const PricingPage = lazy(() => import("@pages/payments/Pricing"));
const CheckoutPage = lazy(() => import("@pages/payments/Checkout"));

// Profile
const PersonalProfilePage = lazy(() => import("@pages/profile/PersonalProfile"));
const CompanyProfilePage = lazy(() => import("@pages/profile/CompanyProfile"));

// Notifications & tickets
const NotificationsPage = lazy(() => import("@pages/notifications/NotificationsPage"));
const TicketsPage = lazy(() => import("@pages/tickets/TicketsPage"));
const TicketDetailPage = lazy(() => import("@pages/tickets/TicketDetail"));
const CreateTicketPage = lazy(() => import("@pages/_tickets/CreateTicketPage"));

// Other features
const ReportsPage = lazy(() => import("@pages/reports/ReportsPage"));
const NewsPage = lazy(() => import("@pages/news/News"));
const AIPlaygroundPage = lazy(() => import("@pages/ai/AIPlayground"));

// Admin
const AdminOverviewPage = lazy(() => import("@pages/admin/AdminOverview"));
const ManageUsersPage = lazy(() => import("@pages/admin/ManageUsers"));
const AuditLogsPage = lazy(() => import("@pages/admin/AuditLogs"));
const SystemConfigPage = lazy(() => import("@pages/admin/SystemConfigPage"));
const FeatureFlagsPage = lazy(() => import("@pages/admin/FeatureFlagsPage"));
const WorkspacesAdminPage = lazy(() => import("@pages/admin/WorkspacesAdminPage"));

// Onboarding
const OnboardingPage = lazy(() => import("@pages/onboarding/Onboarding"));
const OnboardingPricingPage = lazy(() => import("@pages/onboarding/OnboardingPricing"));

// Payment success (standalone — bypasses onboarding gate)
const PaymentSuccessPage = lazy(() => import("@pages/payments/PaymentSuccess"));

// Legal & error
const TermsPage = lazy(() => import("@pages/legal/Terms"));
const PrivacyPage = lazy(() => import("@pages/legal/Privacy"));
const NotFoundPage = lazy(() => import("@pages/error/NotFound"));

// Settings
const WorkspaceMembersPage = lazy(() => import("@pages/settings/WorkspaceMembers"));
const ApiKeysPage = lazy(() => import("@pages/_settings/ApiKeysPage"));
const WebhooksPage = lazy(() => import("@pages/_settings/WebhooksPage"));
const PortabilityPage = lazy(() => import("@/features/workspaces/pages/PortabilityPage"));

// Dev-only (only registered in development builds)
const ComponentsCatalogPage = lazy(() => import("@pages/dev/ComponentsCatalog"));

const LoadingFallback = (): React.ReactElement => <PageSkeleton />;

export const AppRoutes = (): React.ReactElement => {
  return (
    <Routes>
      {/* Guest Routes - Redirect to dashboard if authenticated */}
      <Route path="/auth/sign-in" element={<Suspense fallback={<Loading />} children={guestGuard(<SignInPage />)} />} />
      <Route path="/auth/sign-up" element={<Suspense fallback={<Loading />} children={guestGuard(<SignUpPage />)} />} />
      <Route path="/auth/forgot-password" element={<Suspense fallback={<Loading />} children={guestGuard(<ForgotPasswordPage />)} />} />
      <Route path="/auth/reset-password" element={<Suspense fallback={<Loading />} children={guestGuard(<ResetPasswordPage />)} />} />
      <Route path="/auth/verify-email" element={<Suspense fallback={<Loading />} children={guestGuard(<VerifyEmailPage />)} />} />
      <Route path="/auth/callback" element={<Suspense fallback={<Loading />} children={<OAuthCallbackPage />} />} />

      {/* Legacy redirects */}
      <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
      <Route path="/register" element={<Navigate to="/auth/sign-up" replace />} />

      {/* Legal pages (public) */}
      <Route path="/legal/terms" element={<Suspense fallback={<LoadingFallback />} children={<TermsPage />} />} />
      <Route path="/legal/privacy" element={<Suspense fallback={<LoadingFallback />} children={<PrivacyPage />} />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<DashboardSkeleton />} children={<DashboardPage />} />} />
        <Route path="analytics" element={<Suspense fallback={<AnalyticsLayoutSkeleton />} children={<AnalyticsPage />} />} />

        {/* Profile */}
        <Route path="profile/personal" element={<Suspense fallback={<ProfileLayoutSkeleton />} children={<PersonalProfilePage />} />} />
        <Route path="profile/company" element={<Suspense fallback={<ProfileLayoutSkeleton />} children={<CompanyProfilePage />} />} />

        {/* Payments */}
        <Route path="payments" element={<Suspense fallback={<BillingLayoutSkeleton />} children={<BillingPage />} />} />
        <Route path="payments/pricing" element={<Suspense fallback={<PricingPageSkeleton />} children={<PricingPage />} />} />
        <Route path="pricing" element={<Suspense fallback={<PricingPageSkeleton />} children={<PricingPage />} />} />

        {/* Other features */}
        <Route path="notifications" element={<Suspense fallback={<LoadingFallback />} children={<NotificationsPage />} />} />
        <Route path="tickets" element={<Suspense fallback={<LoadingFallback />} children={<TicketsPage />} />} />
        <Route path="tickets/:id" element={<Suspense fallback={<LoadingFallback />} children={<TicketDetailPage />} />} />
        <Route path="tickets/create" element={<Suspense fallback={<LoadingFallback />} children={<CreateTicketPage />} />} />
        <Route path="reports" element={<Suspense fallback={<LoadingFallback />} children={<ReportsPage />} />} />
        <Route path="news" element={<Suspense fallback={<LoadingFallback />} children={<NewsPage />} />} />
        <Route path="ai" element={<Suspense fallback={<LoadingFallback />} children={<AIPlaygroundPage />} />} />
        <Route path="storage" element={<Suspense fallback={<StorageSkeleton />} children={<StoragePage />} />} />

        {/* Dev-only catalog route */}
        {import.meta.env.DEV && (
          <Route path="dev/components" element={<Suspense fallback={<LoadingFallback />} children={<ComponentsCatalogPage />} />} />
        )}

        {/* Admin */}
        <Route path="admin" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<AdminOverviewPage />)} />} />
        <Route path="admin/users" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<ManageUsersPage />)} />} />
        <Route path="admin/audit" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<AuditLogsPage />)} />} />
        <Route path="admin/config" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<SystemConfigPage />)} />} />
        <Route path="admin/feature-flags" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<FeatureFlagsPage />)} />} />
        <Route path="admin/workspaces" element={<Suspense fallback={<LoadingFallback />} children={adminGuard(<WorkspacesAdminPage />)} />} />

        {/* Settings */}
        <Route path="settings/members" element={<Suspense fallback={<MembersLayoutSkeleton />} children={<WorkspaceMembersPage />} />} />
        <Route path="settings/api-keys" element={<Suspense fallback={<LoadingFallback />} children={<ApiKeysPage />} />} />
        <Route path="settings/webhooks" element={<Suspense fallback={<LoadingFallback />} children={<WebhooksPage />} />} />
        <Route path="settings/export" element={<Suspense fallback={<LoadingFallback />} children={<PortabilityPage />} />} />
      </Route>

      {/* Standalone protected routes (no layout) */}
      <Route
        path="/payments/checkout"
        element={<Suspense fallback={<CheckoutPageSkeleton />} children={protectedGuard(<CheckoutPage />)} />}
      />
      {/* Payment success: bypasses onboarding gate — user just paid, let them through */}
      <Route
        path="/payments/success"
        element={<Suspense fallback={<Loading />} children={protectedGuard(<PaymentSuccessPage />)} />}
      />
      <Route
        path="/onboarding"
        element={<Suspense fallback={<Loading />} children={protectedGuard(<OnboardingPage />)} />}
      />
      <Route
        path="/onboarding/pricing"
        element={<Suspense fallback={<Loading />} children={protectedGuard(<OnboardingPricingPage />)} />}
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const location = useLocation();

  if (isAuthenticated && (isLoading || isLoadingWorkspaces)) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (!user && isAuthenticated) {
    return <Loading />;
  }

  const isOnboardingRoute = location.pathname.startsWith("/onboarding");
  const isSuccessRoute    = location.pathname === "/payments/success";
  const hasWorkspace      = Array.isArray(workspaces) && workspaces.length > 0;
  // onboardingStatus comes from GET /auth/me — 'completed' means paid + workspace set up
  const onboardingDone = (user as unknown as Record<string, unknown>)?.["onboardingStatus"] === "completed";

  // No workspace yet → start onboarding from the beginning
  if (isAuthenticated && user && !hasWorkspace && !isOnboardingRoute && !isSuccessRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  // Has workspace but hasn't paid yet → resume at pricing step
  // (skip if they're on the success page — they just paid)
  if (isAuthenticated && user && hasWorkspace && !onboardingDone && !isOnboardingRoute && !isSuccessRoute) {
    return <Navigate to="/onboarding/pricing" replace />;
  }

  return <>{children}</>;
};
