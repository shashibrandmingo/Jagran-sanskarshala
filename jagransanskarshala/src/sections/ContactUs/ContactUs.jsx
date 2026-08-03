"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaUser,
  FaChevronDown,
  FaCheckCircle,
} from "react-icons/fa";

// Maps each translation-driven icon key to its FontAwesome component
const ICON_MAP = {
  email: FaEnvelope,
  address: FaMapMarkerAlt,
  hours: FaClock,
};

export default function ContactUs() {
  const { t } = useLanguage();
  const c = t.contactUs || t.contact || {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const subjectDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(e.target)
      ) {
        setIsSubjectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submission logic to be wired up later
    setSubmitted(true);
  };

  const handleSendAnother = () => {
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitted(false);
  };

  const fieldStyle = (fieldName) => ({
    borderColor: focusedField === fieldName ? "var(--primary)" : "#e5d9c9",
    background: "#fff",
    color: "var(--heading)",
    boxShadow:
      focusedField === fieldName ? "0 0 0 4px rgba(199, 21, 24, 0.08)" : "none",
  });

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-16 md:py-20 lg:py-24"
      style={{ background: "var(--background)" }}
    >
      <div className="container relative z-10">
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 px-2"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight sm:whitespace-nowrap" style={{ color: "var(--heading)" }}>
            {c.headingMain}{" "}
            <span style={{ color: "var(--primary)" }}>
              {c.headingHighlight}
            </span>
          </h2>
          <p className="paragraph mt-4">{c.subheading}</p>
        </motion.div>

        {/* ── Grid: Form + Get in Touch ── */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* ── LEFT: Form Card ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-3 card p-6 sm:p-8 lg:p-10 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="thankyou"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center text-center min-h-[420px] py-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.15,
                      type: "spring",
                      stiffness: 220,
                      damping: 14,
                    }}
                    className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
                    style={{ background: "var(--background)" }}
                  >
                    <FaCheckCircle
                      className="w-10 h-10"
                      style={{ color: "var(--primary)" }}
                    />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="heading-sm mb-2"
                  >
                    {c.form.thankYouTitle}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="paragraph max-w-sm mb-8"
                  >
                    {c.form.thankYouMessage}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    onClick={handleSendAnother}
                    className="secondary-btn hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {c.form.sendAnotherBtn}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <motion.span
                      whileHover={{ rotate: -8, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex items-center justify-center w-11 h-11 rounded-full shrink-0"
                      style={{ background: "var(--background)" }}
                    >
                      <FaEnvelope
                        className="w-4.5 h-4.5"
                        style={{ color: "var(--primary)" }}
                      />
                    </motion.span>
                    <h3 className="heading-sm">{c.form.title}</h3>
                  </div>
                  <p
                    className="small-text mb-8"
                    style={{ color: "var(--paragraph)" }}
                  >
                    {c.form.subtitle}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form.nameLabel}{" "}
                          <span style={{ color: "var(--primary)" }}>*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            placeholder={c.form.namePlaceholder}
                            required
                            className="w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-default text-sm"
                            style={fieldStyle("name")}
                          />
                          <FaUser
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-default"
                            style={{
                              color:
                                focusedField === "name"
                                  ? "var(--primary)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form.emailLabel}{" "}
                          <span style={{ color: "var(--primary)" }}>*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            placeholder={c.form.emailPlaceholder}
                            required
                            className="w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-default text-sm"
                            style={fieldStyle("email")}
                          />
                          <FaEnvelope
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-default"
                            style={{
                              color:
                                focusedField === "email"
                                  ? "var(--primary)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom Subject Dropdown */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--heading)" }}
                      >
                        {c.form.subjectLabel}{" "}
                        <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <div className="relative" ref={subjectDropdownRef}>
                        <button
                          type="button"
                          id="subject"
                          onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                          className="w-full pl-4 pr-10 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 bg-white cursor-pointer"
                          style={{
                            borderColor: isSubjectOpen
                              ? "var(--primary)"
                              : "#e5d9c9",
                            boxShadow: isSubjectOpen
                              ? "0 0 0 4px rgba(199, 21, 24, 0.08)"
                              : "none",
                          }}
                        >
                          <span
                            className={`truncate text-sm font-semibold ${
                              form.subject ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {form.subject || c.form.subjectPlaceholder}
                          </span>
                          <FaChevronDown
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
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
                              className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 space-y-0.5"
                            >
                              {c.form.subjectOptions.map((opt) => {
                                const isSelected = form.subject === opt;
                                return (
                                  <div
                                    key={opt}
                                    onClick={() => {
                                      setForm((prev) => ({ ...prev, subject: opt }));
                                      setIsSubjectOpen(false);
                                    }}
                                    className={`px-3.5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-between font-semibold ${
                                      isSelected
                                        ? "bg-red-50 text-[var(--primary)] font-bold"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isSelected && (
                                      <FaCheckCircle className="text-[var(--primary)] text-sm shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--heading)" }}
                      >
                        {c.form.messageLabel}{" "}
                        <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        placeholder={c.form.messagePlaceholder}
                        required
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-default text-sm resize-none"
                        style={fieldStyle("message")}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="primary-btn w-full sm:w-auto gap-2 hover:shadow-lg"
                    >
                      <FaPaperPlane className="w-3.5 h-3.5" />
                      {c.form.submitBtn}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Get in Touch Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="lg:col-span-2 rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col relative overflow-hidden"
            style={{
              background: "var(--primary)",
            }}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-1">
                <motion.span
                  whileHover={{ rotate: 15, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 bg-white/15"
                >
                  <FaPaperPlane
                    className="w-4 h-4 -rotate-45"
                    style={{ color: "#ffffff" }}
                  />
                </motion.span>
                <h3 className="heading-sm" style={{ color: "#ffffff" }}>
                  {c.getInTouch.title}
                </h3>
              </div>
              <p
                className="small-text mb-8"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {c.getInTouch.subtitle}
              </p>

              <div className="space-y-4 flex-1">
                {c.getInTouch.items.map((item, i) => {
                  const Icon = ICON_MAP[item.icon] || FaEnvelope;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 4 }}
                      transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                      className="flex items-start gap-4 rounded-xl p-4 bg-white/10 backdrop-blur-sm transition-default hover:bg-white/15 cursor-default"
                    >
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                        style={{ background: "var(--secondary)" }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: "#ffffff" }}
                        />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm mb-0.5"
                          style={{ color: "#ffffff" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-sm leading-relaxed whitespace-pre-line break-words"
                          style={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {item.value}
                        </p>
                        {item.note && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            {item.note}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
