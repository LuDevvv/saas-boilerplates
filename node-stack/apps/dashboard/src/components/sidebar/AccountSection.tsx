import { FC, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback, PlanBadge, Tooltip, TooltipTrigger, TooltipContent } from "@node-stack/ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AccountDropdown } from "./AccountDropdown";
import { AccountSectionProps } from "./types";

// Helper function to generate initials from user data
const getInitials = (user: AccountSectionProps["user"]): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  if (user?.firstName) {
    return user.firstName.slice(0, 2).toUpperCase();
  }

  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return "U";
};

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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const AccountTrigger = (
    <div
      className={cn(
        "flex items-center",
        isCollapsed ? "justify-center px-2 lg:px-3 mb-2" : "gap-3"
      )}
    >
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          "flex items-center transition-all duration-300 cursor-pointer border border-transparent",
          isCollapsed
            ? "h-10 w-10 justify-center rounded-full bg-gray-50/50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 hover:border-sidebar-border"
            : "gap-2.5 rounded-2xl p-1 lg:pr-3 text-left hover:bg-gray-50 dark:hover:bg-white/5"
        )}
      >
        <div className="relative shrink-0">
          <Avatar className={cn(
            "h-8 w-8 transition-all duration-300 shadow-sm",
            isPremium &&
            "ring-2 ring-primary/50 ring-offset-2 dark:ring-offset-gray-950"
          )}>
            <AvatarImage src={user?.avatar} alt={user?.firstName || "User"} />
            <AvatarFallback className="text-[10px] font-label bg-primary-100 text-primary-700">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </div>

        {!isCollapsed && (
          <div className="hidden sm:flex flex-col items-start mr-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-heading text-gray-900 dark:text-white leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-gray-400 transition-transform duration-200",
                  showDropdown && "rotate-180"
                )}
              />
            </div>
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className="relative">
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {AccountTrigger}
          </TooltipTrigger>
          <TooltipContent side="right" className="p-4 w-64 border-none shadow-premium bg-white dark:bg-[#121212]">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.firstName || "User"} />
                <AvatarFallback>{getInitials(user)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-heading text-gray-950 dark:text-white leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400 font-label">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-[10px] font-label text-gray-400 uppercase ">
                Plan actual
              </span>
              <PlanBadge
                isPremium={isPremium}
                planName={currentPlan?.name}
                size="sm"
              />
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        AccountTrigger
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
