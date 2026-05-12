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
          <label className="flex items-baseline justify-between px-1 mb-1.5">
            <span className="text-[13px] font-medium text-fg-secondary transition-colors group-focus-within:text-primary">
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </span>
          </label>
        )}

        {/* Hidden input for native HTML5 form validation */}
        {required && (
          <input
            type="text"
            required={required}
            value={value}
            onChange={() => {}}
            className="absolute opacity-0 w-full h-full -z-10 pointer-events-none"
            tabIndex={-1}
          />
        )}

        <div className="relative">
          {/* Main Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "flex h-12 w-full py-2 text-sm font-medium text-fg outline-none transition-all duration-300 relative items-center text-left",
              "pr-12",
              icon ? "pl-11" : "pl-4",
              "bg-surface",
              "border border-border rounded-xl",
              "focus:outline-none focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-danger focus:border-danger"
                : "",
              isOpen && "border-primary",
              className
            )}
          >
            {icon && (
              <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 pointer-events-none text-fg-muted group-focus-within:text-primary transition-colors duration-300 flex items-center justify-center">
                {renderIcon(icon)}
              </div>
            )}
            <span
              className={cn(
                "flex-1 truncate",
                !selectedOption ? "text-fg-muted font-normal" : "text-fg font-medium"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-fg-muted transition-transform duration-300 absolute right-4 top-1/2 -translate-y-1/2",
                isOpen && "rotate-180 text-primary"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[999] animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            >
              {searchable && (
                <div className="p-3.5 bg-surface-muted/50 border-b border-border-subtle">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-muted" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium focus:outline-none focus:border-primary text-fg placeholder:text-fg-muted transition-all"
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
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                        value === option.value
                          ? "bg-primary/5 text-primary font-heading"
                          : "text-fg-secondary hover:bg-surface-muted"
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
              "px-1 text-[12px] font-medium animate-in fade-in slide-in-from-top-1 duration-300",
              error ? "text-danger" : "text-fg-muted"
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
