import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import type { FC, PropsWithChildren } from "react";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/utils/classNames";
import { CommandPalette } from "@/components/shared/CommandPalette";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: FC<PropsWithChildren<NavbarSidebarLayoutProps>> =
  function ({ children, isFooter = true }) {
    const {
      isCollapsed,
      isMobileOpen,
      toggleCollapse,
      closeMobile,
      openMobile,
    } = useSidebarState();

    return (
      <div className="flex h-screen bg-[#F7F7F7] dark:bg-[#0A0A0A] overflow-hidden">
        <CommandPalette />
        <Sidebar
          isOpen={isMobileOpen}
          onClose={closeMobile}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <div
          className={cn(
            "flex flex-1 flex-col h-full min-w-0 transition-all duration-300",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          )}
        >
          <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0A0A0A] shadow-sm">
            <Navbar onMenuClick={openMobile} />
            <MainContent isFooter={isFooter}>{children}</MainContent>
          </div>
        </div>
      </div>
    );
  };

const MainContent: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({
  children,
}) {
  return (
    <main className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
      <div className="px-3 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1920px] flex-col gap-6">
          {children}
        </div>
      </div>
    </main>
  );
};

export default NavbarSidebarLayout;
