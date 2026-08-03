"use client";

import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { toggleLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t.languageSwitcher.ariaLabel}
      className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 lg:bottom-32 lg:right-8 z-[100] flex-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        background: "var(--secondary)",
        boxShadow: "0 8px 24px rgba(240, 127, 34, 0.45)",
      }}
    >
      <HiOutlineGlobeAlt className="text-[22px] sm:text-[24px]" />
    </button>
  );
}

