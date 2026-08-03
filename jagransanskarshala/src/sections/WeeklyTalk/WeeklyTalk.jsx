"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import WeeklyTalkImage from "@/assets/images/WeeklyTalk.png";
import WeeklyTalkLeftside from "@/assets/images/WeeklyTalkleftside.png";

export default function WeeklyTalk() {
  const { t } = useLanguage();
  const bodyLines = t.weeklyTalk.body.split("\n");

  return (
    <section
      id="this-week"
      className="relative overflow-hidden pt-8 md:pt-0 pb-8 md:pb-10"
      style={{ background: "var(--background)" }}
    >
      {/* Decorative circles — bottom-left, partially clipped */}
      <div
        className="absolute -bottom-10 -left-8 w-[120px] sm:w-[140px] aspect-square pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <Image
          src={WeeklyTalkLeftside}
          alt=""
          fill
          className="object-contain"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4">
        {" "}
        <div className="grid lg:grid-cols-[1fr_minmax(520px,620px)] gap-8 items-center lg:items-start">
          {" "}
          {/* ── LEFT: Heading + Week + Topic + Body ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:pl-12 xl:pl-20 lg:mt-32 xl:mt-40"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold leading-tight whitespace-nowrap"
              style={{ color: "var(--heading)" }}
            >
              <span style={{ color: "var(--primary)" }}>
                {t.weeklyTalk.headingMain}
              </span>{" "}
              <span>{t.weeklyTalk.headingHighlight}</span>
            </h2>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-20">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="font-semibold shrink-0 text-base"
                style={{ color: "var(--heading)" }}
              >
                {t.weeklyTalk.week}
              </motion.span>

              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="heading-sm mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  {t.weeklyTalk.title}
                </motion.h3>

                <div className="space-y-1">
                  {bodyLines.map((line, i) => {
                    const isLast = i === bodyLines.length - 1;
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                        className={
                          isLast ? "paragraph font-semibold" : "paragraph"
                        }
                        style={isLast ? { color: "var(--heading)" } : undefined}
                      >
                        {line}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
          {/* ── RIGHT: Image on TOP, Buttons BELOW (contained width) ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col gap-3 sm:gap-4 w-full max-w-[360px] sm:max-w-[420px] ml-auto -mr-5 sm:-mr-6 lg:max-w-none lg:w-[520px] justify-self-center lg:justify-self-end lg:-mr-8"
          >
            {/* Girl + icons + circles image — natural aspect ratio, no forced crop */}
            <div className="relative w-full">
              {" "}
              <Image
                src={WeeklyTalkImage}
                alt={t.weeklyTalk.title}
                priority
                className="block w-full h-auto"
              />
            </div>

            {/* Buttons — adjusted to be narrower, slightly left, and touching the image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative z-10 flex flex-col gap-2 w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[300px] mx-auto -mt-4 -translate-x-8 lg:-translate-x-14"
            >
              <a
                href="#"
                className="primary-btn w-full !py-2.5 lg:!py-3 text-sm sm:text-base whitespace-nowrap transition-default hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t.weeklyTalk.buttons.viewAd}
              </a>
              <a
                href="#"
                className="primary-btn w-full !py-2.5 lg:!py-3 text-sm sm:text-base whitespace-nowrap transition-default hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t.weeklyTalk.buttons.readArticle}
              </a>
              <a
                href="#"
                className="primary-btn w-full !py-2.5 lg:!py-3 text-sm sm:text-base whitespace-nowrap transition-default hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t.weeklyTalk.buttons.whatDoYouThink}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
