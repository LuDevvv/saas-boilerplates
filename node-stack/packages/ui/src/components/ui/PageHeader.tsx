import { ChevronRight } from "lucide-react";
import { FC, ReactNode } from "react";

import { cn } from "../../utils.js";

export interface PageHeaderBreadcrumb {
  label: string;
  href: string;
}

export interface PageHeaderProps {
  /** Small uppercase context label (e.g. "CUENTA"). */
  eyebrow?: string;
  /** Page title — large, bold. */
  title: string;
  /** Supporting copy under the title. */
  description?: string;
  /** Crumb trail rendered above the title. Last item is rendered as the current page (non-link). */
  breadcrumbs?: PageHeaderBreadcrumb[];
  /** Optional CTA rendered on the right (desktop) / below (mobile). */
  action?: ReactNode;
  className?: string;
}

const BreadcrumbsTrail: FC<{ items: PageHeaderBreadcrumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-3">
    <ol className="flex items-center gap-1.5 text-[12px] text-fg-muted">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={`${item.href}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3 w-3 text-fg-disabled shrink-0" aria-hidden />
            )}
            {isLast ? (
              <span className="font-medium text-fg-secondary truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-fg transition-colors duration-150 truncate"
              >
                {item.label}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

/**
 * Top-level page header. Use for full pages (Billing, Pricing, Settings, etc.).
 *
 * Includes breadcrumb support and a larger title compared to `SectionHeader`.
 * For profile/company pages with avatar + banner use `HeroHeader` instead.
 */
export const PageHeader: FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  breadcrumbs,
  action,
  className,
}) => (
  <header
    className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
      className
    )}
  >
    <div className="min-w-0 flex-1">
      {breadcrumbs && breadcrumbs.length > 0 && <BreadcrumbsTrail items={breadcrumbs} />}

      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-wider text-fg-muted mb-2">
          {eyebrow}
        </p>
      )}

      <h1 className="text-[22px] sm:text-[26px] font-bold leading-tight tracking-tight text-fg">
        {title}
      </h1>

      {description && (
        <p className="text-[14px] text-fg-secondary leading-relaxed mt-2 max-w-2xl">
          {description}
        </p>
      )}
    </div>

    {action && (
      <div className="shrink-0 flex items-center gap-2 sm:pb-1">{action}</div>
    )}
  </header>
);
