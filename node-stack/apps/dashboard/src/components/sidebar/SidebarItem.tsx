import { ChevronDown } from "lucide-react";
import { FC, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/classNames";
import LinkTransition from "../utils/LinkTransition.js";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@node-stack/ui";
import { SidebarItemProps } from "./types.js";
import { useSidebarStore } from "@/stores/sidebarStore";

export const SidebarItem: FC<SidebarItemProps> = ({
  id,
  icon: Icon,
  label,
  path,
  badge,
  isActive,
  isCollapsed,
  subItems,
  level = 0,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { isSubmenuExpanded, toggleSubmenu, closeMobile } = useSidebarStore();
  const itemKey = id || path || label;
  const isExpanded = isSubmenuExpanded(itemKey);

  const hasSubItems = subItems && subItems.length > 0;

  // Colapsado: usar ruta propia o recurrir al primer sub-item
  const collapsedPath =
    path ||
    (isCollapsed && subItems && subItems.length > 0
      ? subItems[0]?.path
      : undefined);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSubmenu(itemKey);
  };

  const handleMainClick = (e: React.MouseEvent) => {
    // Si tiene subitems, alternamos el menú
    if (hasSubItems && !isCollapsed) {
      if (!path) {
        e.preventDefault();
      }
      toggleSubmenu(itemKey);
    }
  };

  const isDescendantActive = (items: typeof subItems): boolean => {
    if (!items) return false;
    return items.some((item) => {
      const match = !!(item.path === '/'
        ? location.pathname === '/'
        : item.path && location.pathname.startsWith(item.path));
      if (match) return true;
      if (item.subItems) return isDescendantActive(item.subItems);
      return false;
    });
  };

  const hasActiveChild = isDescendantActive(subItems);

  // Activo si está seleccionado o tiene un hijo activo
  const isVisuallyActive = isActive || hasActiveChild;

  const ItemContent = (
    <div
      ref={itemRef}
      className={cn(
        "group relative flex items-center transition-all duration-200 cursor-pointer pl-[10px] pr-2 py-2 border border-transparent outline-none",
        isCollapsed ? "w-10 h-10 justify-center pl-0 pr-0 rounded-full" : "w-full rounded-lg",
        isVisuallyActive
          ? "bg-sidebar-active text-primary font-heading shadow-sm"
          : "text-sidebar-text/70 hover:bg-sidebar-active/50 hover:text-sidebar-text-active",
        "gap-3",
        level > 0 && !isCollapsed && "ml-4"
      )}
      onClick={handleMainClick}
    >

      {Icon && (
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200 relative"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isVisuallyActive
                ? "text-primary"
                : "text-sidebar-text/60 group-hover:text-sidebar-text-active transition-colors duration-200"
            )}
          />
          {isCollapsed && badge && badge !== "Nuevo" && (
            <div className="absolute -right-3 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-label text-white shadow-md ring-2 ring-white dark:ring-[#0A0A0A] z-10">
              {badge}
            </div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div className="flex flex-1 items-center gap-3 animate-fade-in-fast overflow-hidden">
          <span className={cn(
            "flex-1 truncate text-sm",
            isVisuallyActive ? "text-primary" : "text-inherit"
          )}>
            {label}
          </span>
          {badge && (
            <span className={cn(
              "flex h-5 min-w-[20px] items-center justify-center rounded-lg px-1.5 text-[9px] font-label shadow-sm transition-colors uppercase ",
              badge === "Nuevo"
                ? "bg-primary text-white"
                : "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
            )}>
              {badge}
            </span>
          )}
          {hasSubItems && (
            <ChevronDown
              onClick={handleChevronClick}
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200 text-sidebar-text/40 hover:text-primary cursor-pointer",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
      )}
    </div>
  );

  // Sub-items recursivos
  const renderSubItems = (items: typeof subItems, parentLevel: number) => {
    if (!items) return null;

    return items.map((subItem) => {
      const isSubItemActive = !!(subItem.path === '/'
        ? location.pathname === '/'
        : subItem.path && typeof subItem.path === 'string' && location.pathname.startsWith(subItem.path));
      const hasNestedItems = subItem.subItems && subItem.subItems.length > 0;

      if (hasNestedItems) {
        return (
          <SidebarItem
            key={subItem.id || subItem.path || subItem.label}
            id={subItem.id}
            icon={subItem.icon}
            label={subItem.label}
            path={subItem.path}
            isActive={isSubItemActive}
            isCollapsed={false}
            subItems={subItem.subItems}
            level={parentLevel + 1}
          />
        );
      }

      return (
        <LinkTransition
          key={subItem.id || subItem.path}
          href={subItem.path}
          className="w-full text-left"
          callBack={closeMobile}
        >
          <div
            id={subItem.id}
            className={cn(
              "flex items-center gap-3 px-3 py-1.5 transition-all duration-200 relative group cursor-pointer border border-transparent rounded-lg",
              isSubItemActive
                ? "bg-sidebar-active/80 text-sidebar-text-active font-heading"
                : "text-sidebar-text hover:bg-sidebar-active/50 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {subItem.icon && (
              <subItem.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                  isSubItemActive
                    ? "text-sidebar-text-active"
                    : "text-sidebar-text group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )}
              />
            )}
            <span className="flex-1 truncate text-sm">
              {subItem.label}
            </span>
          </div>
        </LinkTransition>
      );
    });
  };

  const renderMainItem = () => {
    const content = (
      <div className="w-full">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {collapsedPath ? (
                <LinkTransition
                  href={collapsedPath}
                  className="w-full text-left block"
                  callBack={closeMobile}
                >
                  {ItemContent}
                </LinkTransition>
              ) : (
                <div>{ItemContent}</div>
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          path ? (
            <LinkTransition
              href={path}
              className="w-full text-left block"
              callBack={closeMobile}
            >
              {ItemContent}
            </LinkTransition>
          ) : (
            <div>{ItemContent}</div>
          )
        )}
      </div>
    );

    return content;
  };

  return (
    <>
      {hasSubItems && !isCollapsed ? (
        <div className="transition-all duration-300">
          {renderMainItem()}

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    height: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    },
                    opacity: { duration: 0.25 },
                    filter: { duration: 0.2 }
                  }
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  filter: "blur(4px)",
                  transition: {
                    height: { duration: 0.25 },
                    opacity: { duration: 0.15 },
                    filter: { duration: 0.1 }
                  }
                }}
                className="overflow-hidden"
              >
                <div
                  className="mt-1 space-y-0.5 px-6 pb-2 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Main vertical line for the whole group */}
                  <div className="absolute left-[25px] top-0 bottom-4 w-px bg-sidebar-border opacity-50" />
                  {renderSubItems(subItems, level)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        renderMainItem()
      )}
    </>
  );
};
