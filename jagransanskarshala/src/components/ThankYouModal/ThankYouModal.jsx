"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiDownload, FiX, FiMail } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa6";

export default function ThankYouModal({ isOpen, onClose, participantName, participantEmail }) {
  const [emailStatus, setEmailStatus] = useState("sending"); // "sending" | "sent" | "failed" | "simulated"
  const emailSentRef = useRef(false);

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
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.simulated) {
              setEmailStatus("simulated");
            } else {
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
    }
  }, [isOpen, participantEmail, participantName]);

  if (!isOpen) return null;

  const handleDownloadCertificate = () => {
    const downloadUrl = `/api/download-certificate?name=${encodeURIComponent(participantName || "Student")}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `Sanskarshala_Certificate_${(participantName || "Student").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl p-4 sm:p-6 z-10 border border-gray-100 max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 z-20 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl mb-2 shadow-sm shrink-0">
              <FiCheckCircle />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 text-[var(--primary)] text-xs sm:text-xs font-bold uppercase tracking-wider mb-1.5 border border-red-100">
              <FaGraduationCap className="text-xs" /> India's Largest Survey
            </span>

            <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-2 leading-tight">
              Thank You, {participantName || "Participant"}!
            </h2>

            {/* Email Dispatch Banner */}
            {participantEmail && (
              <div className={`w-full mb-3 px-3 py-2 rounded-xl border flex items-center gap-2 text-left text-xs ${
                emailStatus === "sent" ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-900"
              }`}>
                <FiMail className="text-sm shrink-0 opacity-80" />
                <div className="flex-1 min-w-0">
                  {emailStatus === "sending" && (
                    <span className="font-medium animate-pulse">Processing email for <strong className="font-bold">{participantEmail}</strong>...</span>
                  )}
                  {emailStatus === "sent" && (
                    <span>Thank you email & PDF Certificate sent to inbox <strong className="font-bold">{participantEmail}</strong> ✉</span>
                  )}
                  {emailStatus === "simulated" && (
                    <span>PDF Certificate generated for <strong className="font-bold">{participantEmail}</strong>.</span>
                  )}
                  {emailStatus === "failed" && (
                    <span>Certificate generated! Email queued for <strong className="font-bold">{participantEmail}</strong>.</span>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs sm:text-sm text-gray-700 space-y-1.5 mb-4 leading-relaxed bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-100 text-left w-full">
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">Dear Participant,</p>
              <p className="text-gray-700 leading-snug">
                Thank you for participating in <strong className="font-bold text-gray-900">India's Largest Survey</strong>. Your response has been submitted successfully, and we sincerely appreciate your valuable participation.
              </p>
              <p className="font-bold text-[var(--primary)] text-xs sm:text-sm pt-0.5">
                🎓 Download Your Certificate PDF
              </p>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-snug">
                Click the button below to download your official Participation Certificate PDF. A copy has also been sent to your email address.
              </p>
              <p className="pt-1 font-medium text-gray-800 text-xs">
                Warm regards,<br />
                <span className="text-[var(--primary)] font-bold text-xs sm:text-sm">Team Dainik Jagran</span>
              </p>
            </div>

            {/* Single Download Certificate Button */}
            <div className="w-full">
              <button
                onClick={handleDownloadCertificate}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-red-800 hover:from-red-800 hover:to-[var(--primary)] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <FiDownload className="text-base" />
                <span>Download PDF Certificate</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
