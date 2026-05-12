"use client";

import { Phone } from "lucide-react";
import React, { useState, useRef } from "react";

import { cn } from "../../utils.js";

const COUNTRIES = [
  { code: "MX", dialCode: "+52", name: "México" },
  { code: "DO", dialCode: "+1", name: "República Dominicana" },
  { code: "CO", dialCode: "+57", name: "Colombia" },
  { code: "AR", dialCode: "+54", name: "Argentina" },
  { code: "CL", dialCode: "+56", name: "Chile" },
  { code: "PE", dialCode: "+51", name: "Perú" },
  { code: "EC", dialCode: "+593", name: "Ecuador" },
  { code: "VE", dialCode: "+58", name: "Venezuela" },
  { code: "BO", dialCode: "+591", name: "Bolivia" },
  { code: "PY", dialCode: "+595", name: "Paraguay" },
  { code: "UY", dialCode: "+598", name: "Uruguay" },
  { code: "BR", dialCode: "+55", name: "Brasil" },
  { code: "CR", dialCode: "+506", name: "Costa Rica" },
  { code: "PA", dialCode: "+507", name: "Panamá" },
  { code: "SV", dialCode: "+503", name: "El Salvador" },
  { code: "GT", dialCode: "+502", name: "Guatemala" },
  { code: "HN", dialCode: "+504", name: "Honduras" },
  { code: "NI", dialCode: "+505", name: "Nicaragua" },
  { code: "CU", dialCode: "+53", name: "Cuba" },
  { code: "PR", dialCode: "+1", name: "Puerto Rico" },
  { code: "US", dialCode: "+1", name: "Estados Unidos" },
  { code: "CA", dialCode: "+1", name: "Canadá" },
  { code: "ES", dialCode: "+34", name: "España" },
];

const CountryFlag = ({ code }: { code: string }): React.JSX.Element => {
  if (!code) return <Phone className="w-5 h-4 text-gray-400" />;
  return (
    <img
      src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
      alt={code}
      className="w-5 h-[14px] object-cover rounded-[2px]"
      loading="lazy"
    />
  );
};

export interface PhoneInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Format digits visually: (809) 555-1234
const formatPhone = (digits: string): string => {
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
    6,
    10
  )}`;
};

// Extract only digits from formatted string
const stripToDigits = (str: string): string => str.replace(/\D/g, "");

const MAX_DIGITS = 15; // E.164 standard max

export const PhoneInput = ({
  label,
  error,
  helperText,
  required,
  fullWidth = true,
  value,
  onChange,
  disabled,
  className = "",
}: PhoneInputProps): React.JSX.Element => {
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Force República Dominicana
  const selectedCountry = COUNTRIES.find(c => c.code === "DO")!;
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!value) return "";
    const raw = value.startsWith(selectedCountry.dialCode)
      ? value.slice(selectedCountry.dialCode.length).trim()
      : value;
    const d = stripToDigits(raw).slice(0, MAX_DIGITS);
    return formatPhone(d);
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const digits = stripToDigits(e.target.value).slice(0, MAX_DIGITS);
    const formatted = formatPhone(digits);
    setPhoneNumber(formatted);
    onChange(`${selectedCountry.dialCode}${digits}`);
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-2",
        fullWidth ? "w-full" : "w-fit"
      )}
    >
      {label && (
        <label className="flex items-baseline justify-between px-1 mb-1.5">
          <span className="text-[13px] font-medium text-fg-secondary transition-colors group-focus-within:text-primary">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </span>
        </label>
      )}

      <div
        className={cn(
          "relative flex items-stretch h-12 transition-all duration-300",
          "bg-surface border border-border rounded-xl",
          "focus-within:outline-none focus-within:border-primary",
          disabled && "opacity-50 cursor-not-allowed",
          error ? "border-danger focus-within:border-danger" : "",
          className
        )}
      >
        {/* Country Selector */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            disabled={true}
            className="flex items-center gap-2 h-full py-2 pl-4 pr-3 border-r border-border rounded-l-xl cursor-default transition-colors focus:outline-none"
          >
            <CountryFlag code={selectedCountry.code} />
            <span className="text-sm font-medium text-fg-secondary whitespace-nowrap">
              {selectedCountry.dialCode}
            </span>
          </button>
        </div>

        {/* Phone Number Input */}
        <input
          ref={phoneInputRef}
          type="tel"
          disabled={disabled}
          required={required}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="(555) 123-4567"
          className="flex-1 min-w-0 py-2 px-4 text-sm font-medium text-fg bg-transparent border-none rounded-r-xl focus:outline-none placeholder:text-fg-muted placeholder:font-normal"
        />
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
};
