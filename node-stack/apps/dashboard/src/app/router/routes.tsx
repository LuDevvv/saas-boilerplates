import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/stores/useAuth";
import { protectedGuard, guestGuard } from "./routeguards";

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

const OnboardingPage = lazy(() => import("@pages/_onboarding/OnboardingPage"));
const OnboardingPricingPage = lazy(() => import("@pages/_onboarding/OnboardingPricingPage"));

const TermsPage = lazy(() => import("@pages/_legal/TermsPage"));
const PrivacyPage = lazy(() => import("@pages/_legal/PrivacyPage"));

const NotFoundPage = lazy(() => import("@pages/_error/NotFoundPage"));
const WorkspaceMembersPage = lazy(() => import("@pages/_settings/WorkspaceMembersPage"));
const ApiKeysPage = lazy(() => import("@pages/_settings/ApiKeysPage"));
const WebhooksPage = lazy(() => import("@pages/_settings/WebhooksPage"));

const LoadingFallback = () => <Loading />;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Guest Routes - Redirect to dashboard if authenticated */}
        <Route path="/auth/sign-in" element={guestGuard(<SignInPage />)} />
        <Route path="/auth/sign-up" element={guestGuard(<SignUpPage />)} />
        <Route path="/auth/forgot-password" element={guestGuard(<ForgotPasswordPage />)} />
        <Route path="/auth/reset-password" element={guestGuard(<ResetPasswordPage />)} />
        <Route path="/auth/verify-email" element={guestGuard(<VerifyEmailPage />)} />

        {/* Legacy redirects */}
        <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/register" element={<Navigate to="/auth/sign-up" replace />} />

        {/* Legal pages (public) */}
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />

        {/* Protected routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Profile */}
          <Route path="profile/personal" element={<PersonalProfilePage />} />
          <Route path="profile/company" element={<CompanyProfilePage />} />

          {/* Payments */}
          <Route path="payments" element={<BillingPage />} />
          <Route path="payments/pricing" element={<PricingPage />} />

          {/* Other features */}
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="tickets/create" element={<CreateTicketPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="ai" element={<AIPlaygroundPage />} />

          {/* Admin */}
          <Route path="admin" element={<AdminOverviewPage />} />
          <Route path="admin/users" element={<ManageUsersPage />} />
          <Route path="admin/audit" element={<AuditLogsPage />} />
          
          {/* Settings */}
          <Route path="settings/members" element={<WorkspaceMembersPage />} />
          <Route path="settings/api-keys" element={<ApiKeysPage />} />
          <Route path="settings/webhooks" element={<WebhooksPage />} />
        </Route>

        {/* Standalone protected routes (no layout) */}
        <Route
          path="/payments/checkout"
          element={protectedGuard(<CheckoutPage />)}
        />
        <Route
          path="/onboarding"
          element={protectedGuard(<OnboardingPage />)}
        />
        <Route
          path="/onboarding/pricing"
          element={protectedGuard(<OnboardingPricingPage />)}
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
