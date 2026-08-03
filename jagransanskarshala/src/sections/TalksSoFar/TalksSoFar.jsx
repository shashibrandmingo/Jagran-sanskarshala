"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaLock, FaArrowRight } from "react-icons/fa6";
import { getStories, storiesData } from "@/services/stories";

// Groups the topics into a 3-3-2 row pattern
function chunkTopics(topics) {
  return [topics.slice(0, 3), topics.slice(3, 6), topics.slice(6, 8)];
}

export default function TalksSoFar() {
  const { t, isHindi } = useLanguage();
  const [topics, setTopics] = useState(storiesData);

  useEffect(() => {
    getStories().then((data) => {
      if (data && data.length > 0) {
        setTopics(data);
      }
    });
  }, []);

  // Format topics according to selected language
  const formattedTopics = topics.map((item) => ({
    id: item.id,
    isPublished: item.isPublished,
    week: isHindi ? item.weekHi : item.weekEn,
    title: isHindi ? item.titleHi : item.titleEn,
    desc: isHindi ? item.descHi : item.descEn,
    link: item.link || `/story/${item.id}`,
  }));

  const rows = chunkTopics(formattedTopics);

  return (
    <section
      id="till-now"
      className="py-10 md:py-16 lg:py-20"
      style={{ background: "var(--background)" }}
    >
      <div className="container px-6 sm:px-8 mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="heading-lg section-title mb-8 sm:mb-10 text-center lg:text-left"
        >
          <span style={{ color: "var(--primary)" }}>
            {t.yearTalk?.headingMain || (isHindi ? "अब तक की" : "Talks")}
          </span>{" "}
          {t.yearTalk?.headingHighlight || (isHindi ? "बातचीत" : "So Far")}
        </motion.h2>

        <div className="flex flex-col gap-4 sm:gap-5">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {row.map((topic, i) => {
                const globalIndex = rowIndex * 3 + i;
                const isPublished = topic.isPublished;

                if (isPublished) {
                  return (
                    <Link key={topic.id} href={topic.link} className="block">
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{
                          duration: 0.5,
                          delay: globalIndex * 0.08,
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="topic-card-active rounded-2xl px-6 py-5 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 relative group overflow-hidden border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/25 text-white uppercase tracking-wider">
                            {topic.week} • {isHindi ? "सक्रिय" : "Active"}
                          </span>
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[var(--primary)] transition-all duration-300">
                            <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                          </span>
                        </div>
                        <h3 className="text-white font-black text-xl sm:text-2xl lg:text-3xl mb-2 leading-tight">
                          {topic.title}
                        </h3>
                        <p className="text-white/95 text-base sm:text-lg font-medium leading-relaxed">
                          {topic.desc}
                        </p>
                      </motion.div>
                    </Link>
                  );
                }

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.5,
                      delay: globalIndex * 0.08,
                      ease: "easeOut",
                    }}
                    className="topic-card opacity-80 rounded-2xl p-6 cursor-not-allowed select-none relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-white/80">
                        {topic.week}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-white/80 bg-black/20 px-3 py-1 rounded-full">
                        <FaLock className="text-[10px]" />
                        <span>{isHindi ? "जल्द" : "Soon"}</span>
                      </span>
                    </div>
                    <h3 className="text-white/95 font-black text-xl sm:text-2xl mb-2 leading-tight">
                      {topic.title}
                    </h3>
                    <p className="text-white/80 text-base sm:text-lg font-medium leading-relaxed">
                      {topic.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
