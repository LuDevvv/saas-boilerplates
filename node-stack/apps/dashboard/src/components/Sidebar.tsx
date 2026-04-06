import { FC, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LogOut,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/utils/classNames";
import { useAuth } from "@/hooks/stores/useAuth";
import { LinkTransition } from "@components/utils/LinkTransition";
import { SidebarItem } from "./sidebar/SidebarItem";
import { SidebarSection } from "./sidebar/SidebarSection";
import { menuSections as defaultMenuSections } from "@/config/navigation";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { siteConfig } from "@/config/site-config";
import { SidebarProps, MenuSection, SubMenuItem } from "./sidebar/types";
import { usePermission } from "@/hooks/usePermission";

export const Sidebar: FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  menuSections: propMenuSections,
  currentPath: propCurrentPath,
}) => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(
    propCurrentPath || location.pathname
  );

  const { hasPermission } = usePermission();
  const { logout } = useAuth();
  const { activeWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    setCurrentPage(propCurrentPath || location.pathname);
  }, [propCurrentPath, location.pathname]);

  const replaceWorkspaceId = (path: string | undefined) => {
    if (!path) return path;
    return path.replace(":id", activeWorkspaceId || "default");
  };

  const menuSections = useMemo(
    () => {
      const sections = (propMenuSections || defaultMenuSections) as MenuSection[];
      return sections.filter((section: MenuSection) => {
        // If section has a permission, check it
        if (section.permission && !hasPermission(section.permission)) return false;
        
        // Only keep sections that have at least one permitted item
        const permittedItems = section.items.filter(item => 
          !item.permission || hasPermission(item.permission)
        );
        
        return permittedItems.length > 0;
      }).map((section: MenuSection) => ({
        ...section,
        items: section.items
          .filter(item => !item.permission || hasPermission(item.permission))
          .map(item => ({
            ...item,
            path: replaceWorkspaceId(item.path),
            subItems: item.subItems?.map(sub => ({
              ...sub,
              path: replaceWorkspaceId(sub.path)
            })) as SubMenuItem[] | undefined
          }))
      }));
    },
    [propMenuSections, hasPermission, activeWorkspaceId]
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 z-40 flex h-screen flex-col transition-[width,transform,background-color] duration-300",
          "bg-white dark:bg-gray-900 border-l border-gray-200 lg:border-l-0 lg:border-r dark:lg:border-r dark:lg:border-gray-700 font-sans",
          "right-0 lg:left-0 lg:right-auto",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px] overflow-visible" : "w-72 lg:w-56 overflow-visible"
        )}
      >
        <div
          className={cn(
            "flex h-16 flex-shrink-0 items-center justify-center border-b border-gray-200 dark:border-gray-700 relative z-20 bg-inherit",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          {!isCollapsed && (
            <LinkTransition
              href="/"
              className="flex items-center absolute left-4 active:scale-95 transition-transform"
            >
              <img
                className="h-7 w-auto"
                src={siteConfig.defaultLogo}
                alt={siteConfig.name}
              />
              <span className="ml-3 font-black text-xs uppercase tracking-tighter text-gray-900 dark:text-white truncate max-w-[100px]">
                {siteConfig.name}
              </span>
            </LinkTransition>
          )}

          <button
            onClick={onToggleCollapse}
            className={cn(
              "absolute rounded-xl p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100/80 hover:text-gray-700 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-300 cursor-pointer",
              isCollapsed ? "left-1/2 -translate-x-1/2" : "right-4",
              "hidden lg:flex"
            )}
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          {!isCollapsed && (
            <button
              onClick={onClose}
              className="absolute right-4 rounded-xl p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100/80 hover:text-gray-700 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-300 lg:hidden cursor-pointer"
              aria-label="Close"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent custom-scrollbar",
            isCollapsed ? "space-y-0 mt-2" : "space-y-1"
          )}
        >
          {menuSections.map((section, index) => (
            <SidebarSection
              key={section.title || `section-${index}`}
              title={isCollapsed ? "" : section.title}
              isCollapsed={isCollapsed}
            >
              <div className={cn("flex flex-col", isCollapsed ? "gap-2" : "gap-1")}>
                {section.items.map((item, i) => (
                  <SidebarItem
                    key={item.label || `item-${index}-${i}`}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    badge={item.badge}
                    subItems={item.subItems}
                    isCollapsed={isCollapsed}
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

        <div className="border-t border-gray-200 p-3 dark:border-gray-800 flex-shrink-0 z-20 bg-inherit">
          <button
            onClick={() => logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer overflow-hidden group",
              "text-gray-400 hover:bg-red-50/50 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-950/20 dark:hover:text-red-400",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && (
              <span className="truncate">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
