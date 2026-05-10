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
import { useAuth } from "@/hooks/stores/useAuth";
import MainLayout from "@/layouts/MainLayout";

// Lazy load pages
const SignInPage = lazy(() => import("@pages/_auth/SignInPage"));
const SignUpPage = lazy(() => import("@pages/_auth/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("@pages/_auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@pages/_auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@pages/_auth/VerifyEmailPage"));

const DashboardPage = lazy(() => import("@pages/_dashboard/DashboardPage"));
const AnalyticsPage = lazy(() => import("@pages/_dashboard/AnalyticsPage"));
const BillingPage = lazy(() => import("@pages/_payments/BillingPage"));
const PricingPage = lazy(() => import("@pages/_payments/PricingPage"));
const CheckoutPage = lazy(() => import("@pages/_payments/CheckoutPage"));

const PersonalProfilePage = lazy(() => import("@pages/_profile/PersonalProfilePage"));
const CompanyProfilePage = lazy(() => import("@pages/_profile/CompanyProfilePage"));

const NotificationsPage = lazy(() => import("@pages/_notifications/NotificationsPage"));
const TicketsPage = lazy(() => import("@pages/_tickets/TicketsPage"));
const TicketDetailPage = lazy(() => import("@pages/_tickets/TicketDetailPage"));
const CreateTicketPage = lazy(() => import("@pages/_tickets/CreateTicketPage"));

const ReportsPage = lazy(() => import("@pages/_reports/ReportsPage"));
const NewsPage = lazy(() => import("@pages/_news/NewsPage"));
const AIPlaygroundPage = lazy(() => import("@pages/_ai/AIPlaygroundPage"));

const AdminOverviewPage = lazy(() => import("@pages/_admin/AdminOverviewPage"));
const ManageUsersPage = lazy(() => import("@pages/_admin/ManageUsersPage"));
const AuditLogsPage = lazy(() => import("@pages/_admin/AuditLogsPage"));
const SystemConfigPage = lazy(() => import("@/pages/admin/SystemConfigPage"));
const FeatureFlagsPage = lazy(() => import("@/pages/admin/FeatureFlagsPage"));
const WorkspacesAdminPage = lazy(() => import("@/pages/admin/WorkspacesAdminPage"));

const OnboardingPage = lazy(() => import("@pages/_onboarding/OnboardingPage"));
const OnboardingPricingPage = lazy(() => import("@pages/_onboarding/OnboardingPricingPage"));

const TermsPage = lazy(() => import("@pages/_legal/TermsPage"));
const PrivacyPage = lazy(() => import("@pages/_legal/PrivacyPage"));

const NotFoundPage = lazy(() => import("@pages/_error/NotFoundPage"));
const WorkspaceMembersPage = lazy(() => import("@pages/_settings/WorkspaceMembersPage"));
const ApiKeysPage = lazy(() => import("@pages/_settings/ApiKeysPage"));
const WebhooksPage = lazy(() => import("@pages/_settings/WebhooksPage"));
const PortabilityPage = lazy(() => import("@/features/workspaces/pages/PortabilityPage"));
const StoragePage = lazy(() => import("@pages/_dashboard/StoragePage"));

// Dev-only routes (only registered in development builds)
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
  const location = useLocation();

  if (isAuthenticated && isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (!user && isAuthenticated) {
    return <Loading />;
  }

  return <>{children}</>;
};
