"use client";

import { usePathname } from "next/navigation";
import { IoLanguage } from "react-icons/io5";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { toggleLanguage, t, isHindi } = useLanguage();

  // Hide language switcher on admin pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t.languageSwitcher?.ariaLabel || "Switch language"}
      title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-[100] group flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-white transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer border border-white/25 shadow-lg shadow-orange-500/30 select-none transform-gpu"
      style={{
        background: "linear-gradient(135deg, #f07f22 0%, #d96b14 100%)",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <div className="bg-white/20 rounded-full w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12">
        <IoLanguage className="text-[15px] sm:text-[17px] text-white" />
      </div>
      <span className="font-bold text-[12px] sm:text-[14px] tracking-wide whitespace-nowrap min-w-[50px] sm:min-w-[58px] text-center inline-block leading-none">
        {isHindi ? "English" : "हिंदी"}
      </span>
    </button>
  );
}




