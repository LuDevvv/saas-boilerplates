import { FC, ReactNode } from "react";

import { cn } from "../../utils.js";

export interface SectionHeaderProps {
  /** Small uppercase label rendered above the title (e.g. "CONFIGURACIÓN"). */
  eyebrow?: string;
  /** Tone of the eyebrow. Defaults to "muted". */
  eyebrowTone?: "muted" | "primary";
  /** Main heading text. */
  title: string;
  /** Optional supporting copy under the title. */
  description?: string;
  /** Optional CTA / control rendered on the right (desktop) or under (mobile). */
  action?: ReactNode;
  /** Heading level — defaults to h2. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Compact section header used inside cards, panels and page sub-sections.
 *
 * Layout:
 * - Mobile: stacked (eyebrow / title / description, then action).
 * - Desktop (sm+): two columns with `justify-between` and `items-start`.
 *
 * For full-page headers with breadcrumbs prefer `PageHeader`.
 */
export const SectionHeader: FC<SectionHeaderProps> = ({
  eyebrow,
  eyebrowTone = "muted",
  title,
  description,
  action,
  as = "h2",
  className,
}) => {
  const Heading = as;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p
            className={cn(
              "text-[10px] font-bold uppercase  mb-1.5",
              eyebrowTone === "primary" ? "text-primary" : "text-fg-muted"
            )}
          >
            {eyebrow}
          </p>
        )}
        <Heading className="text-[18px] font-semibold leading-snug text-fg">
          {title}
        </Heading>
        {description && (
          <p className="text-[13px] text-fg-secondary leading-relaxed mt-1">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
