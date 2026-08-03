"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import english from "@/data/english";
import hindi from "@/data/hindi";

const LANGUAGES = {
  en: english,
  hi: hindi,
};

const STORAGE_KEY = "js_lang"; // jagransanskarshala language

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  // Always boot in English on the server AND on first client render.
  // This guarantees no hydration mismatch. We swap AFTER mount if the
  // user previously chose Hindi.
  const [lang, setLang] = useState("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "hi" || saved === "en") {
        setLang(saved);
      }
    } catch (e) {
      // localStorage unavailable (private mode etc) - default stays English
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    // Keep the <html lang="" data-lang=""> attributes correct for a11y/SEO
    // and so globals.css can target Hindi (line-height fix) automatically.
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang, hydrated]);

  const changeLanguage = useCallback((next) => {
    if (next !== "en" && next !== "hi") return;
    setLang(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      t: LANGUAGES[lang],
      changeLanguage,
      toggleLanguage,
      isEnglish: lang === "en",
      isHindi: lang === "hi",
    }),
    [lang, changeLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
