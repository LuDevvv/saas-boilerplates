import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "../dashboard/AppShell";
import { PricingSection } from "./PricingSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@workspace/ui";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { useCustomerPortal } from "../../hooks/useCustomerPortal";
import { EmptyState } from "../dashboard/EmptyState";
import {
  CreditCard,
  Sparkles,
  Loader2,
  ExternalLink,
  Zap,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Activity,
  Command,
  Fingerprint,
} from "lucide-react";

/**
 * Root entry point for the Billing Dashboard.
 */
export function BillingDashboard() {
  return (
    <AppShell>
      <BillingDashboardContent />
    </AppShell>
  );
}

/**
 * Inner billing dashboard content.
 */
function BillingDashboardContent() {
  const { isOrg } = useWorkspace();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true") {
      toast.success("Subscription updated!", {
        description: "Your plan changes have been synchronized successfully.",
        duration: 5000,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-premium-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-8 pb-8 border-b border-[#F1F3F6]">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F3F6] flex items-center justify-center text-[#1A1D1F] shadow-xl shadow-black/5">
              <CreditCard className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black text-premium-gradient tracking-tighter italic">
              Billing Node
            </h1>
          </div>
          <p className="text-[#8E95A2] font-semibold text-sm leading-relaxed max-w-md">
            Financial telemetry and subscription protocol management for your
            organization infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 h-14 bg-white border border-[#F1F3F6] rounded-2xl text-[10px] font-black text-[#1A1D1F] shadow-sm uppercase tracking-[0.2em] italic">
          <Activity className="w-4 h-4 text-[#16C8C7]" />
          Status: Nominal
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-teal))] rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
        <CurrentPlanBanner isOrg={isOrg} />
      </div>

      {/* Pricing Grid */}
      {isOrg && (
        <div className="pt-8">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#F1F3F6]" />
            <span className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.4em] italic">
              Available Upgrade Protocols
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#F1F3F6]" />
          </div>
          <PricingSection />
        </div>
      )}
    </div>
  );
}

/**
 * Displays contextual information about the current subscription status.
 */
function CurrentPlanBanner({ isOrg }: { isOrg: boolean }) {
  const { isLoading, hasActiveSubscription, subscription } =
    useSubscriptionStatus();
  const { openPortal, isLoading: isPortalLoading } = useCustomerPortal();

  if (!isOrg) {
    return (
      <div className="py-20">
        <EmptyState
          title="Namespace Isolation"
          description="Financial operations are restricted to Organization Nodes. Elevate your environment to access enterprise-grade billing."
          icon={<ShieldCheck className="w-12 h-12" />}
          actionLabel="Provision Organization"
          onAction={() => (window.location.href = "/workspaces")}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="dashboard-card border-none animate-pulse bg-white">
        <CardHeader className="p-10">
          <div className="h-8 w-48 bg-[#F8F9FB] rounded-xl" />
          <div className="h-4 w-72 bg-[#F8F9FB] rounded-lg mt-4" />
        </CardHeader>
        <CardContent className="flex items-center justify-between p-10 pt-0">
          <div className="flex gap-12">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-[#F8F9FB] rounded-lg" />
              <div className="h-6 w-32 bg-[#F8F9FB] rounded-lg" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-24 bg-[#F8F9FB] rounded-lg" />
              <div className="h-6 w-32 bg-[#F8F9FB] rounded-lg" />
            </div>
          </div>
          <div className="h-16 w-56 bg-[#F8F9FB] rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <Card className="dashboard-card border-none bg-[#1A1D1F] p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[hsl(var(--brand-primary))]/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[hsl(var(--brand-primary))] rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-start gap-8">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              <Zap className="w-10 h-10 text-[hsl(var(--brand-primary))] fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#16C8C7]">
                  Protocol v1.0
                </span>
                <h2 className="text-3xl font-black italic tracking-tighter">
                  Community Node Active
                </h2>
              </div>
              <p className="text-white/50 font-semibold text-lg max-w-xl leading-relaxed">
                Your environment is currently running on the limited Community
                tier. Unlock high-concurrency clusters and enterprise protocols
                by elevating your subscription.
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            className="bg-white text-[#1A1D1F] hover:bg-white/90 rounded-2xl h-20 px-10 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 transition-all border-none italic group-hover:-translate-y-1"
          >
            Review Upgrade Protocols
            <ArrowRight className="w-5 h-5 ml-3" strokeWidth={3} />
          </Button>
        </div>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <Card className="dashboard-card border-none overflow-hidden group bg-white shadow-2xl shadow-black/[0.02]">
      <div className="h-1.5 w-full bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[#16C8C7] to-[hsl(var(--brand-primary))]" />
      <CardHeader className="p-10 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-4 h-4 rounded-full bg-[#16C8C7] shadow-[0_0_15px_#16C8C7] animate-pulse" />
              <CardTitle className="text-3xl font-black text-[#1A1D1F] tracking-tighter italic">
                Active Node Protocol:{" "}
                <span className="text-[hsl(var(--brand-primary))]">
                  {subscription?.status === "trialling"
                    ? "BETA TRIAL"
                    : subscription?.planId?.toUpperCase() || "ENTERPRISE"}
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-[#8E95A2] font-semibold text-base flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#16C8C7]" />
              Subscription integrity verified. Secure tunnel active for{" "}
              <span className="text-[#1A1D1F] italic font-black">
                {subscription?.status}
              </span>{" "}
              status.
            </CardDescription>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F9FB] text-[#C1C7D0] group-hover:text-[#1A1D1F] group-hover:rotate-12 transition-all duration-500">
            <Zap className="w-10 h-10" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col xl:flex-row items-center justify-between gap-12 p-10 pt-4">
        <div className="flex flex-wrap gap-12 w-full lg:w-auto">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] border border-[#F1F3F6] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Command className="w-6 h-6 text-[#1A1D1F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.2em] mb-1">
                Module ID
              </p>
              <p className="text-lg font-black text-[#1A1D1F] italic tracking-tight">
                {subscription?.planId || "EdgeStack.Core"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] border border-[#F1F3F6] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-[#1A1D1F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.2em] mb-1">
                Termination Date
              </p>
              <p className="text-lg font-black text-[#1A1D1F] italic tracking-tight">
                {subscription?.nextPaymentAt
                  ? formatDate(subscription.nextPaymentAt)
                  : subscription?.endsAt
                    ? `Ejecting ${formatDate(subscription.endsAt)}`
                    : "Indefinite Operation"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
          <Button
            onClick={openPortal}
            disabled={isPortalLoading}
            className="flex-1 xl:flex-none h-16 px-10 bg-[#1A1D1F] text-white hover:bg-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all italic flex items-center justify-center gap-3 border-none"
          >
            {isPortalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {isPortalLoading
              ? "Synchronizing Portal..."
              : "Secure Billing Portal"}
          </Button>
        </div>
      </CardContent>
      <div className="px-10 py-5 bg-[#F8F9FB] border-t border-[#F1F3F6] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
          <Fingerprint className="w-3.5 h-3.5" />
          Auth-Session: Verified
        </div>
        <div className="text-[9px] font-black text-[#C1C7D0] uppercase tracking-[0.3em] italic">
          Infrastructure: Mainnet Cluster 04
        </div>
      </div>
    </Card>
  );
}
