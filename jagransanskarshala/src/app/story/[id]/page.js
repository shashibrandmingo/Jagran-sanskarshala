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
} from "react-icons/fa6";
import {
  getStories,
  getStoryById,
  resolveStoryPublishStatus,
} from "@/services/stories";
import Story1Img from "@/assets/images/story1.webp";

export default function StoryDetailPage() {
  const routeParams = useParams();
  const storyId = Number(routeParams?.id) || 1;

  const { isHindi } = useLanguage();
  const [currentStory, setCurrentStory] = useState(null);
  const [allStories, setAllStories] = useState([]);

  useEffect(() => {
    getStoryById(storyId).then((story) => {
      setCurrentStory(story);
    });
    getStories().then((list) => {
      setAllStories(list || []);
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
  const publishDate =
    (isHindi ? currentStory.publishDateHi : currentStory.publishDateEn) || "";

  const publishedStories = allStories.filter((s) =>
    resolveStoryPublishStatus(s)
  );
  const upcomingStories = allStories.filter(
    (s) => !resolveStoryPublishStatus(s)
  );

  // Story image to display
  const storyImageSrc = currentStory.image || Story1Img;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-6 sm:py-10 md:py-12">
        <div className="w-full px-4 sm:px-8 mx-auto max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 sm:mb-6"
          >
            <Link
              href="/#till-now"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[var(--primary)] hover:opacity-80 transition-opacity bg-white/60 px-4 py-2 rounded-full border border-black/5 shadow-2xs"
            >
              <FaArrowLeft className="text-xs" />
              <span>{isHindi ? "सभी कहानियां" : "Back to All Stories"}</span>
            </Link>
          </motion.div>

          {/* MAIN STORY CARD DISPLAY */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-black/5"
          >
            {/* TOP COMPACT RED BANNER */}
            <div
              className="relative px-4 sm:px-8 py-4 sm:py-5 md:py-6 text-white overflow-hidden"
              style={{ background: "var(--primary)" }}
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-2 sm:space-y-2.5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[11px] sm:text-xs font-black text-white px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs"
                    style={{ background: "var(--secondary, #f07f22)" }}
                  >
                    <FaCheck className="text-[10px]" />
                    {isHindi ? "सक्रिय कहानी" : "Active Story"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                  {title}
                </h1>

                {/* Description */}
                <p className="text-white/95 text-xs sm:text-base font-medium leading-relaxed max-w-3xl">
                  {desc}
                </p>
              </div>
            </div>

            {/* NEWSPAPER IMAGE WRAPPER */}
            <div className="w-full bg-[#f8f6f0] p-1 sm:p-3">
              <Image
                src={storyImageSrc}
                alt={title}
                width={1400}
                height={1000}
                unoptimized={typeof storyImageSrc === "string"}
                className="w-full h-auto block rounded-lg sm:rounded-xl shadow-xs"
                priority
              />
            </div>

            {/* FOOTER STRIP */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-white border-t border-gray-100">
              <span className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-bold">
                <FaCalendarDays
                  className="text-xs"
                  style={{ color: "var(--primary)" }}
                />
                {publishDate}
              </span>
              <span className="text-xs text-gray-400 font-extrabold tracking-widest uppercase">
                {isHindi
                  ? "दैनिक जागरण • संस्कारशाला"
                  : "Dainik Jagran • Sanskarshala"}
              </span>
            </div>
          </motion.article>

          {/* ALL STORIES NAVIGATION SECTION */}
          <section className="mt-10 sm:mt-14 pt-8 border-t border-black/8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ background: "var(--primary)" }}
              >
                <FaBookOpen />
              </div>
              <h2 className="heading-md text-[var(--heading)]">
                {isHindi ? "सभी कहानियां" : "All Stories"}
              </h2>
            </div>

            {/* Grid of stories (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Published Stories */}
              {publishedStories.map((story) => {
                const sId = Number(story.id || story.storyId);
                const isCurrent = sId === storyId;
                const stTitle = isHindi ? story.titleHi : story.titleEn;
                const stWeek = isHindi ? story.weekHi : story.weekEn;
                const stDesc = isHindi ? story.descHi : story.descEn;
                const stDate = isHindi
                  ? story.publishDateHi
                  : story.publishDateEn;

                return (
                  <Link
                    key={sId}
                    href={`/story/${sId}`}
                    className="block group"
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 h-full flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl ${
                        isCurrent
                          ? "ring-4 ring-red-300 border-white"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{ background: "var(--primary)" }}
                    >
                      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 bg-white blur-2xl pointer-events-none" />

                      {/* Top row */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                          {isCurrent ? (
                            <span className="text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/25 text-white">
                              Reading
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-[var(--primary)] shadow-2xs">
                            <FaCheck className="text-[8px]" />
                            {isHindi ? "प्रकाशित" : "Published"}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-white mb-1 sm:mb-1.5 leading-snug">
                          {stTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 mb-2.5 sm:mb-3 leading-relaxed">
                          {stDesc}
                        </p>
                      </div>

                      {/* Date + arrow */}
                      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-white/20">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/15 border border-white/25">
                          <FaCalendarDays className="text-[10px] text-white shrink-0" />
                          <span className="text-[10px] sm:text-xs font-bold text-white leading-none">
                            {stDate}
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] group-hover:bg-white group-hover:text-[var(--primary)] transition-all">
                          <FaArrowRight />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Upcoming Stories */}
              {upcomingStories.map((story) => {
                const sId = Number(story.id || story.storyId);
                const stTitle = isHindi ? story.titleHi : story.titleEn;
                const stWeek = isHindi ? story.weekHi : story.weekEn;
                const stDesc = isHindi ? story.descHi : story.descEn;
                const stDate = isHindi
                  ? story.publishDateHi
                  : story.publishDateEn;

                return (
                  <div
                    key={sId}
                    className="relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 border border-black/5 opacity-70 cursor-not-allowed select-none overflow-hidden h-full flex flex-col justify-between"
                  >
                    {/* Faint lock watermark */}
                    <div className="absolute -right-2 -bottom-2 opacity-[0.06] pointer-events-none">
                      <FaLock className="text-gray-400 text-[48px] sm:text-[60px]" />
                    </div>

                    {/* Top row */}
                    <div>
                      <div className="flex items-center justify-end mb-2.5 sm:mb-3">
                        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          <FaLock className="text-[8px]" />
                          {isHindi ? "जल्द" : "Coming Soon"}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-1 sm:mb-1.5">
                        {stTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-2.5 sm:mb-3">
                        {stDesc}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 pt-2.5 sm:pt-3 border-t border-black/5">
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-100">
                        <FaCalendarDays className="text-[10px] text-gray-500 shrink-0" />
                        <span className="text-[10px] sm:text-xs font-bold text-gray-600">
                          {isHindi ? "प्रकाशन जल्द: " : "Publishes: "}
                          {stDate}
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
