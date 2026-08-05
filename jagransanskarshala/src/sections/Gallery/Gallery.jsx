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

  const [dynamicTabs, setDynamicTabs] = useState(galleryTabs);
  const tabsContainerRef = useState(null)[0];

  const scrollTabs = (direction) => {
    const el = document.getElementById("gallery-tabs-scroll-container");
    if (el) {
      el.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  // Sync initialYear if prop changes
  useEffect(() => {
    setActiveTab(initialYear);
  }, [initialYear]);

  // Fetch category-grouped gallery data
  useEffect(() => {
    let isMounted = true;
    async function fetchGallery() {
      setLoading(true);
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/v1/gallery`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            let dbCategories = json.data.categories || [];
            let dbYears = json.data.years || [];

            // Always start with "Sanskriti Se Sanskar (All Images)" tab
            const allTab = {
              id: "all",
              year: "All",
              title: { hi: "संस्कृति से संस्कार", en: "Sanskriti Se Sanskar" },
              subtitle: { hi: "(All Images)", en: "(All Images)" },
            };

            let formattedTabs = [allTab];

            if (dbYears.length > 0) {
              dbYears.forEach((y, index) => {
                formattedTabs.push({
                  id: y._id || y.id || y.year,
                  year: String(y.year),
                  title: y.title || {
                    en: `Sanskarshala ${y.year}`,
                    hi: `संस्कारशाला ${y.year}`,
                  },
                  subtitle: y.subtitle || {
                    en: `(${y.year})`,
                    hi: `(${y.year})`,
                  },
                  isLatest: index === 0, // First sorted edition in MongoDB gets LATEST badge
                });
              });
            } else {
              formattedTabs = galleryTabs;
            }

            setDynamicTabs(formattedTabs);

            // Filter categories by activeTab
            let filteredCats = [...dbCategories];
            if (activeTab && activeTab !== "All" && activeTab !== "all") {
              filteredCats = filteredCats.filter(
                (cat) => String(cat.year) === String(activeTab)
              );
            }

            setCategories(filteredCats);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend API fetch error, using local fallback data:", err);
      }

      if (isMounted) {
        setDynamicTabs(galleryTabs);
        let filtered = [...initialGalleryCategories];
        if (activeTab !== "All" && activeTab !== "all") {
          filtered = filtered.filter(
            (cat) => String(cat.year) === String(activeTab)
          );
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
    return (
      dynamicTabs.find(
        (t) => String(t.year).toLowerCase() === String(activeTab).toLowerCase()
      ) ||
      dynamicTabs[0] ||
      galleryTabs[0]
    );
  }, [activeTab, dynamicTabs]);

  // Calculate total photos in active tab to trigger Coming Soon if 0 photos exist
  const totalPhotosInActiveTab = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.images?.length || 0), 0);
  }, [categories]);

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
      prev === 0 ? lightboxCategory.images.length - 1 : prev - 1
    );
  }, [lightboxCategory]);

  const handleNextImage = useCallback(() => {
    if (!lightboxCategory) return;
    setLightboxIndex((prev) =>
      prev === lightboxCategory.images.length - 1 ? 0 : prev + 1
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
    <section id="gallery" className="relative py-16 sm:py-20 md:py-24 bg-[#fffaf5] overflow-hidden">
      {/* Decorative Background Accent */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 md:w-[480px] h-[480px] opacity-15 pointer-events-none z-0">
        <Image
          src={GalleryRightBg}
          alt=""
          fill
          className="object-contain object-top-right"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-3">
              <FaImages className="text-xs" />
              {lang === "hi" ? "चित्र प्रदर्शनी" : "Glimpses & Events"}
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              {lang === "hi"
                ? "दैनिक जागरण संस्कारशाला फोटो गैलरी"
                : "Dainik Jagran Sanskarshala Gallery"}
            </h2>

            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full mb-4 sm:mb-6" />

            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed max-w-xl">
              {lang === "hi"
                ? "उन पलों को फिर से जिएं जो प्रेरित और सशक्त बनाते हैं। हमारे सत्रों, कार्यक्रमों और गतिविधियों की झलकियां देखें।"
                : "Relive the moments that inspire, empower, and create impact. Explore glimpses from our sessions, events, and activities."}
            </p>
          </div>
        </div>

        {/* ==========================================================
            YEARLY FILTERING TABS (DYNAMIC SLIDER VS FULL-WIDTH BAR)
           ========================================================== */}
        <div className="mb-8 md:mb-12">
          {/* Desktop & Laptop Bar (Conditional Slider if > 7 Tabs) */}
          <div className="hidden lg:flex items-center gap-2 relative bg-[#fbf3ea]/95 backdrop-blur-xs p-2.5 rounded-3xl border border-[#ebd8c5] shadow-xs w-full">
            {/* Show Left Arrow Button Only when > 7 Tabs */}
            {dynamicTabs.length > 7 && (
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="shrink-0 w-9 h-9 rounded-full bg-white text-gray-700 hover:text-[var(--primary)] hover:bg-red-50 flex items-center justify-center border border-amber-900/10 shadow-2xs transition-all cursor-pointer z-10"
                title="Previous Years"
              >
                <FaChevronLeft className="text-xs" />
              </button>
            )}

            {/* Tabs Track (Scrollable if > 7, Full-Width Flex-1 if <= 7) */}
            <div
              id="gallery-tabs-scroll-container"
              className={`flex items-center gap-2.5 w-full py-0.5 px-1 ${dynamicTabs.length > 7
                  ? "overflow-x-auto no-scrollbar scroll-smooth"
                  : "justify-between"
                }`}
            >
              {dynamicTabs.map((tab, idx) => {
                const isActive = activeTab === tab.year;
                const tabTitle =
                  typeof tab.title === "object"
                    ? tab.title[lang] || tab.title.en
                    : tab.title;

                return (
                  <button
                    key={tab._id || tab.id || tab.year || idx}
                    onClick={() => setActiveTab(tab.year)}
                    className={`flex flex-col items-center justify-center text-center px-3 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${dynamicTabs.length > 7
                        ? "shrink-0 min-w-[155px] max-w-[210px]"
                        : "flex-1 min-w-0"
                      } ${isActive
                        ? "bg-gradient-to-r from-[var(--primary)] to-red-700 text-white shadow-md shadow-red-900/20 scale-[1.02] border border-red-800"
                        : "bg-white/85 text-slate-800 hover:text-[var(--primary)] hover:bg-white hover:shadow-xs border border-amber-900/10"
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center text-center w-full min-w-0">
                      <span className="text-xs xl:text-sm font-extrabold tracking-tight leading-tight truncate w-full">
                        {tabTitle}
                      </span>
                      <div className="flex items-center justify-center gap-1.5 mt-1 whitespace-nowrap">
                        {tab.isLatest && (
                          <span
                            className="text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase leading-none text-white shadow-2xs"
                            style={{ background: "var(--secondary, #f07f22)" }}
                          >
                            LATEST
                          </span>
                        )}
                        {tab.subtitle && (
                          <span
                            className={`text-[10px] sm:text-[11px] font-bold leading-none ${isActive ? "text-white" : "text-slate-500"
                              }`}
                          >
                            {typeof tab.subtitle === "object"
                              ? tab.subtitle[lang] || tab.subtitle.en
                              : tab.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show Right Arrow Button Only when > 7 Tabs */}
            {dynamicTabs.length > 7 && (
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="shrink-0 w-9 h-9 rounded-full bg-white text-gray-700 hover:text-[var(--primary)] hover:bg-red-50 flex items-center justify-center border border-amber-900/10 shadow-2xs transition-all cursor-pointer z-10"
                title="More Years"
              >
                <FaChevronRight className="text-xs" />
              </button>
            )}
          </div>

          {/* Mobile & Tablet Dropdown Selector (lg:hidden) */}
          <div className="lg:hidden relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-[#fbf3ea] rounded-2xl shadow-sm border border-[#ebd8c5] text-left font-bold text-gray-800 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FaCalendarDays className="text-[var(--primary)] text-lg shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold truncate">
                    {typeof activeTabObj?.title === "object"
                      ? activeTabObj.title[lang] || activeTabObj.title.en
                      : activeTabObj?.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {activeTabObj?.isLatest && (
                      <span
                        className="text-[8px] px-2 py-0.5 rounded-full font-black uppercase text-white shadow-2xs"
                        style={{ background: "var(--secondary, #f07f22)" }}
                      >
                        LATEST
                      </span>
                    )}
                    {activeTabObj?.subtitle && (
                      <span className="text-[11px] text-gray-600 font-semibold">
                        {typeof activeTabObj.subtitle === "object"
                          ? activeTabObj.subtitle[lang] || activeTabObj.subtitle.en
                          : activeTabObj.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <FaChevronDown
                className={`text-gray-500 text-sm transition-transform duration-300 shrink-0 ml-2 ${dropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 p-2 overflow-hidden animate-fadeIn">
                {dynamicTabs.map((tab, idx) => {
                  const tabTitle =
                    typeof tab.title === "object"
                      ? tab.title[lang] || tab.title.en
                      : tab.title;
                  const tabSubtitle =
                    typeof tab.subtitle === "object"
                      ? tab.subtitle[lang] || tab.subtitle.en
                      : tab.subtitle;

                  const isCurrent = activeTab === tab.year;

                  return (
                    <button
                      key={tab._id || tab.id || tab.year || `dropdown-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.year);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${isCurrent
                          ? "bg-[var(--primary)] text-white font-bold"
                          : "text-gray-700 hover:bg-red-50"
                        }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-extrabold">
                          {tabTitle}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {tab.isLatest && (
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${isCurrent
                                  ? "bg-white text-[var(--primary)]"
                                  : "text-white"
                                }`}
                              style={!isCurrent ? { background: "var(--secondary, #f07f22)" } : {}}
                            >
                              LATEST
                            </span>
                          )}
                          {tabSubtitle && (
                            <span
                              className={`text-[11px] ${isCurrent ? "text-white/80" : "text-gray-500"
                                }`}
                            >
                              {tabSubtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
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
        ) : categories.length === 0 || totalPhotosInActiveTab === 0 ? (
          <div className="w-full max-w-md mx-auto my-8 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-[#ebd8c5] text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[var(--primary)] flex items-center justify-center mb-3 border border-red-100 shadow-2xs">
                <FaImages className="text-2xl" />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                {lang === "hi" ? "तस्वीरें जल्द उपलब्ध होंगी" : "Photos Coming Soon"}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 max-w-xs leading-relaxed font-medium mb-4">
                {lang === "hi"
                  ? "इस संस्करण की तस्वीरें जल्द ही अपलोड कर दी जाएंगी।"
                  : "Photos for this edition are currently being uploaded."}
              </p>

              <button
                type="button"
                onClick={() => setActiveTab(dynamicTabs[1]?.year || "2025")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-red-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>
                  {lang === "hi"
                    ? `संस्कारशाला ${dynamicTabs[1]?.year || "2025"} (Latest) देखें`
                    : `View Sanskarshala ${dynamicTabs[1]?.year || "2025"} (Latest)`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-14">
            {categories.map((cat, catIdx) => {
              const title =
                lang === "hi"
                  ? cat.categoryTitleHi || cat.categoryTitle
                  : cat.categoryTitle;

              return (
                <div key={cat._id || cat.id || cat.categoryTitle || catIdx} className="space-y-4">
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
                  className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${lightboxIndex === idx
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
