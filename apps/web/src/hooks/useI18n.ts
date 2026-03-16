import { useLanguage } from "../context/LanguageContext";
import { ui, defaultLang } from "../i18n/ui";

/**
 * Hook for client-side React components to access translations.
 * Shares the same dictionary as Astro's server-side logic.
 */
export function useI18n() {
  const { lang } = useLanguage();

  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
