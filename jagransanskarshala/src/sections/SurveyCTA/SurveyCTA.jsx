"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useSurveyModal } from "@/context/SurveyModalContext";
import { motion } from "framer-motion";
import { FaClipboardList, FaArrowRight, FaSparkles } from "react-icons/fa6";

export default function SurveyCTA() {
  const { t } = useLanguage();
  const { openSurveyModal } = useSurveyModal();
  const data = t.surveyCTA;

  if (!data) return null;

  return (
    <section
      id="survey"
      className="py-10 md:py-16 lg:py-20 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="container px-6 sm:px-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 md:p-14 text-center flex flex-col items-center justify-center shadow-2xl border border-white/20"
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, #a01013 50%, #75080a 100%)",
          }}
        >
          {/* Decorative glowing circles in background */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-2xl"
            style={{ background: "var(--secondary)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{ background: "var(--secondary)" }}
            aria-hidden="true"
          />

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold tracking-wide mb-6 border border-white/20 shadow-inner"
          >
            <FaClipboardList className="text-[var(--secondary)] text-sm" />
            <span>{data.badge}</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight max-w-3xl"
          >
            {data.headingMain}{" "}
            <span style={{ color: "var(--secondary)" }}>
              {data.headingHighlight}
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mt-4 leading-relaxed font-normal"
          >
            {data.description}
          </motion.p>

          {/* Highlighted Premium CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 sm:mt-10 relative group"
          >
            {/* Subtle soft glow */}
            <div
              className="absolute -inset-0.5 rounded-full opacity-25 blur-sm group-hover:opacity-40 transition duration-300"
              style={{
                background: "var(--secondary)",
              }}
            />

            <button
              onClick={openSurveyModal}
              className="relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg text-white shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, var(--secondary) 0%, #e06d10 100%)",
              }}
            >
              <span>{data.button}</span>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-[var(--primary)] transition-all duration-300">
                <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
