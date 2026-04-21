import type { FC } from "react";
import { useRef, useState } from "react";
import { Avatar } from "../ui/Avatar.js";
import { PlanBadge } from "../ui/PlanBadge.js";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AccountDropdown } from "./AccountDropdown.js";
import type { AccountSectionProps } from "./types.js";

// Helper function to generate initials from user data
const getInitials = (user: AccountSectionProps["user"]): string => {
  if (user?.name) {
    return user.name.slice(0, 2).toUpperCase();
  }
  return "U";
};

export const AccountSection: FC<AccountSectionProps> = ({
  isCollapsed,
  isPremium = false,
  user,
  currentPlan,
  onLogout,
  dropdownItems,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const accountRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (isCollapsed && accountRef.current) {
      const rect = accountRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      <div
        ref={accountRef}
        className={cn(
          "flex w-full items-center",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <button
          ref={buttonRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleDropdown}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl p-2 transition-all duration-200 cursor-pointer",
            !isCollapsed && "flex-1 text-left w-full pl-3"
          )}
        >
          <div className="relative">
            <Avatar
              src={user?.avatar}
              alt={user?.name || "User"}
              initials={getInitials(user)}
              size="sm"
              className={cn(
                "transition-all duration-300",
                isPremium &&
                  "ring-2 ring-violet-500/50 ring-offset-2 dark:ring-offset-gray-950"
              )}
            />
            {isPremium && (
              <div className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40 dark:border-gray-950" />
            )}
          </div>

          {!isCollapsed && (
            <div className="hidden min-w-0 flex-1 flex-col items-start gap-1 lg:flex">
              <p className="truncate text-sm font-bold leading-none text-gray-900 dark:text-white">
                {user?.name}
              </p>
              {currentPlan?.name && (
                <PlanBadge planName={currentPlan.name} size="xs" />
              )}
            </div>
          )}

          {!isCollapsed && (
            <ChevronDown
              className={cn(
                "h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200",
                showDropdown && "rotate-180"
              )}
            />
          )}
        </button>
      </div>

      {isCollapsed && showTooltip && (
        <div
          className="animate-in fade-in slide-in-from-left-2 pointer-events-none fixed z-[9999] w-64 rounded-2xl border border-transparent bg-white/95 p-4 shadow-2xl shadow-gray-200/30 backdrop-blur-xl duration-200 dark:bg-gray-800/95 dark:shadow-black/60"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex items-center gap-3 border-b border-transparent pb-3">
            <Avatar
              src={user?.avatar}
              alt={user?.name || "User"}
              initials={getInitials(user)}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Plan actual
            </span>
            <PlanBadge planName={currentPlan?.name || "Free"} size="sm" />
          </div>

          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-white dark:border-r-gray-800/95" />
        </div>
      )}

      <AccountDropdown
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        isPremium={isPremium}
        currentPlan={currentPlan}
        onLogout={onLogout}
        items={dropdownItems}
        triggerRef={buttonRef}
      />
    </div>
  );
};
