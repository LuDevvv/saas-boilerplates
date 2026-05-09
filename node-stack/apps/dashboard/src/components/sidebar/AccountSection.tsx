import { Avatar, AvatarImage, AvatarFallback } from "@node-stack/ui";
import { ChevronDown } from "lucide-react";
import { FC, useRef, useState } from "react";


import { AccountDropdown } from "./AccountDropdown";
import { AccountSectionProps } from "./types";

import { cn } from "@/utils/classNames";

function getInitials(user: AccountSectionProps["user"]): string {
  if (!user) return "U";
  const first = user.firstName ?? "";
  const last  = user.lastName  ?? "";
  if (first && last) return `${String(first)[0]}${String(last)[0]}`.toUpperCase();
  if (first)         return String(first).slice(0, 2).toUpperCase();
  if (user.email)    return user.email.slice(0, 2).toUpperCase();
  return "U";
}

/** Returns only the first name for compact spaces to avoid overflow. */
function getDisplayName(user: AccountSectionProps["user"]): string {
  if (!user) return "Usuario";
  return user.firstName || user.email?.split("@")[0] || "Usuario";
}

/** Returns the full name for contexts with more space. */
function getFullName(user: AccountSectionProps["user"]): string {
  if (!user) return "Usuario";
  const first = user.firstName ?? "";
  const last  = user.lastName  ?? "";
  return [first, last].filter(Boolean).join(" ") || user.email || "Usuario";
}

export const AccountSection: FC<AccountSectionProps> = ({
  isCollapsed,
  isPremium,
  user,
  currentPlan,
  onLogout,
  dropdownItems,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl transition-colors duration-150 outline-none cursor-pointer border border-transparent",
          "hover:bg-gray-100 dark:hover:bg-surface-hover",
          isCollapsed
            ? "h-9 w-9 justify-center p-0"
            : "p-1.5 sm:px-2.5 sm:py-2"
        )}
      >
        {/* Avatar — always visible, slightly larger on mobile as the sole touch target */}
        <Avatar className={cn(
          "shrink-0 border border-border",
          isCollapsed ? "h-8 w-8" : "h-8 w-8 sm:h-7 sm:w-7",
          isPremium && "ring-2 ring-primary/30 ring-offset-1 dark:ring-offset-[#0A0A0A]"
        )}>
          <AvatarImage
            src={user?.avatarUrl}
            alt={getDisplayName(user)}
          />
          <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>

        {/* Name + plan — hidden on mobile, visible on sm+ when not collapsed */}
        {!isCollapsed && (
          <div className="hidden sm:flex flex-col flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-fg truncate leading-snug">
              {getDisplayName(user)}
            </p>
            <p className="text-[11px] text-fg-muted truncate leading-snug">
              {isPremium ? (currentPlan?.planId ?? "Pro") : "Plan Gratuito"}
            </p>
          </div>
        )}

        {/* Chevron — hidden on mobile */}
        {!isCollapsed && (
          <ChevronDown
            className={cn(
              "hidden sm:block h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200",
              showDropdown && "rotate-180"
            )}
          />
        )}
      </button>

      <AccountDropdown
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        user={user}
        isPremium={isPremium}
        currentPlan={currentPlan}
        onLogout={onLogout}
        items={dropdownItems}
        triggerRef={buttonRef}
        getFullName={() => getFullName(user)}
      />
    </div>
  );
};
