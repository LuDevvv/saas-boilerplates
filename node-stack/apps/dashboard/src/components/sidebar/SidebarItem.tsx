import { ChevronDown } from "lucide-react";
import { FC, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/classNames";
import LinkTransition from "../utils/LinkTransition.js";
import { Tooltip } from "../ui/Tooltip.js";
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
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

  const handleMouseEnter = () => {
    if (isCollapsed && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex items-center transition-all duration-200 cursor-pointer w-full",
        isVisuallyActive
          ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 font-bold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white",
        isCollapsed
          ? "justify-center px-2 py-3 rounded-xl"
          : "gap-3 px-3 py-2.5 rounded-xl",
        level > 0 && !isCollapsed && "ml-2"
      )}
      onClick={handleMainClick}
    >
      {/* Active Accent Bar */}
      {isVisuallyActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary-600 rounded-r-full" />
      )}

      {/* Hover Glow Effect */}
      {!isVisuallyActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/0 to-transparent dark:via-gray-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {Icon && (
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200",
            isVisuallyActive && "scale-105"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isVisuallyActive
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors duration-200"
            )}
          />
        </div>
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-sm tracking-tight">
            {label}
          </span>
          {badge && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-100/80 px-2 text-[10px] font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 uppercase tracking-wider shadow-sm">
              {badge}
            </span>
          )}
          {hasSubItems && (
            <div
              role="button"
              onClick={handleChevronClick}
              className="p-1 rounded-lg hover:bg-white/80 dark:hover:bg-white/5 transition-colors duration-200 group-hover:shadow-sm"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 text-gray-400",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          )}
        </>
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
              "flex items-center gap-3 px-3 py-2.5 transition-all duration-200 relative group cursor-pointer",
              isSubItemActive
                ? "bg-gradient-to-r from-primary-50/40 to-transparent text-primary-700 dark:from-primary-500/5 dark:to-transparent dark:text-primary-400 font-bold rounded-xl"
                : "text-gray-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-gray-900 dark:text-gray-500 dark:hover:from-white/5 dark:hover:to-transparent dark:hover:text-white rounded-xl"
            )}
          >
            {/* Indentation line or dot */}
            <div
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-200",
                isSubItemActive
                  ? "bg-primary-600 scale-125 shadow-[0_0_8px] shadow-primary-500/50"
                  : "bg-gray-300 dark:bg-white/10 group-hover:bg-gray-400 dark:group-hover:bg-white/20"
              )}
            />

            {subItem.icon && (
              <subItem.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                  isSubItemActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )}
              />
            )}
            <span className="flex-1 truncate text-sm tracking-tight">
              {subItem.label}
            </span>
          </div>
        </LinkTransition>
      );
    });
  };

  const renderMainItem = () => {
    if (isCollapsed) {
      if (collapsedPath) {
        return (
          <LinkTransition
            href={collapsedPath}
            className="w-full text-left"
            callBack={closeMobile}
          >
            {ItemContent}
          </LinkTransition>
        );
      }
      return <div>{ItemContent}</div>;
    }

    // Expandido: Enlace si existe ruta
    if (path) {
      return (
        <LinkTransition
          href={path}
          className="w-full text-left"
          callBack={closeMobile}
        >
          {ItemContent}
        </LinkTransition>
      );
    }

    return <div>{ItemContent}</div>;
  };

  return (
    <>
      {hasSubItems && !isCollapsed ? (
        <div
          className={cn(
            "transition-all duration-200 rounded-xl",
            isExpanded &&
            "bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/30 dark:to-transparent"
          )}
        >
          {renderMainItem()}

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-out",
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div
                className="mt-1 space-y-1 px-2 pb-2"
                onClick={(e) => e.stopPropagation()}
              >
                {renderSubItems(subItems, level)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderMainItem()
      )}

      {isCollapsed && showTooltip && (
        <Tooltip content={label} badge={badge} position={tooltipPosition} />
      )}
    </>
  );
};
