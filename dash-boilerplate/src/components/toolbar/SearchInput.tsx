import { FC, ReactNode } from "react";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/utils/classNames";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  rightElement?: ReactNode;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  isLoading = false,
  className,
  rightElement,
}) => {
  return (
    <div
      className={cn(
        "flex items-center bg-gray-50/50 dark:bg-white/[0.03] rounded-2xl p-1.5 pl-4 w-full sm:w-auto transition-all duration-300 group focus-within:bg-white dark:focus-within:bg-white/[0.06] focus-within:shadow-md dark:focus-within:shadow-black/20",
        className
      )}
    >
      <div className="shrink-0 flex items-center justify-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full flex-1 bg-transparent border-none text-sm font-semibold focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 px-3 outline-none min-w-0"
      />

      {(value || rightElement) && (
        <div className="flex items-center shrink-0 ml-auto">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 mr-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-95"
              aria-label="Limpiar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {rightElement && (
            <div className="flex items-center gap-1 pl-2 pr-1 shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
