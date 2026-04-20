import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { cn } from "@/utils/classNames";
import { detectGeoDefaults, fetchGeoFromServer } from "@/utils/geo-defaults";

const COUNTRIES = [
  { code: "MX", dialCode: "+52", name: "México" },
  { code: "DO", dialCode: "+1", name: "República Dominicana" },
  { code: "CO", dialCode: "+57", name: "Colombia" },
  { code: "AR", dialCode: "+54", name: "Argentina" },
  { code: "CL", dialCode: "+56", name: "Chile" },
  { code: "PE", dialCode: "+51", name: "Perú" },
  { code: "EC", dialCode: "+593", name: "Ecuador" },
  { code: "VE", dialCode: "+58",  name: "Venezuela" },
  { code: "BO", dialCode: "+591", name: "Bolivia" },
  { code: "PY", dialCode: "+595", name: "Paraguay" },
  { code: "UY", dialCode: "+598", name: "Uruguay" },
  { code: "BR", dialCode: "+55",  name: "Brasil" },
  { code: "CR", dialCode: "+506", name: "Costa Rica" },
  { code: "PA", dialCode: "+507", name: "Panamá" },
  { code: "SV", dialCode: "+503", name: "El Salvador" },
  { code: "GT", dialCode: "+502", name: "Guatemala" },
  { code: "HN", dialCode: "+504", name: "Honduras" },
  { code: "NI", dialCode: "+505", name: "Nicaragua" },
  { code: "CU", dialCode: "+53",  name: "Cuba" },
  { code: "PR", dialCode: "+1",   name: "Puerto Rico" },
  { code: "US", dialCode: "+1",   name: "Estados Unidos" },
  { code: "CA", dialCode: "+1",   name: "Canadá" },
  { code: "ES", dialCode: "+34",  name: "España" },
];

const CountryFlag = ({ code }: { code: string }) => {
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

interface PhoneInputProps {
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
}: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect country from timezone (only computed once)
  const detectedCountry = useMemo(() => {
    const geo = detectGeoDefaults();
    return COUNTRIES.find((c) => c.code === geo.countryCode) ?? COUNTRIES[0]!;
  }, []);

  // Parse initial country from value, fallback to detected
  const getCountryFromValue = () => {
    if (!value) return detectedCountry;
    // Try longest dialCode match first
    const sorted = [...COUNTRIES].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );
    for (const c of sorted) {
      if (value.startsWith(c.dialCode)) return c;
    }
    return detectedCountry;
  };

  const [selectedCountry, setSelectedCountry] =
    useState<(typeof COUNTRIES)[number]>(getCountryFromValue);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!value) return "";
    const country = getCountryFromValue();
    const raw = value.startsWith(country.dialCode)
      ? value.slice(country.dialCode.length).trim()
      : value;
    const d = raw.replace(/\D/g, "").slice(0, 15);
    if (d.length === 0) return "";
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  });

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dialCode.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refine with server-side detection (more accurate)
  useEffect(() => {
    if (!value) {
      fetchGeoFromServer().then((geo) => {
        if (geo) {
          const country = COUNTRIES.find((c) => c.code === geo.countryCode);
          if (country && country.code !== selectedCountry.code) {
            setSelectedCountry(country);
            // Optionally update parent if needed, but usually initial state is enough
          }
        }
      });
    }
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
    const digits = stripToDigits(phoneNumber);
    onChange(`${country.dialCode}${digits}`);
    setTimeout(() => phoneInputRef.current?.focus(), 50);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = stripToDigits(e.target.value).slice(0, MAX_DIGITS);
    const formatted = formatPhone(digits);
    setPhoneNumber(formatted);
    // Send clean value to backend: +1XXXXXXXXXX
    onChange(`${selectedCountry.dialCode}${digits}`);
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-2",
        fullWidth ? "w-full" : "w-fit",
        className
      )}
    >
      {label && (
        <label className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-focus-within:text-primary-500">
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      <div
        className={cn(
          "relative flex items-stretch bg-white dark:bg-gray-900 border-2 rounded-2xl transition-all duration-300",
          disabled &&
          "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950",
          error
            ? "border-red-200 dark:border-red-950/40 focus-within:border-red-500 shadow-sm"
            : "border-gray-100 dark:border-white/5 focus-within:border-primary-500 hover:border-gray-200 dark:hover:border-white/10 shadow-sm hover:shadow-md"
        )}
      >
        {/* Country Selector */}
        <div ref={dropdownRef} className="relative flex-shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 h-full py-3.5 pl-4 pr-3 border-r-2 border-gray-100 dark:border-white/5 rounded-l-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            <CountryFlag code={selectedCountry.code} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180 text-primary-500"
              )}
            />
          </button>

          {/* Country Dropdown */}
          {isOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-100 dark:border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="Buscar país..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-0.5",
                        selectedCountry.code === country.code
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CountryFlag code={country.code} />
                        <span className="text-left truncate">
                          {country.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium ml-2 flex-shrink-0">
                        {country.dialCode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-gray-400">
                    No se encontraron países
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          ref={phoneInputRef}
          type="tel"
          disabled={disabled}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="(555) 123-4567"
          className="flex-1 min-w-0 py-3.5 px-4 text-[15px] bg-transparent text-gray-900 dark:text-white border-none rounded-r-2xl focus:outline-none placeholder:text-gray-400/80 dark:placeholder:text-gray-500"
        />
      </div>

      {(error || helperText) && (
        <p
          className={cn(
            "px-1 text-xs font-medium animate-in slide-in-from-top-1 duration-300",
            error ? "text-red-500" : "text-gray-400 dark:text-gray-500"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
