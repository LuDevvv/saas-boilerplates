import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import type { FC, PropsWithChildren } from "react";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/utils/classNames";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = ({
  children,
  isFooter = true,
}) => {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    closeMobile,
    openMobile,
  } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <Sidebar
        isOpen={isMobileOpen}
        onClose={closeMobile}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-56"
        )}
      >
        <Navbar onMenuClick={openMobile} />

        <MainContent isFooter={isFooter}>{children}</MainContent>
      </div>
    </div>
  );
};

const MainContent: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = ({
  children,
}) => {
  return (
    <main className="relative flex flex-1 flex-col">
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1920px] flex-col gap-6">
          {children}
        </div>
      </div>
    </main>
  );
};

export default NavbarSidebarLayout;
