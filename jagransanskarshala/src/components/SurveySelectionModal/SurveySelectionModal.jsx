"use client";

import { useSurveyModal } from "@/context/SurveyModalContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoEnglish from "@/assets/images/Logo-english.png";
import LogoHindi from "@/assets/images/Logo-hindi.png";
import { FiX } from "react-icons/fi";
import { FaGraduationCap, FaUserGroup, FaArrowRight } from "react-icons/fa6";

export default function SurveySelectionModal() {
  const { isSurveyModalOpen, closeSurveyModal } = useSurveyModal();
  const { isHindi } = useLanguage();
  const router = useRouter();

  const handleSelect = (category) => {
    closeSurveyModal();
    if (category === "student") {
      router.push("/survey/student");
    } else if (category === "parent") {
      router.push("/survey/parent");
    }
  };

  const logoSrc = isHindi ? LogoHindi : LogoEnglish;

  return (
    <AnimatePresence>
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSurveyModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl p-4 sm:p-6 z-10 border border-gray-100 overflow-hidden"
          >
            {/* Background Accent Gradients */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--primary)]/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[var(--secondary)]/15 blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeSurveyModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100/80 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center cursor-pointer z-20"
              aria-label="Close modal"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header with Dynamic Logo */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="flex justify-center mb-2">
                <Image
                  src={logoSrc}
                  alt="Dainik Jagran Sanskarshala"
                  width={180}
                  height={50}
                  priority
                  className="h-9 sm:h-12 w-auto object-contain"
                />
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-red-100 text-[var(--primary)] text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
                National Digital Survey 2026
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                Select Your Category
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium leading-normal">
                कृपया चुनें कि आप यह सर्वे विद्यार्थी के रूप में भर रहे हैं या अभिभावक के रूप में।
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Student Option */}
              <button
                onClick={() => handleSelect("student")}
                className="group relative p-3.5 sm:p-4 rounded-2xl border-2 border-red-100 bg-red-50/40 hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all duration-300 flex flex-row sm:flex-col items-center sm:text-center shadow-xs hover:shadow-lg hover:-translate-y-0.5 active:scale-98 cursor-pointer gap-3 sm:gap-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white group-hover:bg-white/20 text-[var(--primary)] group-hover:text-white flex items-center justify-center text-xl sm:text-2xl sm:mb-2.5 transition-colors shadow-xs shrink-0">
                  <FaGraduationCap />
                </div>
                <div className="flex-1 text-left sm:text-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-white transition-colors">
                    For Student
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 group-hover:text-white/80 transition-colors sm:mb-2">
                    विद्यार्थियों के लिए सर्वे
                  </p>
                  <div className="hidden sm:flex items-center justify-center gap-1 text-xs font-bold text-[var(--primary)] group-hover:text-white mt-auto">
                    <span>Start Survey</span>
                    <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-white group-hover:bg-white/20 text-[var(--primary)] group-hover:text-white text-xs shrink-0">
                  <FaArrowRight />
                </div>
              </button>

              {/* Parent Option */}
              <button
                onClick={() => handleSelect("parent")}
                className="group relative p-3.5 sm:p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/40 hover:bg-[#f07f22] hover:border-[#f07f22] transition-all duration-300 flex flex-row sm:flex-col items-center sm:text-center shadow-xs hover:shadow-lg hover:-translate-y-0.5 active:scale-98 cursor-pointer gap-3 sm:gap-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white group-hover:bg-white/20 text-[#f07f22] group-hover:text-white flex items-center justify-center text-xl sm:text-2xl sm:mb-2.5 transition-colors shadow-xs shrink-0">
                  <FaUserGroup />
                </div>
                <div className="flex-1 text-left sm:text-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-white transition-colors">
                    For Parent
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 group-hover:text-white/80 transition-colors sm:mb-2">
                    अभिभावकों के लिए सर्वे
                  </p>
                  <div className="hidden sm:flex items-center justify-center gap-1 text-xs font-bold text-[#f07f22] group-hover:text-white mt-auto">
                    <span>Start Survey</span>
                    <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-white group-hover:bg-white/20 text-[#f07f22] group-hover:text-white text-xs shrink-0">
                  <FaArrowRight />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
