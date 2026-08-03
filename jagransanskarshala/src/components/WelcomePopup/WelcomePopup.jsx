"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter, usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import { FaGraduationCap, FaUserGroup } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LogoEnglish from "@/assets/images/Logo-english.png";
import LogoHindi from "@/assets/images/Logo-hindi.png";

export default function WelcomePopup() {
  const { t, isHindi } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const currentLogo = isHindi ? LogoHindi : LogoEnglish;

  useEffect(() => {
    // Disable popup on any /survey or /admin pages (/admin-login, /admin/dashboard, etc.)
    if (pathname && (pathname.startsWith("/survey") || pathname.startsWith("/admin"))) {
      setIsOpen(false);
      return;
    }

    // Open the popup 2.5 seconds after initial load on non-survey & non-admin pages
    if (!hasOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasOpened(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasOpened, pathname]);

  // Don't render popup component at all if user is on any survey or admin page
  if (pathname && (pathname.startsWith("/survey") || pathname.startsWith("/admin"))) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const welcome = t?.welcomePopup || {
    description:
      "Join us in exploring digital consciousness and making a positive impact in the digital world.",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-[var(--background)] rounded-2xl shadow-2xl p-6 sm:p-9 text-center overflow-hidden z-10 border border-gray-200"
          >
            {/* Top red accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--primary)]" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 text-gray-500 hover:text-[var(--primary)] transition-colors p-2 bg-gray-200/80 hover:bg-red-100 rounded-full cursor-pointer"
              aria-label="Close popup"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Website Logo */}
            <div className="mx-auto mb-5 flex justify-center">
              <Image
                src={currentLogo}
                alt="Jagran Sanskarshala"
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-[17px] text-[var(--paragraph)] mb-7 leading-relaxed font-medium max-w-md mx-auto">
              {welcome.description}
            </p>

            {/* Two Action Buttons: For Student & For Parent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* For Student Button */}
              <button
                onClick={() => handleNavigate("/survey/student")}
                className="w-full py-3 px-4 rounded-full bg-[var(--primary)] hover:bg-red-800 text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <FaGraduationCap className="text-base" />
                <span>For Student</span>
              </button>

              {/* For Parent Button */}
              <button
                onClick={() => handleNavigate("/survey/parent")}
                className="w-full py-3 px-4 rounded-full bg-[#f07f22] hover:bg-[#e07018] text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <FaUserGroup className="text-base" />
                <span>For Parent</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
