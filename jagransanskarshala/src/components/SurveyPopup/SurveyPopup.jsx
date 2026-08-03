"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { FiUser, FiMail, FiSend, FiX, FiCheckCircle, FiArrowUp, FiFileText, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { useSurveyModal } from "@/context/SurveyModalContext";

export default function SurveyPopup() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { openSurveyModal } = useSurveyModal();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const subjectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) {
        setIsSubjectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render floating survey widget at all on admin or survey pages
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/survey"))) {
    return null;
  }

  const survey = t.survey;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = true;
    if (!formData.subject || formData.subject === survey.subjectOptions[0]) newErrors.subject = true;
    if (!formData.message.trim()) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
      // In a real app, you would send formData to API here
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    }, 300);
  };

  if (!survey) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed right-0 top-[70%] sm:top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={openSurveyModal}
          className="bg-[var(--primary)] text-white py-2.5 px-2 sm:py-4 sm:px-3 rounded-l-xl flex flex-col items-center justify-center shadow-lg hover:bg-red-800 transition-colors group cursor-pointer"
          aria-label={survey.title}
        >
          <FiArrowUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 mb-1.5 sm:mb-3 group-hover:-translate-y-1 transition-transform" />
          <span 
            className="font-bold tracking-wider whitespace-nowrap text-xs sm:text-base"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {survey.buttonText}
          </span>
          <FiFileText className="w-3.5 h-3.5 sm:w-5 sm:h-5 mt-2 sm:mt-4" />
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[400px] bg-[var(--background)] rounded-2xl shadow-2xl p-5 sm:p-6 md:p-7 overflow-y-auto max-h-[95vh] mx-auto sm:mx-0 sm:mr-2"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-1"
                aria-label={survey.closeBtn}
              >
                <FiX className="w-5 h-5" />
              </button>

              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[var(--heading)] mb-3">{survey.thankYouTitle}</h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-xs">{survey.thankYouMessage}</p>
                  <button
                    onClick={handleClose}
                    className="primary-btn w-full sm:w-auto text-sm py-2.5 px-6"
                  >
                    {survey.closeBtn}
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--heading)] mb-5 pr-6">{survey.title}</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-[var(--heading)] mb-1.5">
                        {survey.nameLabel} <span className="text-[var(--primary)]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={survey.namePlaceholder}
                          className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors bg-white shadow-sm`}
                        />
                        <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)] w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-[var(--heading)] mb-1.5">
                        {survey.emailLabel} <span className="text-[var(--primary)]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={survey.emailPlaceholder}
                          className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors bg-white shadow-sm`}
                        />
                        <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--secondary)] w-4 h-4" />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-bold text-[var(--heading)] mb-1.5">
                        {survey.subjectLabel} <span className="text-[var(--primary)]">*</span>
                      </label>
                      <div className="relative" ref={subjectRef}>
                        <button
                          type="button"
                          onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                          className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border text-left flex items-center justify-between transition-all bg-white cursor-pointer ${
                            errors.subject
                              ? "border-red-500 bg-red-50/20"
                              : isSubjectOpen
                              ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <span
                            className={`truncate ${
                              formData.subject
                                ? "text-gray-900 font-semibold"
                                : "text-gray-400 font-normal"
                            }`}
                          >
                            {formData.subject || survey.subjectOptions[0]}
                          </span>
                          <FiChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                              isSubjectOpen
                                ? "rotate-180 text-[var(--primary)]"
                                : "text-gray-400"
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isSubjectOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 space-y-0.5"
                            >
                              {survey.subjectOptions.slice(1).map((opt) => {
                                const isSelected = formData.subject === opt;
                                return (
                                  <div
                                    key={opt}
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, subject: opt }));
                                      setIsSubjectOpen(false);
                                      if (errors.subject) {
                                        setErrors((prev) => ({ ...prev, subject: false }));
                                      }
                                    }}
                                    className={`px-3.5 py-2 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-between font-semibold ${
                                      isSelected
                                        ? "bg-red-50 text-[var(--primary)] font-bold"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isSelected && (
                                      <FiCheckCircle className="text-[var(--primary)] text-sm shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-bold text-[var(--heading)] mb-1.5">
                        {survey.messageLabel} <span className="text-[var(--primary)]">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={survey.messagePlaceholder}
                        rows={3}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors bg-white shadow-sm resize-none`}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="bg-[var(--primary)] text-white font-bold py-2.5 px-6 mt-2 rounded-full flex items-center justify-center gap-2 hover:bg-red-800 transition-colors w-full shadow-md shadow-red-500/20 text-sm"
                    >
                      <FiSend className="w-4 h-4" />
                      {survey.submitBtn}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
