import React, { useState, useRef, useEffect } from "react";
import { cn } from "@utils/classNames";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  icon?: any;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: any;
  searchable?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = "Seleccionar...",
      error,
      helperText,
      icon,
      searchable = true,
      fullWidth = true,
      required = false,
      className = "",
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Combine external ref and internal containerRef
    React.useImperativeHandle(ref, () => containerRef.current!);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }, [isOpen, searchable]);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    };

    const renderIcon = (iconSource: any) => {
      if (!iconSource) return null;
      return typeof iconSource === "function" ||
        (typeof iconSource === "object" &&
          iconSource !== null &&
          "render" in iconSource)
        ? React.createElement(iconSource as any, { className: "w-5 h-5" })
        : iconSource;
    };

    return (
      <div
        className={cn(
          "group flex flex-col gap-2 relative",
          fullWidth ? "w-full" : "w-fit"
        )}
        ref={containerRef}
      >
        {label && (
          <label className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-focus-within:text-primary-500">
              {label}
              {required && <span className="text-red-500">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          {/* Main Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full py-3.5 pr-11 flex items-center gap-3 transition-all duration-500 ease-out-expo text-[15px] border-2 rounded-2xl",
              icon ? "pl-11" : "pl-4",
              error
                ? "border-red-200 dark:border-red-900/50 focus:border-red-500 bg-white shadow-sm"
                : "border-transparent dark:border-white/[0.02] hover:border-primary-500/20 focus:border-primary-500 bg-gray-50/50 dark:bg-white/[0.02] shadow-sm hover:shadow-md",
              isOpen && "border-primary-500/50 bg-white dark:bg-gray-900",
              className
            )}
          >
            {icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500">
                {renderIcon(icon)}
              </div>
            )}
            <span
              className={cn(
                "flex-1 text-left truncate",
                !selectedOption && "text-gray-400"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-gray-400 transition-transform duration-300 absolute right-4 top-1/2 -translate-y-1/2",
                isOpen && "rotate-180 text-primary-500"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-950 border border-transparent dark:border-white/[0.05] rounded-2xl shadow-2xl z-[200] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              {searchable && (
                <div className="p-3 border-b border-transparent dark:border-white/[0.02]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-primary-500/50 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 decoration-none"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                        value === option.value
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && renderIcon(option.icon)}
                        <span>{option.label}</span>
                      </div>
                      {value === option.value && <Check className="w-4 h-4" />}
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "px-1 text-xs font-medium animate-in slide-in-from-top-1",
              error ? "text-red-500" : "text-gray-400 dark:text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

