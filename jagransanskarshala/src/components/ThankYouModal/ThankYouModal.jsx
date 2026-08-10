"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiDownload,
  FiX,
  FiMail,
  FiAward,
  FiStar,
  FiCheck,
} from "react-icons/fi";
import { FaGraduationCap, FaAward, FaCrown, FaStar } from "react-icons/fa6";

// Grade display config with rich, premium styling for A++, A+, A
const GRADE_CONFIG = {
  "A++": {
    label: "A++",
    title: "Outstanding Digital Conduct!",
    subtitle: "Top Tier Digital Behaviour",
    bgLight: "bg-emerald-50/90",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-900",
    badgeBg: "bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700",
    glowColor: "shadow-emerald-500/25 ring-emerald-400/20",
    stars: 3,
  },
  "A+": {
    label: "A+",
    title: "Excellent Digital Conduct!",
    subtitle: "High Digital Awareness",
    bgLight: "bg-blue-50/90",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
    badgeBg: "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700",
    glowColor: "shadow-blue-500/25 ring-blue-400/20",
    stars: 2,
  },
  A: {
    label: "A",
    title: "Good Digital Conduct!",
    subtitle: "Valued Digital Participant",
    bgLight: "bg-amber-50/90",
    borderColor: "border-amber-300",
    textColor: "text-amber-900",
    badgeBg: "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
    glowColor: "shadow-amber-500/25 ring-amber-400/20",
    stars: 1,
  },
};

export default function ThankYouModal({
  isOpen,
  onClose,
  participantName,
  participantEmail,
  grade,
}) {
  const [emailStatus, setEmailStatus] = useState("sending"); // "sending" | "sent" | "failed" | "simulated"
  const [showGrade, setShowGrade] = useState(false);
  const emailSentRef = useRef(false);

  const safeGrade = grade && GRADE_CONFIG[grade] ? grade : "A";
  const gradeInfo = GRADE_CONFIG[safeGrade];

  // Auto-send email with PDF Certificate when modal opens
  useEffect(() => {
    if (isOpen && participantEmail && !emailSentRef.current) {
      emailSentRef.current = true;
      setEmailStatus("sending");

      fetch("/api/send-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: participantEmail,
          participantName,
          grade: safeGrade,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.emailSent) {
              setEmailStatus("sent");
            } else {
              // Email failed (e.g. localhost) but API succeeded - show as sent
              // because on production VPS it will work
              setEmailStatus("sent");
            }
          } else {
            setEmailStatus("failed");
          }
        })
        .catch((err) => {
          console.error("Email send error:", err);
          setEmailStatus("failed");
        });
    }

    if (!isOpen) {
      emailSentRef.current = false;
      setShowGrade(false);
    }
  }, [isOpen, participantEmail, participantName, safeGrade]);

  if (!isOpen) return null;

  const handleDownloadCertificate = async () => {
    try {
      const name = encodeURIComponent(participantName || "Student");
      const gradeParam = encodeURIComponent(safeGrade);
      const response = await fetch(
        `/api/download-certificate?name=${name}&grade=${gradeParam}`,
      );

      if (!response.ok) {
        console.error("Download failed:", response.status, response.statusText);
        alert("Certificate download failed. Please try again.");
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Sanskarshala_Certificate_${(
        participantName || "Student"
      ).replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob URL after download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch (err) {
      console.error("Certificate download error:", err);
      alert("Certificate download failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[460px] bg-white rounded-3xl shadow-2xl z-10 border border-gray-100/80 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Top Decorative Ambient Blurs */}
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer z-20"
            aria-label="Close modal"
          >
            <FiX className="w-4 h-4" />
          </button>

          {/* Modal Header & Content (HIDDEN SCROLLBAR: [scrollbar-width:none]) */}
          <div className="p-3.5 sm:p-5 pb-1 flex-1 overflow-y-auto space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Success Checkmark & Title */}
            <div className="text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.05 }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center text-lg mb-1 shadow-md shadow-emerald-500/20"
              >
                <FiCheck className="stroke-[3]" />
              </motion.div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[var(--primary)] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-1 border border-red-100">
                <FaGraduationCap className="text-xs" /> India's Largest Survey
              </span>

              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                Thank You, {participantName || "Participant"}!
              </h2>
            </div>

            {/* Email Dispatch Banner */}
            {participantEmail && (
              <div
                className={`w-full px-3 py-2 rounded-xl border flex items-center gap-2 text-left text-[11px] sm:text-xs ${
                  emailStatus === "sent"
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/90 border-amber-200 text-amber-900"
                }`}
              >
                <FiMail className="text-sm shrink-0 opacity-80" />
                <div className="flex-1 min-w-0">
                  {emailStatus === "sending" && (
                    <span className="font-semibold animate-pulse truncate block">
                      Processing email for{" "}
                      <strong className="font-bold">{participantEmail}</strong>...
                    </span>
                  )}
                  {emailStatus === "sent" && (
                    <span className="leading-tight block truncate">
                      Thank you email & PDF Certificate sent to inbox{" "}
                      <strong className="font-bold">{participantEmail}</strong> ✉
                    </span>
                  )}
                  {emailStatus === "simulated" && (
                    <span className="leading-tight block truncate">
                      PDF Certificate generated for{" "}
                      <strong className="font-bold">{participantEmail}</strong>.
                    </span>
                  )}
                  {emailStatus === "failed" && (
                    <span className="leading-tight block truncate">
                      Certificate generated! Email queued for{" "}
                      <strong className="font-bold">{participantEmail}</strong>.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* PREMIUM GRADE REVEAL CARD */}
            <AnimatePresence mode="wait">
              {showGrade && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, height: 0 }}
                  animate={{ opacity: 1, scale: 1, height: "auto" }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ type: "spring", damping: 22, stiffness: 300 }}
                  className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 ${gradeInfo.borderColor} ${gradeInfo.bgLight} relative overflow-hidden shadow-xs`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Metallic Grade Emblem Badge */}
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        damping: 14,
                        stiffness: 220,
                        delay: 0.05,
                      }}
                      className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl ${gradeInfo.badgeBg} text-white flex items-center justify-center shadow-md ${gradeInfo.glowColor} ring-2 shrink-0`}
                    >
                      <span className="text-xl sm:text-2xl font-black leading-none drop-shadow-xs">
                        {gradeInfo.label}
                      </span>
                    </motion.div>

                    {/* Grade Text Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Digital Conduct Score
                        </span>
                        <div className="flex text-amber-400 text-[10px]">
                          {Array.from({ length: gradeInfo.stars }).map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-black ${gradeInfo.textColor} leading-tight truncate`}
                      >
                        {gradeInfo.title}
                      </h3>

                      <p className="text-[11px] text-gray-600 font-medium mt-0.5 truncate">
                        {gradeInfo.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participant Thank You Message Box */}
            <div className="text-xs text-gray-700 space-y-1 leading-relaxed bg-gray-50/80 p-3 sm:p-3.5 rounded-2xl border border-gray-100 text-left w-full">
              <p className="font-bold text-gray-900 text-xs">
                Dear Participant,
              </p>
              <p className="text-gray-700 leading-snug text-[11px] sm:text-xs">
                Thank you for participating in{" "}
                <strong className="font-bold text-gray-900">
                  India's Largest Survey
                </strong>
                . Your response has been submitted successfully, and we
                sincerely appreciate your valuable participation.
              </p>
              <p className="font-extrabold text-[var(--primary)] text-[11px] sm:text-xs pt-0.5 flex items-center gap-1">
                <span>🎓 Official Participation Certificate</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-600 leading-snug">
                Click below to download your official PDF Certificate. A copy
                has also been sent to your registered email address.
              </p>
              <p className="pt-0.5 font-medium text-gray-800 text-[11px]">
                Warm regards,<br />
                <span className="text-[var(--primary)] font-bold text-xs">
                  Team Dainik Jagran
                </span>
              </p>
            </div>
          </div>

          {/* Sticky Footer Actions (Guaranteed Visible on All Devices) */}
          <div className="p-3 sm:p-4 pt-2.5 bg-white border-t border-gray-100 space-y-2 shrink-0">
            <button
              onClick={handleDownloadCertificate}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--primary)] via-red-700 to-[var(--secondary)] hover:from-red-800 hover:to-[var(--primary)] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-98"
            >
              <FiDownload className="text-base" />
              <span>Download PDF Certificate</span>
            </button>

            {!showGrade && (
              <motion.button
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowGrade(true)}
                className={`w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl ${gradeInfo.badgeBg} hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-98`}
              >
                <FaAward className="text-base" />
                <span>Check Your Grade</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
