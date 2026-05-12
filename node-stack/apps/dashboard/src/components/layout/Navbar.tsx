import type { CurrentPlan } from "@components/sidebar/types";
import { LinkTransition } from "@components/utils/LinkTransition";
import { Menu } from "lucide-react";
import { FC } from "react";

import { Breadcrumbs } from "./Breadcrumbs";
import { NotificationBell } from "../notifications/NotificationBell";
import { AccountSection } from "../sidebar/AccountSection";
import { ThemeToggle } from "../ui/ThemeToggle";

import { Logo } from "@/assets/logo/logo";
import { accountDropdownItems } from "@/config/navigation";
import { useSubscription } from "@/features/billing/hooks/useBilling";
import { useAuth } from "@/hooks/stores/useAuth";

interface NavbarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

const PLAN_NAMES: Record<string, string> = {
  pro: "Growth",
  elite: "Unlimited",
  free: "Starter",
};

export const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { data: subscription } = useSubscription();

  const hasActiveSub = !!subscription && subscription.status !== "none" && subscription.status !== "cancelled" && subscription.status !== "canceled";
  const isPremium = hasActiveSub;

  const currentPlan = hasActiveSub
    ? {
        planId: subscription.planId,
        planName: subscription.planName ?? PLAN_NAMES[subscription.planId] ?? "Growth",
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      }
    : null;

  return (
    <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between bg-white dark:bg-canvas px-6 border-b border-sidebar-border transition-all duration-300">
      {/* Left Section: Logo (Mobile) or Breadcrumbs (Desktop) */}
      <div className="flex items-center gap-4">
        <LinkTransition
          href="/"
          className="lg:hidden flex items-center transition-transform duration-200 active:scale-[0.97]"
        >
          <Logo variant="full" width={110} height={28} />
        </LinkTransition>

        <div className="hidden lg:flex items-center">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Section: Account + Menu + Theme/Notifications */}
      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1 lg:gap-2 mr-1 lg:mr-2 pr-2 lg:pr-4 border-r border-sidebar-border">
            <ThemeToggle />
            <NotificationBell />
          </div>

          <AccountSection
            isCollapsed={false}
            isPremium={isPremium}
            user={user}
            currentPlan={currentPlan as CurrentPlan | null}
            onLogout={logout}
            dropdownItems={accountDropdownItems}
          />
        </div>

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center h-9 w-9 rounded-xl text-sidebar-text/60 transition-all hover:bg-gray-100 hover:text-primary active:scale-[0.97] dark:hover:bg-surface-hover lg:hidden cursor-pointer outline-none border border-transparent hover:border-sidebar-border"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
};
