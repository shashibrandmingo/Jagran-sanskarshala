"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaLock,
  FaCheck,
  FaBookOpen,
  FaCalendarDays,
  FaArrowRight,
  FaNewspaper,
} from "react-icons/fa6";
import { storiesData, getStoryById } from "@/services/stories";
import Story1Img from "@/assets/images/story1.webp";

export default function StoryDetailPage() {
  const routeParams = useParams();
  const storyId = Number(routeParams?.id) || 1;

  const { isHindi } = useLanguage();
  const [currentStory, setCurrentStory] = useState(null);

  useEffect(() => {
    getStoryById(storyId).then((story) => {
      setCurrentStory(story || storiesData[0]);
    });
  }, [storyId]);

  if (!currentStory) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="paragraph">Loading story...</p>
        </div>
      </div>
    );
  }

  const title = (isHindi ? currentStory.titleHi : currentStory.titleEn) || "";
  const week = (isHindi ? currentStory.weekHi : currentStory.weekEn) || "";
  const desc = (isHindi ? currentStory.descHi : currentStory.descEn) || "";
  const publishDate = (isHindi ? currentStory.publishDateHi : currentStory.publishDateEn) || "";

  const publishedStories = storiesData.filter((s) => s.isPublished);
  const upcomingStories = storiesData.filter((s) => !s.isPublished);

  // Story image to display (backend URL string or static import fallback)
  const storyImageSrc = currentStory.image || Story1Img;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 py-5 sm:py-10 md:py-16">
        <div className="w-full px-3 sm:px-6 mx-auto max-w-5xl">

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-4 sm:mb-7"
          >
            <Link
              href="/#till-now"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[var(--primary)] text-[var(--heading)] hover:text-white font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm hover:shadow group"
            >
              <FaArrowLeft className="text-[10px] text-[var(--primary)] group-hover:text-white transition-colors shrink-0" />
              <span>{isHindi ? "मुख्य पृष्ठ पर वापस जाएँ" : "Back to Home"}</span>
            </Link>
          </motion.div>

          {/* ── HERO STORY CARD ── */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl mb-5 sm:mb-8"
            style={{ background: "var(--primary)" }}
          >
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 rounded-full opacity-10 bg-white blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 sm:w-40 h-24 sm:h-40 rounded-full opacity-10 bg-white blur-2xl pointer-events-none" />

            <div className="relative z-10 p-4 sm:p-8 md:p-12">
              {/* TOP ROW — badges + date all in one flex-wrap row */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-white/20 pb-3.5 sm:pb-5">
                {/* Left: Week + Published */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest border border-white/20">
                    {week}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white text-[var(--primary)] text-[10px] sm:text-xs font-extrabold shadow-sm">
                    <FaCheck className="text-[8px] sm:text-[10px]" />
                    {isHindi ? "प्रकाशित" : "Published"}
                  </span>
                </div>

                {/* Right: Published On date chip */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm shadow-sm">
                  <FaCalendarDays className="text-white text-[11px] sm:text-sm shrink-0" />
                  <div className="flex flex-col leading-none">
                    <span className="text-white/70 text-[7px] sm:text-[9px] uppercase tracking-widest font-bold">
                      {isHindi ? "प्रकाशित तिथि" : "Published On"}
                    </span>
                    <span className="text-white text-[11px] sm:text-sm font-black mt-0.5">
                      {publishDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[1.6rem] sm:text-4xl md:text-5xl font-black text-white mb-1.5 sm:mb-2 leading-tight tracking-tight">
                {title}
              </h1>

              {/* Description */}
              <p className="text-white/85 text-sm sm:text-lg lg:text-xl font-medium leading-relaxed max-w-3xl">
                {desc}
              </p>

            </div>
          </motion.article>


          {/* ── NEWSPAPER ARTICLE VIEWER ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mb-8 sm:mb-12"
          >
            {/* On mobile: no side border-radius for edge-to-edge feel; rounded on sm+ */}
            <div
              className="overflow-hidden rounded-xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.09)] sm:shadow-[0_8px_40px_rgba(0,0,0,0.13)] border-0 sm:border-2"
              style={{ borderColor: "var(--primary)" }}
            >
              {/* Brand Header */}
              <div
                className="flex items-center px-3.5 sm:px-7 py-2.5 sm:py-4 gap-2 sm:gap-3"
                style={{ background: "var(--primary)" }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
                  <FaNewspaper className="text-white text-[11px] sm:text-sm" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-white/65 text-[8px] sm:text-[9px] uppercase tracking-[0.13em] font-bold">
                    {isHindi ? "दैनिक जागरण" : "Dainik Jagran"}
                  </span>
                  <span className="text-white text-xs sm:text-base font-black tracking-wide">
                    {isHindi ? "संस्कारशाला — समाचार पत्र लेख" : "Sanskarshala — Newspaper Feature"}
                  </span>
                </div>
              </div>

              {/* Newspaper Image — full-width, natural height, warm white bg */}
              <div className="w-full bg-[#faf8f4]">
                <Image
                  src={storyImageSrc}
                  alt={title}
                  width={1200}
                  height={900}
                  className="w-full h-auto block"
                  priority
                />
              </div>

              {/* Footer Strip */}
              <div className="flex items-center justify-between px-3.5 sm:px-7 py-2 sm:py-3 bg-white border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 font-medium">
                  <FaCalendarDays className="text-[10px]" style={{ color: "var(--primary)" }} />
                  {publishDate}
                </span>
                <span className="text-[9px] sm:text-[11px] text-gray-400 font-semibold tracking-widest uppercase">
                  {isHindi ? "दैनिक जागरण • संस्कारशाला" : "Dainik Jagran • Sanskarshala"}
                </span>
              </div>
            </div>
          </motion.div>


          {/* ── ALL STORIES SECTION ── */}
          <section className="mt-8 sm:mt-12">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-7">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--primary)" }}>
                <FaBookOpen className="text-white text-xs sm:text-sm" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-[var(--heading)]">
                {isHindi ? "सभी कहानियाँ" : "All Stories"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Published */}
              {publishedStories.map((story) => {
                const isCurrent = story.id === currentStory.id;
                const stTitle = isHindi ? story.titleHi : story.titleEn;
                const stWeek = isHindi ? story.weekHi : story.weekEn;
                const stDesc = isHindi ? story.descHi : story.descEn;
                const stDate = isHindi ? story.publishDateHi : story.publishDateEn;

                return (
                  <Link key={story.id} href={`/story/${story.id}`}>
                    <motion.div
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isCurrent
                          ? "border-[var(--primary)] shadow-md sm:shadow-lg"
                          : "bg-white border-black/5 hover:border-[var(--primary)]/40 hover:shadow-md"
                      }`}
                      style={isCurrent ? { background: "var(--primary)" } : {}}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 bg-white blur-2xl pointer-events-none" />
                      )}

                      {/* Top row */}
                      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                        <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isCurrent ? "bg-white/20 text-white" : "bg-[var(--background)] text-[var(--primary)]"
                        }`}>
                          {stWeek}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          isCurrent ? "bg-white text-[var(--primary)]" : "text-emerald-600 bg-emerald-50"
                        }`}>
                          <FaCheck className="text-[8px]" />
                          {isHindi ? "प्रकाशित" : "Published"}
                        </span>
                      </div>

                      <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-1.5 ${isCurrent ? "text-white" : "text-[var(--heading)]"}`}>
                        {stTitle}
                      </h3>
                      <p className={`text-xs sm:text-sm line-clamp-2 mb-2.5 sm:mb-3 ${isCurrent ? "text-white/80" : "text-[var(--paragraph)]"}`}>
                        {stDesc}
                      </p>

                      {/* Date + arrow */}
                      <div className={`flex items-center justify-between pt-2.5 sm:pt-3 border-t ${isCurrent ? "border-white/20" : "border-black/8"}`}>
                        <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl ${
                          isCurrent ? "bg-white/15" : "bg-[var(--primary)]/10"
                        }`}>
                          <FaCalendarDays className={`text-[10px] shrink-0 ${isCurrent ? "text-white" : "text-[var(--primary)]"}`} />
                          <span className={`text-[10px] sm:text-xs font-bold ${isCurrent ? "text-white" : "text-[var(--primary)]"}`}>
                            {stDate}
                          </span>
                        </div>
                        <FaArrowRight className={`text-[10px] ${isCurrent ? "text-white/80" : "text-[var(--primary)]"}`} />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Upcoming */}
              {upcomingStories.map((story) => {
                const stTitle = isHindi ? story.titleHi : story.titleEn;
                const stWeek = isHindi ? story.weekHi : story.weekEn;
                const stDesc = isHindi ? story.descHi : story.descEn;
                const stDate = isHindi ? story.publishDateHi : story.publishDateEn;

                return (
                  <div
                    key={story.id}
                    className="relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 border border-black/5 opacity-70 cursor-not-allowed select-none overflow-hidden"
                  >
                    {/* Faint lock watermark */}
                    <div className="absolute -right-2 -bottom-2 opacity-[0.06] pointer-events-none">
                      <FaLock className="text-gray-400 text-[48px] sm:text-[60px]" />
                    </div>

                    {/* Top row */}
                    <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider">
                        {stWeek}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <FaLock className="text-[8px]" />
                        {isHindi ? "जल्द" : "Coming Soon"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-1 sm:mb-1.5">{stTitle}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-2.5 sm:mb-3">{stDesc}</p>

                    {/* Date */}
                    <div className="flex items-center gap-2 pt-2.5 sm:pt-3 border-t border-black/5">
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-100">
                        <FaCalendarDays className="text-[10px] text-gray-500 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-bold text-gray-600">
                          {isHindi ? "प्रकाशित होगा: " : "Publishes: "}{stDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />

    </div>
  );
}
