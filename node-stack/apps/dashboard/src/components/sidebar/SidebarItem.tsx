import { ChevronDown } from "lucide-react";
import { FC, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  const isVisuallyActive = isActive || hasActiveChild;

  const ItemContent = (
    <div
      ref={itemRef}
      className={cn(
        "group relative flex items-center transition-all duration-200 cursor-pointer border border-transparent outline-none",
        isCollapsed ? "w-10 h-10 justify-center p-0 rounded-full gap-0" : "w-full rounded-lg pl-[10px] pr-2 py-2 gap-3",
        isVisuallyActive
          ? "bg-sidebar-active text-sidebar-text-active font-medium"
          : "text-sidebar-text hover:bg-sidebar-active/25 hover:text-sidebar-text-active/80",
        level > 0 && !isCollapsed && "ml-4"
      )}
      onClick={handleMainClick}
    >
      {Icon && (
        <div className="flex-shrink-0 transition-all duration-200 relative">
          <Icon
            className={cn(
              "h-5 w-5",
              isVisuallyActive
                ? "text-sidebar-text-active"
                : "text-sidebar-text/50 group-hover:text-sidebar-text-active transition-colors duration-200"
            )}
          />
          {isCollapsed && badge && (() => {
            const isObj = typeof badge === "object" && badge !== null;
            const label = isObj ? badge.label : String(badge);
            // Skip text labels in collapsed mode (only numeric counts make sense as a dot)
            if (label.length > 2) return null;
            const tone = (isObj ? badge.tone : "primary") ?? "primary";
            const toneClass = {
              primary: "bg-primary text-primary-foreground",
              info:    "bg-blue-500 text-white",
              warning: "bg-amber-500 text-white",
              success: "bg-emerald-500 text-white",
              neutral: "bg-surface-hover text-fg-secondary",
            }[tone];
            return (
              <div className={cn(
                "absolute -right-3 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ring-2 ring-sidebar z-10",
                toneClass
              )}>
                {label}
              </div>
            );
          })()}
        </div>
      )}

      {/* Label and Badge — removed from DOM when collapsed to kill phantom flex gap */}
      {!isCollapsed && (
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <span className={cn(
            "flex-1 truncate text-sm whitespace-nowrap",
            isVisuallyActive ? "text-sidebar-text-active" : "text-inherit"
          )}>
            {label}
          </span>
          {badge && (() => {
            const isObj = typeof badge === "object" && badge !== null;
            const label = isObj ? badge.label : String(badge);
            const tone = (isObj ? badge.tone : "primary") ?? "primary";
            const toneClass = {
              primary:  "bg-primary text-primary-foreground",
              info:     "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25",
              warning:  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25",
              success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
              neutral:  "bg-surface-hover text-fg-secondary border border-border",
            }[tone];
            return (
              <span className={cn(
                "flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[9px] font-bold tracking-wider transition-colors uppercase shrink-0",
                toneClass,
                label.length === 1 ? "rounded-full w-5" : "rounded-md"
              )}>
                {label}
              </span>
            );
          })()}
          {hasSubItems && (
            <ChevronDown
              onClick={handleChevronClick}
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-all duration-200 text-sidebar-text/40 hover:text-sidebar-text-active cursor-pointer",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
      )}
    </div>
  );

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
                ? "bg-sidebar-active text-sidebar-text-active font-bold"
                : "text-sidebar-text hover:bg-sidebar-active/50"
            )}
          >
            {subItem.icon && (
              <subItem.icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                  isSubItemActive
                  ? "text-sidebar-text-active"
                  : "text-sidebar-text group-hover:text-sidebar-text-active"
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

  const renderMainItem = () => (
    <div className={cn("flex items-center", isCollapsed ? "w-full justify-center" : "w-full")}>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {collapsedPath ? (
              <LinkTransition
                href={collapsedPath}
                className="w-10 h-10 mx-auto block"
                callBack={closeMobile}
              >
                {ItemContent}
              </LinkTransition>
            ) : (
              <div className="w-10 h-10 mx-auto">{ItemContent}</div>
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

  return (
    <>
      {hasSubItems && !isCollapsed ? (
        <div className="transition-all duration-300">
          {renderMainItem()}
          {isExpanded && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div
                className="mt-1 space-y-0.5 px-6 pb-2 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute left-[25px] top-0 bottom-4 w-px bg-sidebar-border opacity-50" />
                {renderSubItems(subItems, level)}
              </div>
            </div>
          )}
        </div>
      ) : (
        renderMainItem()
      )}
    </>
  );
};
