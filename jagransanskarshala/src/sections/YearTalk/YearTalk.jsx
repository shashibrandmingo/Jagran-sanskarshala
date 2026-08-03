"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaCalendarAlt, FaLock } from "react-icons/fa";
import BgBanner from "@/assets/images/bg-banner.png";
import { getStories, storiesData } from "@/services/stories";

export default function YearTalk() {
  const { t, isHindi } = useLanguage();
  const [topics, setTopics] = useState(storiesData);

  useEffect(() => {
    getStories().then((data) => {
      if (data && data.length > 0) setTopics(data);
    });
  }, []);

  const formattedTopics = topics.map((item) => ({
    id: item.id,
    isPublished: item.isPublished,
    week: isHindi ? item.weekHi : item.weekEn,
    title: isHindi ? item.titleHi : item.titleEn,
    desc: isHindi ? item.descHi : item.descEn,
    publishDate: isHindi ? item.publishDateHi : item.publishDateEn,
    link: item.link || `/story/${item.id}`,
  }));

  return (
    <section
      id="till-now"
      className="relative w-full bg-[var(--background)] overflow-hidden"
    >
      {/* ── DESKTOP BACKGROUND IMAGE (lg+) ── */}
      <div className="hidden lg:block absolute inset-0 w-full h-full max-w-[1774px] mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={BgBanner}
            alt="Talks So Far Banner"
            fill
            className="object-contain object-right"
            priority
          />
        </motion.div>
      </div>

      {/* ── MOBILE LAYOUT (< lg) ── */}
      <div className="lg:hidden">
        {/* Full-width banner image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="relative w-full overflow-hidden"
          style={{ height: "400px" }}
        >
          <Image
            src={BgBanner}
            alt="Talks So Far"
            fill
            className="object-contain object-center"
            priority
          />
          {/* Bottom fade to blend with background */}
          <div
            className="absolute bottom-0 left-0 w-full h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--background))",
            }}
          />
        </motion.div>

        {/* Mobile heading + cards */}
        <div className="px-4 sm:px-6 pb-8">
          <motion.h2
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="heading-lg mb-4 text-center"
          >
            <span style={{ color: "var(--primary)" }}>
              {t.yearTalk?.headingMain || (isHindi ? "अब तक की" : "Talks")}
            </span>{" "}
            {t.yearTalk?.headingHighlight || (isHindi ? "बातचीत" : "So Far")}
          </motion.h2>

          {/* Mobile 2-col card grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <AnimatePresence>
              {formattedTopics.map((topic, index) => {
                if (topic.isPublished) {
                  return (
                    <Link key={topic.id} href={topic.link} className="block text-left group">
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col shadow-md"
                        style={{ background: "var(--primary)" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                        <div className="relative z-10 p-3.5 sm:p-4 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/25 text-white uppercase leading-none whitespace-nowrap">
                              {topic.week} • {isHindi ? "Active" : "Active"}
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                              <FaArrowRight className="text-[9px] text-white" />
                            </span>
                          </div>
                          <h3 className="text-white font-black text-base sm:text-lg leading-snug mb-1">
                            {topic.title}
                          </h3>
                          <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 flex-1">
                            {topic.desc}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-white/20">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20">
                              <FaCalendarAlt className="text-white text-[9px] shrink-0" />
                              <span className="text-white text-[10px] sm:text-xs font-bold leading-none">{topic.publishDate}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                }

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="relative rounded-2xl overflow-hidden cursor-not-allowed select-none text-left h-full flex flex-col shadow-md"
                    style={{ background: "var(--secondary)" }}
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-[0.07] pointer-events-none">
                      <FaLock className="text-white text-[44px]" />
                    </div>
                    <div className="relative z-10 p-3.5 sm:p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white/80 uppercase leading-none whitespace-nowrap">
                          {topic.week}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/80 bg-black/20 px-2.5 py-1 rounded-full ml-1 whitespace-nowrap font-bold">
                          <FaLock className="text-[8px]" />
                          {isHindi ? "जल्द" : "Soon"}
                        </span>
                      </div>
                      <h3 className="text-white/95 font-black text-base sm:text-lg leading-snug mb-1">
                        {topic.title}
                      </h3>
                      <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 flex-1">
                        {topic.desc}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-white/15">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20">
                          <FaCalendarAlt className="text-white/80 text-[9px] shrink-0" />
                          <span className="text-white/90 text-[10px] sm:text-xs font-bold leading-none">{topic.publishDate}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (lg+) ── */}
      <div className="hidden lg:block container relative z-10 px-8">
        <div className="grid grid-cols-2 items-stretch">
          {/* LEFT: Heading + Cards */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col py-12"
          >
            <motion.h2
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="heading-lg mb-6 text-left"
            >
              <span style={{ color: "var(--primary)" }}>
                {t.yearTalk?.headingMain || "Talks"}
              </span>{" "}
              {t.yearTalk?.headingHighlight || "So Far"}
            </motion.h2>

            <div className="grid grid-cols-2 gap-3.5 flex-1 auto-rows-fr">
              <AnimatePresence>
                {formattedTopics.map((topic, index) => {
                  if (topic.isPublished) {
                    return (
                      <Link key={topic.id} href={topic.link} className="block text-left group">
                        <motion.div
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.06 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="relative rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300"
                          style={{ background: "var(--primary)" }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                          <div className="relative z-10 p-4 xl:p-4.5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-[11px] xl:text-xs font-extrabold px-3 py-1 rounded-full bg-white/25 text-white uppercase leading-none whitespace-nowrap">
                                {topic.week} • {isHindi ? "सक्रिय" : "Active"}
                              </span>
                              <motion.span
                                whileHover={{ rotate: 45 }}
                                transition={{ duration: 0.2 }}
                                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white transition-all duration-300 shrink-0 ml-1"
                              >
                                <FaArrowRight className="text-[10px] text-white group-hover:text-[var(--primary)]" />
                              </motion.span>
                            </div>
                            <h3 className="text-white font-black text-lg xl:text-xl leading-snug mb-1.5">
                              {topic.title}
                            </h3>
                            <p className="text-white/90 text-xs xl:text-sm font-medium leading-relaxed line-clamp-2 flex-1">
                              {topic.desc}
                            </p>
                            <div className="mt-3 pt-2.5 border-t border-white/20">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25">
                                <FaCalendarAlt className="text-white text-[11px] shrink-0" />
                                <span className="text-white text-xs font-bold leading-none">{topic.publishDate}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  }

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      className="relative rounded-2xl overflow-hidden cursor-not-allowed select-none text-left h-full flex flex-col shadow-md"
                      style={{ background: "var(--secondary)" }}
                    >
                      <div className="absolute -right-2 -bottom-2 opacity-[0.07] pointer-events-none">
                        <FaLock className="text-white text-[50px]" />
                      </div>
                      <div className="relative z-10 p-4 xl:p-4.5 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] xl:text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-white/80 uppercase leading-none whitespace-nowrap">
                            {topic.week}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-white/80 bg-black/20 px-3 py-1 rounded-full ml-1 whitespace-nowrap font-bold">
                            <FaLock className="text-[9px]" />
                            {isHindi ? "जल्द" : "Soon"}
                          </span>
                        </div>
                        <h3 className="text-white/95 font-black text-lg xl:text-xl leading-snug mb-1.5">
                          {topic.title}
                        </h3>
                        <p className="text-white/80 text-xs xl:text-sm font-medium leading-relaxed line-clamp-2 flex-1">
                          {topic.desc}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-white/15">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20">
                            <FaCalendarAlt className="text-white/80 text-[11px] shrink-0" />
                            <span className="text-white/90 text-xs font-bold leading-none">{topic.publishDate}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT: Spacer for bg image */}
          <div aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
