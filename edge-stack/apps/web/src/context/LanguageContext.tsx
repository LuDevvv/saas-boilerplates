import React, { createContext, useContext, useEffect, useState } from "react";
import { type ui } from "../i18n/ui";

type Language = keyof typeof ui;

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

/**
 * Provider to wrap React client-side components.
 * Should be initialized with the lang passed from Astro props.
 */
export const LanguageProvider: React.FC<{
  initialLang: Language;
  children: React.ReactNode;
}> = ({ initialLang, children }) => {
  const [lang, setLang] = useState<Language>(initialLang);

  // Synchronize if props change
  useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for isolated React islands that might not be wrapped
    const fallbackLang: Language =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/es")
        ? "es"
        : "en";
    return { lang: fallbackLang, setLang: () => {} };
  }
  return context;
};
