import React from "react";
import { languages, ui } from "../../i18n/ui";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Shared component to switch application language.
 * Performs a client-side redirect to the same path with the new locale prefix.
 */
export const LanguagePicker: React.FC = () => {
  const { lang } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as keyof typeof ui;
    const currentPath = window.location.pathname;

    // Remove existing prefix if not defaultLang
    let pathWithoutPrefix = currentPath;
    Object.keys(languages).forEach((l) => {
      if (currentPath.startsWith(`/${l}/`)) {
        pathWithoutPrefix = currentPath.replace(`/${l}`, "");
      } else if (currentPath === `/${l}`) {
        pathWithoutPrefix = "/";
      }
    });

    // Prefix if not default
    const targetPath =
      newLang === "en"
        ? pathWithoutPrefix
        : `/${newLang}${pathWithoutPrefix === "/" ? "" : pathWithoutPrefix}`;

    window.location.href = targetPath || "/";
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={lang}
        onChange={handleChange}
        className="appearance-none bg-transparent border border-muted hover:border-primary transition-colors rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary h-10 w-32 cursor-pointer"
        aria-label="Select Language"
      >
        {Object.entries(languages).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
};
