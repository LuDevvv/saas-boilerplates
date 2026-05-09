import { FC, useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/utils/classNames";
import { useAuth } from "@/hooks/stores/useAuth";
import { useSidebarStore } from "@/stores/sidebarStore";
import { SidebarItem } from "../sidebar/SidebarItem.js";
import { SidebarSection } from "../sidebar/SidebarSection.js";
import { TooltipProvider } from "@node-stack/ui";
import { getMenuSections } from "@/config/navigation";
import { SidebarProps } from "../sidebar/types.js";
import { WorkspaceSwitcher } from "../sidebar/WorkspaceSwitcher.js";
import { UserIdentity } from "../sidebar/UserIdentity.js";
import { TrialStatusWidget } from "../sidebar/SidebarWidgets.js";
import { SidebarSearch } from "../sidebar/SidebarSearch.js";

export const Sidebar: FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  menuSections: propMenuSections,
  currentPath: propCurrentPath,
}) => {
  const { toggleCommandPalette, isHovered, setHovered } = useSidebarStore();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(
    propCurrentPath || location.pathname
  );

  const { user } = useAuth();

  useEffect(() => {
    setCurrentPage(propCurrentPath || location.pathname);
  }, [propCurrentPath, location.pathname]);

  const menuSections = useMemo(() => {
    const rawSections = propMenuSections || getMenuSections();

    const isAdmin = user?.role === "admin" || user?.role === "super_admin" || !!(user as any)?.isAdmin;

    if (!isAdmin) {
      return rawSections.filter(section => !section.adminOnly);
    }

    return rawSections;
  }, [propMenuSections, user?.role]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const isVisuallyCollapsed = isMobile ? false : (isCollapsed && !isHovered);
  const isEffectiveCollapsed = isVisuallyCollapsed;

  // Delays content layout switch when expanding so text doesn't wrap inside a
  // still-narrow sidebar. Collapses content immediately.
  const [displayCollapsed, setDisplayCollapsed] = useState(isEffectiveCollapsed);
  const expandTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    if (isEffectiveCollapsed) {
      // Collapsing: keep expanded content while sidebar shrinks, switch to icons when sidebar
      // is already ~97% closed (~77px) so icons never appear in a wide container
      expandTimerRef.current = setTimeout(() => setDisplayCollapsed(true), 150);
    } else {
      // Expanding: show expanded content when sidebar is ~99% open (~239px)
      expandTimerRef.current = setTimeout(() => setDisplayCollapsed(false), 200);
    }
    return () => { if (expandTimerRef.current) clearTimeout(expandTimerRef.current); };
  }, [isEffectiveCollapsed]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      onClose();
      return;
    }
    onToggleCollapse();
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (document.body.style.overflow === "hidden") return;
    if (isCollapsed) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (document.body.style.overflow === "hidden") return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHovered(false);
  };

  const sidebarWidth = isMobile ? "min(320px, 85%)" : (isVisuallyCollapsed ? 72 : 240);
  const sidebarX = isMobile ? (isOpen ? 0 : "100%") : 0;

  return (
    <TooltipProvider>
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-gray-900/50 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: sidebarWidth,
          transform: isMobile ? `translateX(${sidebarX})` : "none",
        }}
        className={cn(
          "fixed z-50 flex flex-col pointer-events-none inset-y-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isMobile ? "right-0" : "left-0"
        )}
      >
        {!isMobile && (
          <button
            onClick={handleToggle}
            className={cn(
              "absolute top-[50px] -right-4 z-[100] flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-fg-muted shadow-[var(--shadow-sm)] transition-all duration-300 pointer-events-auto",
              "hover:text-primary hover:border-primary/30 hover:scale-110 active:scale-95",
              "focus:outline-none focus-visible:outline-none"
            )}
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            <PanelLeftOpen className={cn("h-4 w-4 transition-transform duration-300", !isCollapsed && "rotate-180")} />
          </button>
        )}

        <aside
          className={cn(
            "h-full w-full flex flex-col bg-sidebar shadow-premium transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto overflow-hidden",
            isMobile ? "border-l border-sidebar-border" : "border-r border-sidebar-border",
            isCollapsed && isHovered && "shadow-2xl z-50",
          )}
        >
          {isMobile && isOpen && (
            <button
              onClick={onClose}
              className="absolute top-5 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-text"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}

          <div className={cn(
            "flex flex-col h-full shrink-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isMobile ? "w-full" : (isEffectiveCollapsed ? "w-[72px]" : "w-[240px]")
          )}>
            <div className={cn("flex-none w-full", displayCollapsed && "flex justify-center items-center")}>
              <WorkspaceSwitcher isCollapsed={displayCollapsed} />
            </div>

            <SidebarSearch
              isCollapsed={displayCollapsed}
              onTogglePalette={toggleCommandPalette}
            />

            <nav
              className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent custom-scrollbar transition-all duration-300",
                displayCollapsed ? "space-y-2 mt-2 px-0 flex flex-col items-center" : "space-y-1 px-4 animate-fade-in"
              )}
            >
              {menuSections.map((section, index) => (
                <SidebarSection
                  key={section.title || `section-${index}`}
                  title={displayCollapsed ? "" : section.title}
                  isCollapsed={displayCollapsed}
                >
                  <div className={cn("flex flex-col w-full", displayCollapsed ? "gap-2" : "gap-1")}>
                    {section.items.map((item, i) => (
                      <SidebarItem
                        key={item.label || `item-${index}-${i}`}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        badge={item.badge}
                        subItems={item.subItems}
                        isCollapsed={displayCollapsed}
                        isActive={
                          item.path === "/"
                            ? currentPage === "/"
                            : item.path ? currentPage.startsWith(item.path) : false
                        }
                      />
                    ))}
                  </div>
                </SidebarSection>
              ))}
            </nav>

            <div className={cn(
              "flex-none z-20 bg-inherit pb-6 space-y-4 transition-all duration-300",
              displayCollapsed ? "px-0 flex flex-col items-center" : "px-4 animate-fade-in"
            )}>
              <TrialStatusWidget isCollapsed={displayCollapsed} />
              {/* <UpgradePremiumWidget isCollapsed={displayCollapsed} /> */}
              <UserIdentity isCollapsed={displayCollapsed} currentPage={currentPage} />
            </div>
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
};
