import { FC } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/stores/useAuth";
import { AccountSection } from "./sidebar/AccountSection";
import { accountDropdownItems } from "@/config/navigation";
import { LinkTransition } from "@components/utils/LinkTransition";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeStore } from "@/stores/themeStore";
import { siteConfig } from "@/config/site-config";
import Breadcrumbs from "./Breadcrumbs";

interface NavbarProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme } = useThemeStore();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-100 dark:border-white/10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300">
      {/* Left Section: Logo (Mobile) or Breadcrumbs (Desktop) */}
      <div className="flex items-center gap-4">
        <LinkTransition href="/" className="lg:hidden flex items-center">
          <img className="h-6 w-auto" src={theme === 'dark' ? siteConfig.logo.dark : siteConfig.logo.light} alt={siteConfig.name} />
        </LinkTransition>

        <div className="hidden lg:flex items-center">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Section: Account + Menu */}
      <div className="flex items-center gap-1.5 lg:gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AccountSection
              isCollapsed={false}
              user={user}
              onLogout={logout}
              dropdownItems={accountDropdownItems}
            />
          </div>
        )}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
    </header>
  );
};
