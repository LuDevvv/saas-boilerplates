import { Search, X, Loader2 } from "lucide-react";
import React, { FC } from "react";

import { cn } from "../../utils.js";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
  className?: string;
  rightElement?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

const sizeMap = {
  sm: { height: "h-9",  text: "text-[13px]", pl: "pl-9",  iconSize: "w-3.5 h-3.5", iconLeft: "left-3" },
  md: { height: "h-11", text: "text-[14px]", pl: "pl-11", iconSize: "w-4 h-4",     iconLeft: "left-3.5" },
  lg: { height: "h-12", text: "text-[15px]", pl: "pl-11", iconSize: "w-4 h-4",     iconLeft: "left-3.5" },
};

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  isLoading = false,
  onClear,
  className,
  rightElement,
  size = "md",
  autoFocus,
}) => {
  const s = sizeMap[size];
  const hasRight = Boolean(value || rightElement);

  return (
    <div className={cn("relative w-full group", className)}>
      {/* Search / loader icon */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-150",
          s.iconLeft,
          "text-gray-400 group-focus-within:text-[var(--primary)]"
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(s.iconSize, "animate-spin text-[var(--primary)]")} />
        ) : (
          <Search className={cn(s.iconSize)} />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full rounded-xl outline-none transition-all duration-200",
          s.height,
          s.text,
          s.pl,
          hasRight ? "pr-10" : "pr-4",
          "bg-gray-50 dark:bg-white/[0.04]",
          "border border-border",
          "hover:border-gray-300 dark:hover:border-white/20",
          "focus:border-[var(--primary)]/50 focus:bg-white dark:focus:bg-white/[0.06]",
          "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
          "text-fg",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "font-label"
        )}
      />

      {/* Clear + right element */}
      {hasRight && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-10">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); onClear?.(); }}
              className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all active:scale-90"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {rightElement}
        </div>
      )}
    </div>
  );
};
