"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ThankYouModal from "@/components/ThankYouModal/ThankYouModal";
import schoolsData from "@/data/schoolsData.json";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiCheckCircle,
  FiLock,
  FiUnlock,
  FiSend,
  FiAlertCircle,
  FiChevronDown,
  FiX,
  FiCheck,
  FiMail,
  FiSearch,
} from "react-icons/fi";
import { FaUserGroup, FaBriefcase } from "react-icons/fa6";

const SUPPORTED_STATES = [
  "Delhi NCR",
  "Uttar Pradesh",
  "Bihar",
  "Jharkhand",
  "Haryana",
  "Uttarakhand",
  "Punjab",
  "Other / अन्य",
];

// Parent Questionnaire (15 Questions)
const QUESTIONS = [
  {
    id: "q1",
    question: "Do you own a mobile phone?",
    options: ["Yes", "No"],
    type: "single",
  },
  {
    id: "q2",
    question: "How many hours a day you spend on your phone?",
    options: ["1-2", "2-4", "more than 4 hrs"],
    type: "single",
  },
  {
    id: "q3",
    question: "What kind of content you consume most on Phones?",
    options: ["Educational", "Entertainment", "Gaming", "Social Media"],
    type: "multiple",
  },
  {
    id: "q4",
    question:
      "I need to reread paragraphs or review information due to distractions from device notification?",
    options: ["Always", "Never", "Often", "Cant Say"],
    type: "single",
  },
  {
    id: "q5",
    question:
      "I get distracted from the main reason I look at my phone and start watching unnecessary content.",
    options: ["Always", "Never", "Often", "Cant say"],
    type: "single",
  },
  {
    id: "q6",
    question:
      "I check my phone in regular intervals even during in-person conversations?",
    options: ["Always", "Never", "Often", "Cant say"],
    type: "single",
  },
  {
    id: "q7",
    question:
      "I find myself scrolling through apps, notifications or digital content even when I am no longer interested or entertained.",
    options: ["Always", "Never", "Often", "Cant say"],
    type: "single",
  },
  {
    id: "q8",
    question:
      "I drop books and movies midway to scroll through content on phone.",
    options: ["Always", "Never", "Often", "Cant say"],
    type: "single",
  },
  {
    id: "q9",
    question: "Returning to original work after phone breaks breaks my focus.",
    options: ["Always", "Never", "Often", "Cant Say"],
    type: "single",
  },
  {
    id: "q10",
    question:
      "Social media makes me compare myself to others and crave for likes and comments for recognition.",
    options: ["Always", "Never", "Often", "Cant Say"],
    type: "single",
  },
  {
    id: "q11",
    question: "Short-form phone content prevents deep understanding.",
    options: ["Agree", "Disagree", "Somewhat", "Cant Say"],
    type: "single",
  },
  {
    id: "q12",
    question:
      "Rate your awareness of how infinite scrolling impacts your time and priorities.",
    options: ["High", "Moderate", "Low"],
    type: "single",
  },
  {
    id: "q13",
    question:
      "Does your attempt to limit usage of mobile phone been successful?",
    options: ["Yes", "No", "To some extent"],
    type: "single",
  },
  {
    id: "q14",
    question:
      "How often does an intentional 'one-minute check' turn into a multi-minute session?",
    options: ["Always", "Never", "Sometime"],
    type: "single",
  },
  {
    id: "q15",
    question: "Which specific feature in your mobile pulls you the most?",
    options: ["Notification", "Social media feeds", "Infinite scrolling"],
    type: "single",
  },
];

// Searchable Select Dropdown — supports inline custom text mode via allowCustom prop
function SearchableSelect({
  label,
  value,
  options = [],
  placeholder,
  onChange,
  error,
  disabled,
  required,
  name,
  showSearch = true,
  allowCustom = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const customInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync customMode if value is set/cleared from outside
  useEffect(() => {
    if (!value) {
      setCustomMode(false);
      setCustomText("");
    }
  }, [value]);

  const getLabel = (opt) => (typeof opt === "object" ? opt.label : opt);
  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);

  // Prepare options with "Other / अन्य" and "Type Here... / यहाँ टाइप करें ✎" at bottom
  const displayOptions = useMemo(() => {
    if (!allowCustom) return options;

    const cleanList = options.filter((opt) => {
      const v = getValue(opt);
      return v !== "Other / अन्य" && v !== "Other" && v !== "__TYPE_HERE__";
    });

    return [
      ...cleanList,
      { value: "Other / अन्य", label: "Other / अन्य" },
      { value: "__TYPE_HERE__", label: "Type Here... / यहाँ टाइप करें ✎" },
    ];
  }, [options, allowCustom]);

  const filteredOptions = displayOptions.filter((opt) =>
    getLabel(opt).toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabel = useMemo(() => {
    if (!value || customMode) return null;
    const found = displayOptions.find((o) => getValue(o) === value);
    return found ? getLabel(found) : value;
  }, [value, customMode, displayOptions]);

  const handleToggle = () => {
    if (disabled || customMode) return;
    setIsOpen((prev) => {
      const nextState = !prev;
      if (nextState && showSearch) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return nextState;
    });
    setQuery("");
  };

  const handleOptionClick = (val) => {
    if (val === "__TYPE_HERE__") {
      setCustomMode(true);
      setCustomText("");
      onChange({ target: { name, value: "Other" } });
      setIsOpen(false);
      setQuery("");
      setTimeout(() => customInputRef.current?.focus(), 80);
    } else if (val === "Other / अन्य" || val === "Other") {
      setCustomMode(false);
      onChange({ target: { name, value: "Other / अन्य" } });
      setIsOpen(false);
      setQuery("");
    } else {
      setCustomMode(false);
      onChange({ target: { name, value: val } });
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleCustomChange = (e) => {
    const text = e.target.value;
    setCustomText(text);
    onChange({ target: { name, value: text ? text : "Other" } });
  };

  const handleBackToSelect = () => {
    setCustomMode(false);
    setCustomText("");
    onChange({ target: { name, value: "" } });
  };

  // ── SINGLE MAIN FIELD CONVERTS TO INPUT ON TYPE HERE ──────────────────────────
  if (customMode && allowCustom) {
    return (
      <div className="relative w-full min-w-0" ref={containerRef}>
        {label && (
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={customInputRef}
            type="text"
            value={customText}
            onChange={handleCustomChange}
            placeholder="Type here... / यहाँ टाइप करें"
            autoComplete="off"
            className={`w-full pl-3.5 pr-10 py-3 text-xs sm:text-sm rounded-xl border font-semibold ${
              error
                ? "border-red-500 bg-red-50/20 ring-1 ring-red-200"
                : customText
                ? "border-emerald-500/80 bg-emerald-50/5"
                : "border-[var(--primary)] ring-2 ring-red-100"
            } focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition bg-white text-gray-900`}
          />
          <button
            type="button"
            onClick={handleBackToSelect}
            title="Back to dropdown list / वापस लिस्ट से चुनें"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="text-base" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <FiAlertCircle /> {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0" ref={containerRef}>
      {label && (
        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Dropdown Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full min-w-0 px-3.5 py-3 text-xs sm:text-sm rounded-xl border text-left flex items-center justify-between gap-2 transition-all bg-white cursor-pointer ${
          error
            ? "border-red-500 bg-red-50/20 ring-1 ring-red-200"
            : isOpen
            ? "border-[var(--primary)] ring-2 ring-red-100"
            : value
            ? "border-emerald-500/80 bg-emerald-50/5"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
      >
        <span className={`flex-1 min-w-0 truncate ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-semibold"}`}>
          {selectedLabel || placeholder}
        </span>
        <FiChevronDown className={`shrink-0 text-gray-400 text-sm sm:text-base transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--primary)]" : ""}`} />
      </button>

      {/* Dropdown Options Popover */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {showSearch && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none bg-gray-50 text-gray-900 font-semibold"
                  />
                </div>
              </div>
            )}
            <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:thin]">
              {filteredOptions.length === 0 ? (
                <div className="px-3.5 py-3 text-xs text-gray-400 text-center">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const val = getValue(opt);
                  const lbl = getLabel(opt);
                  const isSelected = val === value;
                  const isOther = val === "Other / अन्य" || val === "Other";
                  const isTypeHere = val === "__TYPE_HERE__";

                  return (
                    <div
                      key={`${val}-${idx}`}
                      onClick={() => handleOptionClick(val)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between font-semibold ${
                        isSelected
                          ? "bg-red-50 text-[var(--primary)] font-bold"
                          : isTypeHere
                          ? "bg-red-50/60 text-[var(--primary)] hover:bg-red-100/70 font-bold border border-red-100"
                          : isOther
                          ? "text-[var(--primary)] hover:bg-red-50/50 italic font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="truncate">{lbl}</span>
                      {isSelected && <FiCheck className="text-[var(--primary)] text-sm shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <FiAlertCircle /> {error}
        </p>
      )}
    </div>
  );
}

export default function ParentSurveyPage() {
  // Form Fields State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    occupation: "",
    state: "",
    city: "",
  });

  const [errors, setErrors] = useState({});
  const [answers, setAnswers] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [toast, setToast] = useState(null);
  const [dobInputMode, setDobInputMode] = useState("calendar"); // "calendar" | "manual"

  const showToast = (title, message) => {
    setToast({ title, message });
  };

  // Age range helpers for Parents (19+ years old)
  const currentYear = new Date().getFullYear();
  const dobCalMaxYear = currentYear - 19;
  const dobCalMinYear = 1940;
  const dobCalMax = `${dobCalMaxYear}-12-31`;

  // Build ISO dob string from manual day/month/year parts
  const buildDob = (day, month, year) => {
    if (day && month && year && String(year).length === 4) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return "";
  };

  // Available Cities based on selected State
  const availableCities = useMemo(() => {
    if (!form.state) return [];
    const known = schoolsData[form.state] ? Object.keys(schoolsData[form.state]).sort() : [];
    return Array.from(new Set([...known, "Other / अन्य"]));
  }, [form.state]);

  // Handle Form Inputs Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["dobDay", "dobMonth", "dobYear"].includes(name)) {
      setForm((prev) => {
        const updated = { ...prev, [name]: value };
        updated.dob = buildDob(
          name === "dobDay" ? value : prev.dobDay,
          name === "dobMonth" ? value : prev.dobMonth,
          name === "dobYear" ? value : prev.dobYear
        );
        return updated;
      });
    } else {
      setForm((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "state") {
          updated.city = "";
        }
        return updated;
      });
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Validate Profile Form
  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim() || form.firstName.trim().length < 2)
      newErrors.firstName = "Enter valid first name / पहला नाम दर्ज करें";
    if (!form.lastName.trim() || form.lastName.trim().length < 2)
      newErrors.lastName = "Enter valid last name / अंतिम नाम दर्ज करें";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      newErrors.email = "Enter a valid email address / मान्य ईमेल दर्ज करें";
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile.trim()))
      newErrors.mobile = "Enter a valid 10-digit mobile number / 10 अंकों का नंबर दर्ज करें";

    if (!form.dob) {
      newErrors.dob = "Date of birth is required / जन्म तिथि आवश्यक है";
    } else {
      const birthDate = new Date(form.dob);
      if (isNaN(birthDate.getTime())) {
        newErrors.dob = "Enter a valid date / सही तिथि दर्ज करें";
      } else {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 19) {
          newErrors.dob = "Age must be 19 years or above for parents / आयु 19 वर्ष या अधिक होनी चाहिए";
        }
      }
    }

    if (!form.gender) newErrors.gender = "Please select gender / लिंग चुनें";
    if (!form.occupation) newErrors.occupation = "Please select occupation / व्यवसाय चुनें";
    if (!form.state) newErrors.state = "Please select state / राज्य चुनें";
    if (!form.city) newErrors.city = "Please select city / शहर चुनें";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    if (!form.firstName.trim() || form.firstName.trim().length < 2) return false;
    if (!form.lastName.trim() || form.lastName.trim().length < 2) return false;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false;
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile.trim())) return false;
    if (!form.dob) return false;

    const birthDate = new Date(form.dob);
    if (isNaN(birthDate.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 19) return false;

    if (!form.gender) return false;
    if (!form.occupation) return false;
    if (!form.state || !form.city) return false;

    return true;
  }, [form]);

  // Handle Questionnaire Option Selection
  const handleSelectOption = (questionId, option, type) => {
    if (type === "single") {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
    } else if (type === "multiple") {
      setAnswers((prev) => {
        const current = prev[questionId] || [];
        if (current.includes(option)) {
          return {
            ...prev,
            [questionId]: current.filter((item) => item !== option),
          };
        } else {
          return { ...prev, [questionId]: [...current, option] };
        }
      });
    }
  };

  // Questionnaire Completion Check
  const firstUnansweredQuestion = useMemo(() => {
    for (let q of QUESTIONS) {
      const ans = answers[q.id];
      if (q.type === "single" && !ans) return q;
      if (q.type === "multiple" && (!Array.isArray(ans) || ans.length === 0)) return q;
    }
    return null;
  }, [answers]);

  const isQuestionnaireComplete = !firstUnansweredQuestion;

  // Combined Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast(
        "अपूर्ण जानकारी (Incomplete Form)",
        "कृपया फॉर्म में सभी आवश्यक जानकारी सही-सही भरें।"
      );
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    if (firstUnansweredQuestion) {
      const qNum = QUESTIONS.findIndex((q) => q.id === firstUnansweredQuestion.id) + 1;
      showToast(
        `प्रश्न संख्या ${qNum} का उत्तर दें`,
        `"${firstUnansweredQuestion.question}"`
      );
      const qElement = document.getElementById(`question-${firstUnansweredQuestion.id}`);
      if (qElement) {
        qElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!agreed) {
      showToast(
        "पुष्टि आवश्यक (Confirmation Required)",
        "कृपया नीचे दिए गए पुष्टि (Confirmation) बॉक्स पर टिक करें।"
      );
      const checkboxEl = document.getElementById("agree-checkbox");
      if (checkboxEl) {
        checkboxEl.focus();
        checkboxEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Call Backend API to Save in MongoDB
    fetch("http://localhost:8000/api/v1/survey/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "Parent",
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        dob: form.dob,
        gender: form.gender,
        occupation: form.occupation || "Parent",
        studentClass: "-",
        state: form.state,
        city: form.city,
        school: "-",
        answers,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "DUPLICATE_MOBILE") {
            setErrors((prev) => ({
              ...prev,
              mobile: "इस मोबाइल नंबर से पहले ही अभिभावक फॉर्म जमा किया जा चुका है।",
            }));
            showToast(
              "पहले ही जमा किया जा चुका है (Already Submitted)",
              `मोबाइल नंबर (${form.mobile.trim()}) से अभिभावक सर्वेक्षण पहले ही जमा किया जा चुका है। एक मोबाइल नंबर से केवल 1 अभिभावक सर्वेक्षण जमा किया जा सकता है।`
            );
            window.scrollTo({ top: 200, behavior: "smooth" });
          } else {
            showToast("त्रुटि (Error)", data.message || "सबमिशन में समस्या आई।");
          }
          return;
        }

        // On Success — display thank you modal with certificate
        setSubmittedName(`${form.firstName.trim()} ${form.lastName.trim()}`);
        setSubmittedEmail(form.email.trim());
        setIsThankYouOpen(true);

        // Reset Form & Answers
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          dob: "",
          dobDay: "",
          dobMonth: "",
          dobYear: "",
          gender: "",
          occupation: "",
          state: "",
          city: "",
        });
        setAnswers({});
        setAgreed(false);
        setErrors({});
      })
      .catch((err) => {
        console.error("Parent survey submit network error:", err);
        showToast("नेटवर्क त्रुटि (Network Error)", "कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।");
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 bg-gradient-to-r from-[var(--primary)] via-[#a01013] to-[var(--secondary)] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-md">
            <FaUserGroup className="text-lg" /> Parent & Guardian Conduct Survey 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            Jagran Sanskarshala Parent Survey
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto mt-3 font-medium">
            Please fill out your profile details first to unlock the national digital habits questionnaire.
          </p>
        </motion.div>

        {/* SECTION 1: Parent Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 mb-10"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Parent Profile Information / अभिभावक विवरण
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Fill all mandatory fields marked with (<span className="text-red-500">*</span>)
              </p>
            </div>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0 max-w-full">
            {/* Row 1: First Name | Last Name */}
            <div className="w-full min-w-0">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                First Name / पहला नाम <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full min-w-0">
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={`w-full min-w-0 pl-3.5 pr-10 py-3 text-xs sm:text-sm rounded-xl border ${
                    errors.firstName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  } focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition bg-white`}
                />
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.firstName}</p>
              )}
            </div>

            <div className="w-full min-w-0">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                Last Name / अंतिम नाम <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full min-w-0">
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className={`w-full min-w-0 pl-3.5 pr-10 py-3 text-xs sm:text-sm rounded-xl border ${
                    errors.lastName ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  } focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition bg-white`}
                />
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.lastName}</p>
              )}
            </div>

            {/* Row 2: Email | Mobile */}
            <div className="w-full min-w-0">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                Email Address / ईमेल पता <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full min-w-0">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full min-w-0 pl-3.5 pr-10 py-3 text-xs sm:text-sm rounded-xl border ${
                    errors.email ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  } focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition bg-white`}
                />
                <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.email}</p>
              )}
            </div>

            <div className="w-full min-w-0">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                Mobile Number / मोबाइल नंबर <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    handleChange({ target: { name: "mobile", value: onlyNums } });
                  }}
                  placeholder="10-digit mobile number"
                  className={`w-full pl-3.5 pr-10 py-3 text-xs sm:text-sm rounded-xl border ${
                    errors.mobile ? "border-red-500 bg-red-50/20" : "border-gray-300"
                  } focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition bg-white`}
                />
                <FiPhone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.mobile && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle /> {errors.mobile}</p>
              )}
            </div>

            {/* Row 3: Date of Birth | Occupation */}
            <div className="w-full min-w-0">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FiCalendar className="text-[var(--primary)] text-sm" />
                Date of Birth / जन्म तिथि <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  max={dobCalMax}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border font-semibold text-gray-900 cursor-pointer transition-all outline-none bg-white
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:opacity-80
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${
                    errors.dob
                      ? "border-red-500 ring-1 ring-red-200 bg-red-50/10"
                      : form.dob && !errors.dob
                      ? "border-emerald-500/80 ring-1 ring-emerald-100 bg-emerald-50/10"
                      : "border-gray-300 hover:border-gray-400 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
              </div>

              {form.dob ? (
                <p className="text-[11px] font-semibold mt-1 flex items-center gap-1">
                  {(() => {
                    const bd = new Date(form.dob);
                    const today = new Date();
                    let age = today.getFullYear() - bd.getFullYear();
                    const m = today.getMonth() - bd.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
                    const isValid = !isNaN(age) && age >= 19;
                    return (
                      <span className={isValid ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                        Age: {age} years {isValid ? "✓" : "(Must be 19+ years)"}
                      </span>
                    );
                  })()}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <FiCalendar className="shrink-0" /> Type directly or tap calendar picker (Age 19+ years)
                </p>
              )}

              {errors.dob && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <FiAlertCircle /> {errors.dob}
                </p>
              )}
            </div>

            {/* Gender / लिंग Dropdown */}
            <SearchableSelect
              label="Gender / लिंग"
              name="gender"
              value={form.gender}
              options={[
                { value: "Male", label: "Male / पुरुष" },
                { value: "Female", label: "Female / महिला" },
                { value: "Other", label: "Other / अन्य" },
              ]}
              placeholder="Select Gender / लिंग चुनें"
              onChange={handleChange}
              error={errors.gender}
              required
            />

            {/* Occupation (Student option REMOVED) */}
            <SearchableSelect
              label="Occupation / व्यवसाय"
              name="occupation"
              value={form.occupation}
              options={[
                { value: "Service", label: "Service / नौकरी" },
                { value: "Housemaker", label: "Housemaker / गृहणी" },
                { value: "Business", label: "Business / व्यापार" },
                { value: "Professional", label: "Professional / पेशेवर" },
                { value: "Other", label: "Other / अन्य" },
              ]}
              placeholder="Select Occupation / व्यवसाय चुनें"
              onChange={handleChange}
              error={errors.occupation}
              required
            />

            {/* Row 4: State | City — allowCustom enables in-place text input on Other */}
            <SearchableSelect
              label="State / राज्य"
              name="state"
              value={form.state}
              options={SUPPORTED_STATES}
              placeholder="Select State / राज्य चुनें"
              onChange={handleChange}
              error={errors.state}
              required
              allowCustom
            />

            <SearchableSelect
              label="City / शहर"
              name="city"
              value={form.city}
              options={availableCities}
              placeholder={
                form.state
                  ? "Select City / शहर चुनें"
                  : "Select State First / पहले राज्य चुनें"
              }
              onChange={handleChange}
              error={errors.city}
              disabled={!form.state}
              required
              allowCustom
            />
          </form>
        </motion.div>

        {/* SECTION 2: Questionnaire (Locked until Form is valid) */}
        <div className="relative">
          {!isFormValid && (
            <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/70 rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-red-200">
              <div className="w-16 h-16 rounded-full bg-red-100 text-[var(--primary)] flex items-center justify-center text-3xl mb-4 shadow-md animate-pulse">
                <FiLock />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Questionnaire Section Locked
              </h3>
              <p className="text-sm text-gray-600 max-w-md font-medium">
                कृपया प्रश्नावली अनलॉक करने के लिए ऊपर दिए गए अभिभावक विवरण फॉर्म को पूरा भरें।
              </p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-100 transition-all ${
              !isFormValid ? "opacity-40 pointer-events-none filter blur-[1px]" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
                  2
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Parent Conduct Questionnaire / प्रश्नावली
                  </h2>
                  <p className="text-xs text-gray-500">
                    Select your honest choices for all questions below
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                <FiUnlock className="text-xs" /> Form Validated
              </div>
            </div>

            <div className="space-y-3.5">
              {QUESTIONS.map((q, idx) => {
                const currentAns = answers[q.id];
                return (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 hover:bg-gray-50 transition-colors border border-gray-100/80"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-start gap-2 leading-snug">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-[var(--primary)] text-[11px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q.question}</span>
                    </h3>

                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {q.options.map((opt) => {
                        const isSelected =
                          q.type === "single"
                            ? currentAns === opt
                            : Array.isArray(currentAns) && currentAns.includes(opt);

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt, q.type)}
                            className={`py-1.5 px-3.5 sm:py-2 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm shadow-red-500/20 scale-[1.01]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:bg-red-50/30"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                                isSelected
                                  ? "border-white bg-white text-[var(--primary)] font-black"
                                  : "border-gray-400"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* SECTION 3: Confirmation Agreement & Submission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-br from-white via-red-50/20 to-orange-50/30 rounded-3xl p-4 sm:p-6 shadow-xl border border-red-100 text-center"
        >
          <div className="p-3 sm:p-4 bg-white/90 rounded-2xl border border-gray-200/80 mb-4 max-w-2xl mx-auto shadow-sm text-left">
            <label className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-[var(--primary)] text-[var(--primary)] focus:ring-[var(--primary)] mt-0.5 shrink-0 cursor-pointer"
              />
              <span className="leading-snug">
                I voluntarily consent to participate in this survey. I understand that the information provided will be kept confidential and used only for the stated purpose. / मैं स्वेच्छा से इस सर्वे में भाग लेने की सहमति देता/देती हूँ। मैं समझता/समझती हूँ कि प्रदान की गई जानकारी गोपनीय रखी जाएगी और केवल निर्दिष्ट उद्देश्य के लिए उपयोग की जाएगी।
              </span>
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] via-red-700 to-[var(--secondary)] hover:from-red-800 hover:to-[var(--primary)] text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <FiSend className="text-lg" />
              <span>Submit Survey Response</span>
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-gray-900/95 text-white p-4 rounded-2xl shadow-2xl border border-red-500/40 flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl shrink-0 mt-0.5 border border-red-500/30">
              <FiAlertCircle />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-300 mt-1 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white transition-colors p-1 shrink-0 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
        participantName={submittedName}
        participantEmail={submittedEmail}
      />
    </div>
  );
}
