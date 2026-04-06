import { FC } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/stores/useAuth";
import { AccountSection } from "./sidebar/AccountSection";
import { accountDropdownItems } from "@/config/navigation";
import { LinkTransition } from "@components/utils/LinkTransition";
import { Breadcrumbs } from "./Breadcrumbs";
import { siteConfig } from "@/config/site-config";
import { WorkspaceSwitcher } from "./navbar/WorkspaceSwitcher";

interface NavbarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, isPremium, logout } = useAuth();
  
  // Generic plan name retrieval - can be enhanced later
  const planName = isPremium ? "Premium" : "Free";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all duration-300">
      {/* Left Section: Logo (Mobile) or Breadcrumbs (Desktop) */}
      <div className="flex items-center gap-4">
        <LinkTransition href="/" className="lg:hidden flex items-center">
          <img className="h-6 w-auto" src={siteConfig.defaultLogo} alt={siteConfig.name} />
        </LinkTransition>

        <div className="hidden lg:flex items-center gap-4">
          <WorkspaceSwitcher />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Section: Account + Menu */}
      <div className="flex items-center gap-1.5 lg:gap-3">
        {user && (
          <div className="flex items-center">
            <AccountSection
              isCollapsed={false}
              isPremium={isPremium}
              user={user}
              planName={planName}
              onLogout={logout}
              dropdownItems={accountDropdownItems}
            />
          </div>
        )}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
    </header>
  );
};
