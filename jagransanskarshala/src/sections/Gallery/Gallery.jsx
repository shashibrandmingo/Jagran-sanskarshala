"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  FaImages,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaExpand,
  FaXmark,
  FaCalendarDays,
  FaFolderClosed,
} from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";
import GalleryRightBg from "@/assets/images/gallery.png";
import {
  galleryTabs,
  initialGalleryCategories,
} from "@/services/galleryService";

export default function GallerySection({ initialYear = "All" }) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialYear);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Lightbox Modal Slider State
  const [lightboxCategory, setLightboxCategory] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sync initialYear if prop changes
  useEffect(() => {
    if (initialYear) {
      setActiveTab(initialYear);
    }
  }, [initialYear]);

  // Fetch category-grouped gallery data
  useEffect(() => {
    let isMounted = true;
    async function fetchGallery() {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery?year=${activeTab}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setCategories(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn(
          "Backend API fetch error, using local fallback data:",
          err,
        );
      }

      // Local fallback data
      if (isMounted) {
        let filtered = [...initialGalleryCategories];
        if (activeTab !== "All" && activeTab !== "all") {
          filtered = filtered.filter((cat) => cat.year === activeTab);
        }
        setCategories(filtered);
        setLoading(false);
      }
    }

    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Active tab object for label display
  const activeTabObj = useMemo(() => {
    return galleryTabs.find((t) => t.year === activeTab) || galleryTabs[0];
  }, [activeTab]);

  // Open Lightbox Slider for specific Category and Image Index
  const openLightbox = (category, index) => {
    setLightboxCategory(category);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxCategory(null);
    setLightboxIndex(0);
  };

  const handlePrevImage = useCallback(() => {
    if (!lightboxCategory) return;
    setLightboxIndex((prev) =>
      prev === 0 ? lightboxCategory.images.length - 1 : prev - 1,
    );
  }, [lightboxCategory]);

  const handleNextImage = useCallback(() => {
    if (!lightboxCategory) return;
    setLightboxIndex((prev) =>
      prev === lightboxCategory.images.length - 1 ? 0 : prev + 1,
    );
  }, [lightboxCategory]);

  // Keyboard navigation for Lightbox slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxCategory) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxCategory, handlePrevImage, handleNextImage]);

  return (
    <section className="relative w-full py-8 md:py-14 overflow-hidden min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==========================================================
            HERO HEADER
           ========================================================== */}
        <div className="relative w-full py-4 sm:py-6 md:py-8 mb-8 md:mb-12">
          <div className="hidden md:flex absolute right-4 lg:right-12 xl:right-16 top-0 bottom-0 pointer-events-none items-center justify-end z-0">
            <Image
              src={GalleryRightBg}
              alt="Decorative Pattern"
              className="h-full w-auto object-contain object-right max-h-[260px] lg:max-h-[300px] xl:max-h-[340px]"
              priority
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 backdrop-blur-xs shadow-xs flex items-center justify-center shrink-0 border border-red-100">
                <FaImages
                  className="text-2xl sm:text-3xl"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <h1
                className="heading-lg text-2xl sm:text-4xl lg:text-5xl font-black leading-tight"
                style={{ color: "var(--primary)" }}
              >
                Gallery
              </h1>
            </div>

            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full mb-4 sm:mb-6" />

            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed max-w-xl">
              {lang === "hi"
                ? "उन पलों को फिर से जिएं जो प्रेरित और सशक्त बनाते हैं। हमारे सत्रों, कार्यक्रमों और गतिविधियों की झलकियां देखें।"
                : "Relive the moments that inspire, empower, and create impact. Explore glimpses from our sessions, events, and activities."}
            </p>
          </div>
        </div>

        {/* ==========================================================
            YEARLY FILTERING TABS (DESKTOP BAR + MOBILE DROPDOWN)
           ========================================================== */}
        <div className="mb-8 md:mb-12">
          <div className="hidden lg:flex items-stretch justify-between bg-[#fbf3ea]/90 backdrop-blur-xs p-2 rounded-2xl border border-[#ebd8c5] shadow-xs w-full">
            {galleryTabs.map((tab, idx) => {
              const isActive = activeTab === tab.year;
              const isLast = idx === galleryTabs.length - 1;
              const tabTitle = tab.title[lang] || tab.title.en;
              const tabSubtitle = tab.subtitle[lang] || tab.subtitle.en;

              return (
                <div
                  key={tab.id}
                  className="flex items-center flex-1 justify-center relative min-w-0"
                >
                  <button
                    onClick={() => setActiveTab(tab.year)}
                    className={`relative flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl transition-all duration-300 cursor-pointer w-full h-full ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-md shadow-red-900/20 scale-[1.02]"
                        : "text-gray-800 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-[12px] xl:text-[13px] font-bold leading-tight">
                        {tabTitle}
                      </span>
                      {tab.isLatest && (
                        <span
                          className={`text-[9px] xl:text-[10px] px-2.5 h-4.5 inline-flex items-center justify-center rounded-full font-black tracking-wider uppercase leading-none text-center ${
                            isActive
                              ? "bg-white text-[var(--primary)] shadow-2xs"
                              : "bg-[#fff7ee] text-[#c71518] border border-red-200"
                          }`}
                        >
                          <span className="translate-y-[0.5px]">LATEST</span>
                        </span>
                      )}
                    </div>
                    {tabSubtitle && (
                      <span
                        className={`text-[11px] xl:text-[12px] font-medium leading-tight mt-0.5 ${
                          isActive ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {tabSubtitle}
                      </span>
                    )}
                  </button>

                  {!isLast &&
                    !isActive &&
                    activeTab !== galleryTabs[idx + 1]?.year && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-[#e5cfba]" />
                    )}
                </div>
              );
            })}
          </div>

          {/* Tablet & Mobile Dropdown Filter */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-4 bg-[#fbf3ea] rounded-2xl shadow-sm border border-[#ebd8c5] text-left font-bold text-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <FaCalendarDays className="text-[var(--primary)] text-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    {activeTabObj.title[lang] || activeTabObj.title.en}
                  </span>
                  {activeTabObj.subtitle && (
                    <span className="text-xs text-gray-600 font-medium">
                      {activeTabObj.subtitle[lang] || activeTabObj.subtitle.en}
                    </span>
                  )}
                </div>
                {activeTabObj.isLatest && (
                  <span className="ml-2 text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full font-black uppercase">
                    LATEST
                  </span>
                )}
              </div>
              <FaChevronDown
                className={`text-gray-500 transition-transform duration-300 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 p-2 overflow-hidden animate-fadeIn">
                {galleryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.year);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.year
                        ? "bg-[var(--primary)] text-white"
                        : "text-gray-700 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">
                        {tab.title[lang] || tab.title.en}
                      </span>
                      {tab.subtitle && (
                        <span
                          className={`text-xs ${activeTab === tab.year ? "text-white/80" : "text-gray-500"}`}
                        >
                          {tab.subtitle[lang] || tab.subtitle.en}
                        </span>
                      )}
                    </div>
                    {tab.isLatest && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                          activeTab === tab.year
                            ? "bg-white text-[var(--primary)]"
                            : "bg-[var(--primary)] text-white"
                        }`}
                      >
                        LATEST
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================================
            CATEGORY GROUPED GALLERY GRID
           ========================================================== */}
        {loading ? (
          <div className="space-y-10">
            {[1, 2].map((catIdx) => (
              <div key={catIdx} className="space-y-4">
                <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
                    >
                      <div className="w-full h-52 bg-gray-200" />
                      <div className="p-4">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="relative w-full max-w-2xl mx-auto my-10 p-8 sm:p-12 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-[#ebd8c5] text-center overflow-hidden">
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 text-[var(--primary)] flex items-center justify-center shadow-md">
                  <FaImages className="text-4xl" />
                </div>
              </div>

              <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 text-[var(--primary)] text-xs font-extrabold uppercase tracking-wider mb-3 border border-red-100">
                {lang === "hi" ? "जल्द आ रहा है" : "Coming Soon"}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                {lang === "hi"
                  ? `${activeTabObj.title.hi} के चित्र जल्द ही उपलब्ध होंगे`
                  : `Glimpses of ${activeTabObj.title.en} Coming Soon`}
              </h3>

              <p className="text-gray-600 text-sm sm:text-base max-w-md leading-relaxed mb-6 font-medium">
                {lang === "hi"
                  ? "इस आर्काइव वर्ष की तस्वीरें अपलोड की जा रही हैं। नया मीडिया पोस्ट होते ही यहाँ लाइव दिखाई देगा।"
                  : "We are currently curating and uploading photos for this archive year. New media will appear live here as soon as it is posted."}
              </p>

              <button
                onClick={() => setActiveTab("2025")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-white text-sm font-bold shadow-md hover:bg-red-700 transition-all cursor-pointer"
              >
                <span>
                  {lang === "hi"
                    ? "संस्कारशाला 2025 (Latest) देखें"
                    : "View Sanskarshala 2025 (Latest)"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-14">
            {categories.map((cat) => {
              const title =
                lang === "hi"
                  ? cat.categoryTitleHi || cat.categoryTitle
                  : cat.categoryTitle;

              return (
                <div key={cat._id || cat.id} className="space-y-4">
                  {/* Category Heading (Assembly Take Over, News Paper Reading, Principal Meet) */}
                  {/* Category Heading (Assembly Take Over, News Paper Reading, Principal Meet) */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-red-100/80">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                        {title}
                      </h2>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100/80 text-gray-600">
                      {cat.images?.length || 0}{" "}
                      {lang === "hi" ? "तस्वीरें" : "Photos"}
                    </span>
                  </div>

                  {/* Category Grid — Auto-Adaptive Dynamic Grid for any number of backend images (1, 5, 6, 12+) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {cat.images?.map((item, index) => (
                      <div
                        key={item._id || item.id || index}
                        onClick={() => openLightbox(cat, index)}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100/90 cursor-pointer"
                      >
                        {/* Proportional Aspect Ratio Image Container */}
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                          <img
                            src={item.url}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Hover Expand Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 text-[var(--primary)] flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                              <FaExpand className="text-base" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==========================================================
          CATEGORY LIGHTBOX SLIDER MODAL (Fully Responsive for All Screen Sizes)
         ========================================================== */}
      {lightboxCategory && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh] sm:max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 px-4 sm:px-6 bg-slate-900/90 border-b border-white/10 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <FaFolderClosed className="text-[var(--primary)] text-base sm:text-lg shrink-0" />
                <span className="text-white font-extrabold text-sm sm:text-base lg:text-lg truncate">
                  {lang === "hi"
                    ? lightboxCategory.categoryTitleHi ||
                      lightboxCategory.categoryTitle
                    : lightboxCategory.categoryTitle}
                </span>
                <span className="text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 shrink-0">
                  {lightboxIndex + 1} / {lightboxCategory.images.length}
                </span>
              </div>

              <button
                onClick={closeLightbox}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Close slider modal"
              >
                <FaXmark className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Slider Main Stage */}
            <div className="relative flex-1 flex items-center justify-center bg-black p-2 sm:p-4 min-h-[300px] sm:min-h-[450px] overflow-hidden select-none">
              {/* Previous Image Arrow */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 md:left-6 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-[var(--primary)] text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer border border-white/10"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-sm sm:text-lg" />
              </button>

              {/* Active Image (Pure image without bottom text) */}
              <div className="relative max-h-[65vh] max-w-full flex items-center justify-center p-1">
                <img
                  src={lightboxCategory.images[lightboxIndex]?.url}
                  alt={lightboxCategory.categoryTitle}
                  className="max-h-[62vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-lg sm:rounded-xl shadow-2xl transition-all duration-300"
                />
              </div>

              {/* Next Image Arrow */}
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 md:right-6 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-[var(--primary)] text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer border border-white/10"
                aria-label="Next image"
              >
                <FaChevronRight className="text-sm sm:text-lg" />
              </button>
            </div>

            {/* Bottom Category Thumbnail Strip (Auto-scrolls smoothly for any count of images) */}
            <div className="p-2 sm:p-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto thin-scrollbar max-w-full">
              {lightboxCategory.images.map((img, idx) => (
                <button
                  key={img._id || img.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    lightboxIndex === idx
                      ? "border-[var(--primary)] scale-105 opacity-100 ring-2 ring-red-500/40"
                      : "border-transparent opacity-40 hover:opacity-90"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
