"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import Image from "next/image";
import AboutBannerDesktop from "@/assets/images/aboutusbanner.png";
import AboutBannerMobile from "@/assets/images/aboutusbannermobile.png";

export default function About() {
  const { t } = useLanguage();
  const paragraphLines = t.about2026.paragraph.split("\n");

  return (
    <section
      id="this-year"
      className="relative w-full bg-[var(--background)] overflow-hidden py-6 sm:py-12 lg:py-16"
    >
      {/* 
        DESKTOP BACKGROUND (Hidden on Mobile)
        Uses object-cover with left alignment so the student image maintains exact true proportions without squishing.
      */}
      <div className="hidden lg:block absolute inset-0 w-full h-full max-w-[1774px] mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={AboutBannerDesktop}
            alt="About Jagran Sanskarshala Banner"
            fill
            className="object-cover object-left lg:object-[2%_center] xl:object-left"
            priority
            sizes="(min-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>

      {/* 
        MOBILE: Edge-to-Edge Full-Width Image (< lg)
        Uses native 700:741 aspect ratio to span full screen width gracefully without letterboxing or squishing.
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="block lg:hidden relative w-full aspect-[700/741] max-h-[460px] mx-auto overflow-hidden -mt-2 mb-4"
      >
        <Image
          src={AboutBannerMobile}
          alt="About Jagran Sanskarshala"
          fill
          className="object-contain object-center"
          sizes="100vw"
          priority
        />
      </motion.div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* DESKTOP: Left 5 columns space for left image */}
          <div
            className="hidden lg:block lg:col-span-5 min-h-[380px] xl:min-h-[440px]"
            aria-hidden="true"
          />

          {/* RIGHT: Text Content (7 columns on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left py-2 sm:py-4 lg:py-6"
          >
            <h2 className="heading-lg text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-gray-900">
              {t.about2026.headingMain}{" "}
              <span style={{ color: "var(--primary)" }}>
                {t.about2026.headingHighlight}
              </span>
            </h2>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-gray-700">
              {paragraphLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="paragraph text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed sm:leading-relaxed font-medium text-justify"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {t.about?.highlight && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="heading-sm mt-6 sm:mt-8 text-sm sm:text-base lg:text-lg font-bold text-[var(--primary)]"
              >
                {t.about.highlight}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
