import { FC, useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  PanelLeftOpen
} from "lucide-react";
import { motion } from "framer-motion";
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
import { UpgradePremiumWidget, TrialStatusWidget } from "../sidebar/SidebarWidgets.js";
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

    // If not superadmin, hide the Admin section
    if (user?.role !== "super_admin") {
      return rawSections.filter(section => section.title !== "Admin");
    }

    return rawSections;
  }, [propMenuSections, user?.role]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // The sidebar is visually collapsed if it's not mobile AND it's collapsed state AND NOT hovered
  const isVisuallyCollapsed = isMobile ? false : (isCollapsed && !isHovered);
  const isEffectiveCollapsed = isVisuallyCollapsed;

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
    if (isCollapsed) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHovered(false);
  };



  return (
    <TooltipProvider>
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-gray-900/50 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      <motion.div
        initial={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          x: isMobile ? (isOpen ? 0 : window.innerWidth) : 0,
          width: isMobile ? "75%" : (isVisuallyCollapsed ? 72 : 260),
        }}
        transition={{
          duration: 0.35,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn(
          "fixed z-50 flex flex-col pointer-events-none inset-y-0",
          isMobile ? "right-0" : "left-0"
        )}
      >
        {!isMobile && (
          <button
            onClick={handleToggle}
            className={cn(
              "absolute top-[50px] -right-4 z-[100] flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#0A0A0A] border border-sidebar-border text-sidebar-text shadow-md transition-all duration-300 pointer-events-auto",
              "hover:text-primary hover:scale-110 active:scale-95 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
            )}
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            <PanelLeftOpen className={cn("h-4 w-4 transition-transform duration-300", !isCollapsed && "rotate-180")} />
          </button>
        )}

        <aside
          className={cn(
            "h-full w-full flex flex-col bg-white dark:bg-[#0A0A0A] shadow-sm transition-shadow duration-300 pointer-events-auto",
            isMobile ? "border-l border-sidebar-border" : "border-r border-sidebar-border",
            isCollapsed && isHovered && "shadow-2xl z-50",
            isVisuallyCollapsed && "overflow-hidden"
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
            "flex flex-col h-full shrink-0",
            isEffectiveCollapsed ? "w-[72px]" : "w-full lg:w-[260px]"
          )}>
            <div className="flex-none">
              <WorkspaceSwitcher isCollapsed={isEffectiveCollapsed} />
            </div>

            <SidebarSearch
              isCollapsed={isEffectiveCollapsed}
              onTogglePalette={toggleCommandPalette}
            />

            <nav
              className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent custom-scrollbar",
                isEffectiveCollapsed ? "space-y-0 mt-2" : "space-y-1"
              )}
            >
              {menuSections.map((section, index) => (
                <SidebarSection
                  key={section.title || `section-${index}`}
                  title={isEffectiveCollapsed ? "" : section.title}
                  isCollapsed={isEffectiveCollapsed}
                >
                  <div className={cn("flex flex-col", isEffectiveCollapsed ? "gap-2" : "gap-1")}>
                    {section.items.map((item, i) => (
                      <SidebarItem
                        key={item.label || `item-${index}-${i}`}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        badge={item.badge}
                        subItems={item.subItems}
                        isCollapsed={isEffectiveCollapsed}
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
              "flex-none z-20 bg-inherit pb-6 px-4 space-y-4",
              isEffectiveCollapsed && "space-y-3"
            )}>
              <TrialStatusWidget isCollapsed={isEffectiveCollapsed} />
              <UpgradePremiumWidget isCollapsed={isEffectiveCollapsed} />
              <UserIdentity isCollapsed={isEffectiveCollapsed} currentPage={currentPage} />
            </div>
          </div>
        </aside>
      </motion.div>
    </TooltipProvider>
  );
};
