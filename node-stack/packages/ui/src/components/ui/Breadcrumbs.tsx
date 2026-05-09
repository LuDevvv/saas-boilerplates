import { ChevronRight, MoreHorizontal, Home } from "lucide-react";
import React from "react";

import { cn } from "../../utils.js";

export interface BreadcrumbItem {
  label: string | React.ReactNode;
  href?: string;
  isLast?: boolean;
  icon?: React.ElementType;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  showHome?: boolean;
  /** Collapse middle items when path exceeds this depth (0 = never collapse) */
  collapseAfter?: number;
  className?: string;
  onItemClick?: (href: string) => void;
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    title?: string;
  }>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = "/",
  showHome = true,
  collapseAfter = 3,
  className,
  onItemClick,
  LinkComponent,
}) => {
  const DefaultLink = ({
    href,
    children,
    className: lc,
    title,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    title?: string;
  }): React.JSX.Element => (
    <a
      href={href}
      className={lc}
      title={title}
      onClick={(e) => {
        if (onItemClick) {
          e.preventDefault();
          onItemClick(href);
        }
      }}
    >
      {children}
    </a>
  );

  const Link = LinkComponent || DefaultLink;

  // Collapse middle items when path is long
  const shouldCollapse = collapseAfter > 0 && items.length > collapseAfter;
  const visibleItems = shouldCollapse
    ? [items[0], null, ...items.slice(-(collapseAfter - 1))]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-0.5 min-w-0 select-none", className)}
    >
      {/* Home */}
      {showHome && (
        <span className="flex items-center gap-0.5">
          <Link
            href={homeHref}
            className={cn(
              "flex items-center justify-center h-6 w-6 rounded-md",
              "text-fg-muted",
              "hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-700 dark:hover:text-gray-200",
              "transition-all duration-150"
            )}
            title="Inicio"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          {items.length > 0 && (
            <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
          )}
        </span>
      )}

      {/* Items */}
      {visibleItems.map((item, index) => {
        // Collapsed ellipsis marker
        if (item === null || item === undefined) {
          return (
            <span key="ellipsis" className="flex items-center gap-0.5">
              <span
                className="flex items-center justify-center h-6 px-1.5 rounded-md text-fg-muted cursor-default"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
              <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
            </span>
          );
        }

        const isLast = item.isLast ?? index === visibleItems.length - 1;
        const isClickable = !!item.href && !isLast;
        const labelText = typeof item.label === "string" ? item.label : undefined;
        const Icon = item.icon;

        const content = (
          <>
            {Icon && (
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isLast ? "text-primary" : "text-fg-muted"
                )}
              />
            )}
            <span className="truncate max-w-[160px]">{item.label}</span>
          </>
        );

        return (
          <span key={`${item.href ?? "item"}-${index}`} className="flex items-center gap-0.5 min-w-0">
            {isClickable ? (
              <Link
                href={item.href!}
                title={labelText}
                className={cn(
                  "flex items-center gap-1.5 h-6 px-1.5 rounded-md",
                  "text-[12px] font-medium text-fg-secondary",
                  "hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-800 dark:hover:text-gray-100",
                  "transition-all duration-150 min-w-0"
                )}
              >
                {content}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                title={labelText}
                className={cn(
                  "flex items-center gap-1.5 h-6 px-1.5 rounded-md min-w-0",
                  "text-[12px]",
                  isLast
                    ? "font-semibold text-fg"
                    : "font-medium text-fg-secondary cursor-default"
                )}
              >
                {content}
              </span>
            )}

            {!isLast && (
              <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
            )}
          </span>
        );
      })}
    </nav>
  );
};
