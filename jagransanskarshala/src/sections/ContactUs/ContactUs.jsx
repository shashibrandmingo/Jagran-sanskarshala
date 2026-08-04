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
  FaPhone,
  FaChevronDown,
  FaCheckCircle,
  FaExclamationCircle,
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
    mobile: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  // Validation Logic
  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) {
        error = "Full Name is required";
      } else if (value.trim().length < 2) {
        error = "Name must be at least 2 characters";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
        error = "Name should contain only letters";
      }
    } else if (name === "email") {
      if (!value.trim()) {
        error = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = "Please enter a valid email address";
      }
    } else if (name === "mobile") {
      if (!value.trim()) {
        error = "Mobile number is required";
      } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
        error = "Enter a valid 10-digit mobile number (starts 6-9)";
      }
    } else if (name === "subject") {
      if (!value.trim()) {
        error = "Please select a subject";
      }
    } else if (name === "message") {
      if (!value.trim()) {
        error = "Message is required";
      } else if (value.trim().length < 10) {
        error = "Message must be at least 10 characters long";
      }
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sanitize mobile input (digits only, max 10)
    let sanitizedValue = value;
    if (name === "mobile") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (touched[name]) {
      const err = validateField(name, sanitizedValue);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (fieldName) => {
    setFocusedField(null);
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const err = validateField(fieldName, form[fieldName]);
    setErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      mobile: true,
      subject: true,
      message: true,
    });

    if (!validateAll()) {
      return;
    }

    // Save lead into LocalStorage for Admin Panel sync
    try {
      const newLead = {
        _id: `lead_${Date.now()}`,
        leadId: `L-${Math.floor(10000 + Math.random() * 90000)}`,
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        subject: form.subject,
        message: form.message.trim(),
        submittedOn: new Date().toISOString(),
      };

      const existing = JSON.parse(
        localStorage.getItem("jagran_admin_contact_leads") || "[]"
      );
      localStorage.setItem(
        "jagran_admin_contact_leads",
        JSON.stringify([newLead, ...existing])
      );
    } catch (e) {
      console.error("Error saving lead", e);
    }

    setSubmitted(true);
  };

  const handleSendAnother = () => {
    setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  const fieldStyle = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const isFocused = focusedField === fieldName;

    return {
      borderColor: hasError
        ? "#ef4444"
        : isFocused
        ? "var(--primary)"
        : "#e5d9c9",
      background: "#fff",
      color: "var(--heading)",
      boxShadow: hasError
        ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
        : isFocused
        ? "0 0 0 4px rgba(199, 21, 24, 0.08)"
        : "none",
    };
  };

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
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight sm:whitespace-nowrap"
            style={{ color: "var(--heading)" }}
          >
            {c.headingMain || "Get in"}{" "}
            <span style={{ color: "var(--primary)" }}>
              {c.headingHighlight || "Touch"}
            </span>
          </h2>
          <p className="paragraph mt-4">
            {c.subheading ||
              "Have questions or want to partner with Jagran Sanskarshala? Send us a message."}
          </p>
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
                    {c.form?.thankYouTitle || "Thank You!"}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="paragraph max-w-sm mb-8"
                  >
                    {c.form?.thankYouMessage ||
                      "Your message has been successfully received. Our team will get back to you shortly."}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    onClick={handleSendAnother}
                    className="secondary-btn hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  >
                    {c.form?.sendAnotherBtn || "Send Another Message"}
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
                    <h3 className="heading-sm">
                      {c.form?.title || "Send us a Message"}
                    </h3>
                  </div>
                  <p
                    className="small-text mb-8"
                    style={{ color: "var(--paragraph)" }}
                  >
                    {c.form?.subtitle ||
                      "Fill out the form below and our team will get back to you."}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Row 1: Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Name Field */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form?.nameLabel || "Your Name"}{" "}
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
                            onBlur={() => handleBlur("name")}
                            placeholder={
                              c.form?.namePlaceholder || "Enter your name"
                            }
                            className="w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium"
                            style={fieldStyle("name")}
                          />
                          <FaUser
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200"
                            style={{
                              color:
                                touched.name && errors.name
                                  ? "#ef4444"
                                  : focusedField === "name"
                                  ? "var(--primary)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                            <FaExclamationCircle className="shrink-0" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form?.emailLabel || "Email Address"}{" "}
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
                            onBlur={() => handleBlur("email")}
                            placeholder={
                              c.form?.emailPlaceholder || "Enter your email"
                            }
                            className="w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium"
                            style={fieldStyle("email")}
                          />
                          <FaEnvelope
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200"
                            style={{
                              color:
                                touched.email && errors.email
                                  ? "#ef4444"
                                  : focusedField === "email"
                                  ? "var(--primary)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                            <FaExclamationCircle className="shrink-0" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Mobile Number & Subject */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Mobile Number Field (New Input Field) */}
                      <div>
                        <label
                          htmlFor="mobile"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form?.mobileLabel || "Mobile Number"}{" "}
                          <span style={{ color: "var(--primary)" }}>*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            maxLength={10}
                            value={form.mobile}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("mobile")}
                            onBlur={() => handleBlur("mobile")}
                            placeholder={
                              c.form?.mobilePlaceholder ||
                              "Enter 10-digit mobile number"
                            }
                            className="w-full pl-4 pr-10 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium"
                            style={fieldStyle("mobile")}
                          />
                          <FaPhone
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200"
                            style={{
                              color:
                                touched.mobile && errors.mobile
                                  ? "#ef4444"
                                  : focusedField === "mobile"
                                  ? "var(--primary)"
                                  : "var(--secondary)",
                            }}
                          />
                        </div>
                        {touched.mobile && errors.mobile && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                            <FaExclamationCircle className="shrink-0" />
                            {errors.mobile}
                          </p>
                        )}
                      </div>

                      {/* Custom Subject Dropdown */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-semibold mb-2"
                          style={{ color: "var(--heading)" }}
                        >
                          {c.form?.subjectLabel || "Subject"}{" "}
                          <span style={{ color: "var(--primary)" }}>*</span>
                        </label>
                        <div className="relative" ref={subjectDropdownRef}>
                          <button
                            type="button"
                            id="subject"
                            onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                            className="w-full pl-4 pr-10 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 bg-white cursor-pointer"
                            style={{
                              borderColor:
                                touched.subject && errors.subject
                                  ? "#ef4444"
                                  : isSubjectOpen
                                  ? "var(--primary)"
                                  : "#e5d9c9",
                              boxShadow:
                                touched.subject && errors.subject
                                  ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
                                  : isSubjectOpen
                                  ? "0 0 0 4px rgba(199, 21, 24, 0.08)"
                                  : "none",
                            }}
                          >
                            <span
                              className={`truncate text-sm font-semibold ${
                                form.subject ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {form.subject ||
                                c.form?.subjectPlaceholder ||
                                "Select a subject"}
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
                                {(
                                  c.form?.subjectOptions || [
                                    "General Inquiry",
                                    "School Partnership",
                                    "Media & Press",
                                    "Sponsorship",
                                    "Feedback",
                                    "Other",
                                  ]
                                ).map((opt) => {
                                  const isSelected = form.subject === opt;
                                  return (
                                    <div
                                      key={opt}
                                      onClick={() => {
                                        setForm((prev) => ({
                                          ...prev,
                                          subject: opt,
                                        }));
                                        setTouched((prev) => ({
                                          ...prev,
                                          subject: true,
                                        }));
                                        setErrors((prev) => ({
                                          ...prev,
                                          subject: "",
                                        }));
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
                        {touched.subject && errors.subject && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                            <FaExclamationCircle className="shrink-0" />
                            {errors.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Your Message Field */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--heading)" }}
                      >
                        {c.form?.messageLabel || "Your Message"}{" "}
                        <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => handleBlur("message")}
                        placeholder={
                          c.form?.messagePlaceholder || "Type your message here..."
                        }
                        className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium resize-none"
                        style={fieldStyle("message")}
                      />
                      {touched.message && errors.message && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                          <FaExclamationCircle className="shrink-0" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="primary-btn w-full sm:w-auto gap-2 hover:shadow-lg cursor-pointer"
                    >
                      <FaPaperPlane className="w-3.5 h-3.5" />
                      {c.form?.submitBtn || "Send Message"}
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
                  {c.getInTouch?.title || "Get in Touch"}
                </h3>
              </div>
              <p
                className="small-text mb-8"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {c.getInTouch?.subtitle ||
                  "Reach out to us through any of the channels below."}
              </p>

              <div className="space-y-4 flex-1">
                {(
                  c.getInTouch?.items || [
                    {
                      icon: "email",
                      label: "Email Us",
                      value: "sanskarshala@jagran.com",
                    },
                    {
                      icon: "address",
                      label: "Head Office",
                      value:
                        "Jagran Building, 2 Sarvodaya Nagar, Kanpur - 208005",
                    },
                    {
                      icon: "hours",
                      label: "Working Hours",
                      value: "Monday - Saturday: 9:30 AM - 6:30 PM",
                    },
                  ]
                ).map((item, i) => {
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
