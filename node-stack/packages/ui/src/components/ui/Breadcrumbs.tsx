import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../utils.js";

export interface BreadcrumbItem {
  label: string | React.ReactNode;
  href?: string;
  isLast?: boolean;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
  onItemClick?: (href: string) => void;
  LinkComponent?: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = "/",
  className,
  onItemClick,
  LinkComponent,
}) => {
  const DefaultLink = ({ href, children, className: linkClassName }: { href: string; children: React.ReactNode; className?: string }) => (
    <a 
      href={href} 
      className={linkClassName}
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

  return (
    <nav 
      className={cn(
        "flex items-center gap-1.5 text-xs font-label text-gray-500 dark:text-gray-400 overflow-hidden select-none",        className
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href={homeHref}
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = item.isLast ?? index === items.length - 1;
        const isClickable = !!item.href && !isLast;

        return (
          <div key={`${item.href}-${index}`} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
            {isClickable ? (
              <Link
                href={item.href!}
                className="truncate hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate flex items-center gap-1",
                  isLast
                    ? "text-gray-900 dark:text-white font-label"
                    : "cursor-default"
                )}
              >
                {item.icon}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
