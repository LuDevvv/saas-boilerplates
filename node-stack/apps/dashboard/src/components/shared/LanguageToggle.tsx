import { Globe, Check } from "lucide-react";
import { FC, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils/classNames";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export const LanguageToggle: FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => i18n.language.startsWith(lang.code)) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-2 rounded-xl bg-gray-50 px-3 text-sm font-label text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        aria-label="Cambiar idioma"
      >
        <Globe className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
        <span className="hidden sm:inline font-heading">{currentLanguage.flag} {currentLanguage.label}</span>
        <span className="sm:hidden text-lg">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-border bg-white/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 dark:border-white/10 dark:bg-gray-900/95 z-50">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] font-label uppercase  text-fg-muted">
              Select Language
            </p>
          </div>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer group",
                  i18n.language.startsWith(lang.code)
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg group-hover:scale-110 transition-transform">{lang.flag}</span>
                  <span className="font-label">{lang.label}</span>
                </div>
                {i18n.language.startsWith(lang.code) && (
                  <Check className="h-4 w-4 animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
