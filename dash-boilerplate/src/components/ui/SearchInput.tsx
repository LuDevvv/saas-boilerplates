import { FC } from "react";
import { Search, X, Loader2 } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
  className?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  isLoading = false,
  onClear,
  className = "",
}) => {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-gray-400" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-12 pl-11 pr-10
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl
          text-sm text-gray-700 dark:text-gray-200
          placeholder-gray-400 dark:placeholder-gray-500
          font-medium
          outline-none
          focus:border-primary-500 dark:focus:border-primary-500
          focus:ring-4 focus:ring-primary-500/10
          transition-all duration-300 ease-out-expo
          shadow-sm hover:shadow-md
        "
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
