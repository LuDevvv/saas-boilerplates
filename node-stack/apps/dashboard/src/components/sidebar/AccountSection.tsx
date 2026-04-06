import { FC, useRef, useState } from "react";
import { Avatar } from "../ui/Avatar";
import { PlanBadge } from "../ui/PlanBadge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AccountDropdown } from "./AccountDropdown";
import { AccountSectionProps } from "./types";

// Helper function to generate initials from user data
const getInitials = (user: any): string => {
  if (user?.name && user?.lastName) {
    return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  if (user?.name) {
    return user.name.slice(0, 2).toUpperCase();
  }
  if (user?.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  return "U";
};

export const AccountSection: FC<AccountSectionProps> = ({
  isCollapsed,
  isPremium,
  user,
  planName = "Free",
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
              src={user?.profilePicture?.url}
              alt={user?.username || user?.name || "User"}
              initials={getInitials(user)}
              size="sm"
              className={cn(
                "transition-all duration-300",
                isPremium &&
                  "ring-2 ring-violet-500/50 ring-offset-2 dark:ring-offset-gray-950"
              )}
            />
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full border-2 border-white dark:border-gray-950 shadow-lg shadow-violet-500/40" />
            )}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 hidden lg:flex flex-col items-start gap-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white leading-none">
                {user?.name}
              </p>
              <PlanBadge planName={planName} size="xs" />
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
          className="pointer-events-none fixed z-[9999] w-64 rounded-2xl border border-gray-200/50 bg-white/95 backdrop-blur-xl p-4 shadow-2xl shadow-gray-200/30 dark:border-gray-700/50 dark:bg-gray-800/95 dark:shadow-black/30 animate-in fade-in slide-in-from-left-2 duration-200"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100/50 dark:border-gray-700/50">
            <Avatar
              src={user?.profilePicture?.url}
              alt={user?.username || user?.name || "User"}
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
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Plan actual
            </span>
            <PlanBadge
              isPremium={isPremium}
              planName={planName}
              size="sm"
            />
          </div>

          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-white dark:border-r-gray-800/95" />
        </div>
      )}

      <AccountDropdown
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        isPremium={isPremium}
        planName={planName}
        onLogout={onLogout}
        items={dropdownItems}
        triggerRef={buttonRef}
      />
    </div>
  );
};
