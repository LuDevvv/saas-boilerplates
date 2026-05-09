"use client";

import { ChevronDown, Search, Check } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { cn } from "../../utils.js";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode | React.ElementType;
}

export interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode | React.ElementType;
  searchable?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
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
      disabled = false,
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
      const handleClickOutside = (event: MouseEvent): void => {
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

    const handleSelect = (optionValue: string): void => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    };

    const renderIcon = (iconSource: React.ReactNode | React.ElementType): React.ReactNode => {
      if (!iconSource) return null;
      return typeof iconSource === "function" ||
        (typeof iconSource === "object" &&
          iconSource !== null &&
          "render" in iconSource)
        ? React.createElement(iconSource as React.ElementType, { className: "w-4 h-4" })
        : iconSource;
    };

    return (
      <div
        className={cn(
          "group flex flex-col gap-2 relative",
          isOpen ? "z-50" : "z-0",
          fullWidth ? "w-full" : "w-fit"
        )}
        ref={containerRef}
      >
        {label && (
          <label className="flex items-center justify-between px-1">
            <span className="text-[11px] font-label uppercase  text-[#64748B] transition-colors group-focus-within:text-[#004080] dark:text-[#94A3B8] dark:group-focus-within:text-[#00E6E6]">
              {label}
              {required && <span className="text-[#EF4F5F] ml-1">*</span>}
            </span>
          </label>
        )}

        <div className="relative">
          {/* Main Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={{ backgroundColor: "var(--canvas)", color: "inherit" }}
            className={cn(
              "w-full h-12 flex items-center gap-3 text-[14px] font-label border rounded-2xl transition-all",
              icon ? "pl-11" : "pl-6",
              "pr-12",
              disabled && "opacity-50 cursor-not-allowed grayscale-[0.5]",
              error
                ? "border-[#EF4F5F] focus:border-[#EF4F5F]"
                : "border-border hover:border-gray-300 dark:hover:border-white/20 focus:border-blue-600 dark:focus:border-blue-400",
              isOpen && "border-blue-600 dark:border-blue-400",
              className
            )}
          >
            {icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                {renderIcon(icon)}
              </div>
            )}
            <span
              className={cn(
                "flex-1 text-left truncate text-fg",
                !selectedOption && "text-[#64748B]/50"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#64748B] dark:text-[#94A3B8] transition-transform duration-300 absolute right-4 top-1/2 -translate-y-1/2",
                isOpen && "rotate-180 text-[#004080] dark:text-[#00E6E6]"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[999] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            >
              {searchable && (
                <div className="p-3.5 bg-slate-50/50 dark:bg-white/[0.02] border-b border-border-subtle">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-400 text-fg placeholder:text-gray-400 transition-all"
                      placeholder="Buscar sector..."
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
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                        value === option.value
                          ? "bg-[#004080]/5 dark:bg-[#00E6E6]/5 text-[#004080] dark:text-[#00E6E6] font-heading"
                          : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#FFFFFF]/5"
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
                  <div className="py-8 text-center text-sm text-[#64748B]">
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
              "px-1 text-[11px] font-label uppercase  animate-in fade-in slide-in-from-top-1",
              error ? "text-[#EF4F5F]" : "text-[#64748B] dark:text-[#94A3B8]"
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
