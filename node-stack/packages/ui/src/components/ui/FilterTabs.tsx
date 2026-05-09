import { type ReactNode } from "react";

import { cn } from "../../utils.js";

export interface FilterTabOption<TValue extends string = string> {
  value: TValue;
  label: string;
  /** Optional count badge shown after the label. */
  count?: number;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
}

export interface FilterTabsProps<TValue extends string = string> {
  options: FilterTabOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Compact = h-7. Default = h-8. */
  size?: "sm" | "md";
  className?: string;
  /** Aria label for the tablist. */
  ariaLabel?: string;
}

/**
 * Tab pill switcher used for status / category filters.
 *
 * Rail uses `bg-surface-muted` + `border-border`. Active tab uses `bg-surface`
 * with a subtle shadow; inactive tabs are `text-fg-muted` and brighten on
 * hover. Optional count badges adapt their color based on active state.
 *
 * @example
 * <FilterTabs
 *   value={filter}
 *   onChange={setFilter}
 *   options={[
 *     { value: "all", label: "Todos", count: 42 },
 *     { value: "open", label: "Abiertos", count: 7 },
 *     { value: "closed", label: "Cerrados" },
 *   ]}
 * />
 */
export const FilterTabs = <TValue extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: FilterTabsProps<TValue>): JSX.Element => {
  const heightClass = size === "sm" ? "h-7 text-[11px]" : "h-8 text-[12px]";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-surface-muted p-1 w-fit",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 font-medium transition-colors whitespace-nowrap",
              heightClass,
              isActive
                ? "bg-surface text-fg shadow-[var(--shadow-sm)]"
                : "text-fg-muted hover:text-fg-secondary"
            )}
          >
            {opt.icon}
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-hover text-fg-muted"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

FilterTabs.displayName = "FilterTabs";
