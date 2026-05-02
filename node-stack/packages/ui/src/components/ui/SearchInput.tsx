import React, { FC } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "../../utils.js";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
  className?: string;
  rightElement?: React.ReactNode;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  isLoading = false,
  onClear,
  className = "",
  rightElement,
}) => {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative w-full group", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-300 group-focus-within:text-[var(--primary)]">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ backgroundColor: "var(--canvas)", color: "inherit" }}
        className="
          w-full h-11 pl-11 pr-12
          focus:bg-[var(--surface)]
          border border-gray-200 dark:border-white/10
          focus:border-blue-600/40 hover:border-blue-600/20
          rounded-xl
          text-[14px] text-gray-950 dark:text-white
          placeholder-gray-400/80 dark:placeholder-gray-500
          font-label
          outline-none
          transition-all duration-300 ease-out
          shadow-none focus:shadow-lg focus:shadow-blue-900/5
        "
      />

      {/* Clear/Right Button */}
      {(value || rightElement) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
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
