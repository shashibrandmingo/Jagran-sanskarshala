"use client";

import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";
import { useSurveyModal } from "@/context/SurveyModalContext";
import { getLatestUpdates } from "@/services/latestUpdates";
import Link from "next/link";

export default function LatestUpdates() {
  const { isHindi } = useLanguage();
  const { openSurveyModal } = useSurveyModal();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    getLatestUpdates().then((data) => {
      setUpdates(data);
    });
  }, []);

  if (!updates || updates.length === 0) return null;

  // Duplicate items array to create seamless infinite scrolling
  const marqueeItems = [...updates, ...updates];

  const handleItemClick = (e, item) => {
    if (item.actionType === "surveyModal") {
      e.preventDefault();
      openSurveyModal();
    }
  };

  return (
    <section className="w-full bg-[var(--background)] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-xl sm:rounded-2xl shadow-sm border border-[#e6d5c3] p-2 sm:p-3.5 flex items-center gap-3 sm:gap-6 overflow-hidden"
          style={{ background: "var(--background)" }}
        >
          {/* Badge / Header */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[var(--primary)] text-white px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-base shrink-0 shadow-xs">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg flex items-center justify-center animate-pulse">
              <FaBell className="text-white text-xs sm:text-base" />
            </div>
            <span className="whitespace-nowrap tracking-wide">
              {isHindi ? "ताज़ा जानकारी" : "Latest Updates"}
            </span>
          </div>

          {/* Marquee Ticker Container */}
          <div className="flex-1 overflow-hidden relative flex items-center py-1 sm:py-2">
            {/* Smooth Edge Fades */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#feefe0] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#feefe0] to-transparent z-10" />

            {/* Continuous Marquee Track */}
            <div className="animate-marquee-scroll flex items-center gap-6 sm:gap-12">
              {marqueeItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-6 sm:gap-12 whitespace-nowrap">
                  {item.actionType === "surveyModal" ? (
                    <button
                      onClick={(e) => handleItemClick(e, item)}
                      className="text-[var(--heading)] hover:text-[var(--primary)] font-semibold text-xs sm:text-[15px] transition-colors duration-200 cursor-pointer text-left"
                    >
                      {isHindi ? item.titleHi : item.titleEn}
                    </button>
                  ) : item.actionType === "none" ? (
                    <span className="text-[var(--heading)] font-semibold text-xs sm:text-[15px] select-none cursor-default">
                      {isHindi ? item.titleHi : item.titleEn}
                    </span>
                  ) : (
                    <Link
                      href={item.link || "/story/1"}
                      className="text-[var(--heading)] hover:text-[var(--primary)] font-semibold text-xs sm:text-[15px] transition-colors duration-200 cursor-pointer"
                    >
                      {isHindi ? item.titleHi : item.titleEn}
                    </Link>
                  )}
                  <span className="text-[var(--secondary)] text-[10px] sm:text-xs select-none">
                    ◆
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
