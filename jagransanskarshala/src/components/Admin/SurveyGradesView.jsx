"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FaGraduationCap,
  FaAward,
  FaCrown,
  FaStar,
  FaEye,
  FaFileExport,
  FaMagnifyingGlass,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaUserGroup,
  FaTableCells,
  FaXmark,
  FaFilter,
  FaRotateLeft,
  FaListCheck,
  FaCalendarDays,
  FaCheckDouble,
} from "react-icons/fa6";
import * as XLSX from "xlsx";
import schoolsData from "@/data/schoolsData.json";
import { QUESTIONS } from "@/services/surveyQuestions";

// Helper for date comparison & formatting
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const datePresets = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "all", label: "All Time" },
];

export default function SurveyGradesView({ liveSurveys = [] }) {
  // Tab Filter: 'all' | 'parent' | 'student'
  const [tabFilter, setTabFilter] = useState("all");

  // Secondary Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all"); // 'all' | 'A++' | 'A+' | 'A'
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("30days");
  const [dateRangeLabel, setDateRangeLabel] = useState("Last 30 days");

  // Dropdown Open State: 'none' | 'date' | 'state' | 'city' | 'school' | 'grade' | 'entries'
  const [openDropdown, setOpenDropdown] = useState("none");

  // Selected Checkboxes & Detail Modal State
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Pagination State (Show 10, 25, 50, 100 entries)
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-dropdown-container")) {
        setOpenDropdown("none");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset pagination to Page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    tabFilter,
    gradeFilter,
    stateFilter,
    cityFilter,
    schoolFilter,
    datePreset,
    itemsPerPage,
  ]);

  // Dynamic States
  const stateOptions = useMemo(() => {
    const knownStates = Object.keys(schoolsData || {}).sort();
    const customStates = new Set();
    liveSurveys.forEach((s) => {
      if (s.state && !schoolsData[s.state] && s.state !== "Other") {
        customStates.add(s.state);
      }
    });

    return [
      { value: "all", label: "All States" },
      ...knownStates.map((st) => ({ value: st, label: st })),
      { value: "Other", label: "Other / Custom" },
      ...Array.from(customStates)
        .sort()
        .map((st) => ({ value: st, label: st })),
    ];
  }, [liveSurveys]);

  // Dynamic Cities
  const cityOptions = useMemo(() => {
    if (!stateFilter || stateFilter === "all") {
      return [{ value: "all", label: "Select State First" }];
    }
    if (stateFilter === "Other") {
      const customCities = new Set();
      liveSurveys.forEach((s) => {
        if (s.city) customCities.add(s.city);
      });
      return [
        { value: "all", label: "All Cities" },
        ...Array.from(customCities)
          .sort()
          .map((c) => ({ value: c, label: c })),
      ];
    }
    const stateObj = schoolsData[stateFilter];
    const cities = stateObj ? Object.keys(stateObj).sort() : [];
    return [
      { value: "all", label: "All Cities" },
      ...cities.map((c) => ({ value: c, label: c })),
    ];
  }, [stateFilter, liveSurveys]);

  // Dynamic Schools
  const schoolOptions = useMemo(() => {
    if (!stateFilter || stateFilter === "all") {
      return [{ value: "all", label: "Select State & City First" }];
    }
    if (!cityFilter || cityFilter === "all") {
      return [{ value: "all", label: "Select City First" }];
    }
    if (stateFilter === "Other" || cityFilter === "Other") {
      const customSchools = new Set();
      liveSurveys.forEach((s) => {
        if (s.school) customSchools.add(s.school);
      });
      return [
        { value: "all", label: "All Schools" },
        ...Array.from(customSchools)
          .sort()
          .map((sch) => ({ value: sch, label: sch })),
      ];
    }
    const schools = schoolsData[stateFilter]?.[cityFilter] || [];
    return [
      { value: "all", label: "All Schools" },
      ...schools.map((sch) => ({ value: sch, label: sch })),
    ];
  }, [stateFilter, cityFilter, liveSurveys]);

  // Filtered Dataset
  const filteredData = useMemo(() => {
    return liveSurveys.filter((item) => {
      if (!item) return false;

      // Tab Filter: Parent / Student / All
      const itemType = String(item.type || "").toLowerCase();
      if (tabFilter === "parent" && itemType !== "parent") return false;
      if (tabFilter === "student" && itemType !== "student") return false;

      // Grade Filter
      if (gradeFilter !== "all") {
        const itemGrade = item.grade || "A";
        if (itemGrade !== gradeFilter) return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        const fieldsToSearch = [
          item.id,
          item._id,
          item.firstName,
          item.lastName,
          `${item.firstName || ""} ${item.lastName || ""}`,
          item.email,
          item.mobile,
          item.grade,
          item.type,
          item.school,
          item.city,
          item.state,
          item.submittedOn,
        ];
        const matches = fieldsToSearch.some(
          (val) => val && String(val).toLowerCase().includes(q)
        );
        if (!matches) return false;
      }

      // Location Filters
      if (stateFilter !== "all" && item.state !== stateFilter) return false;
      if (cityFilter !== "all" && item.city !== cityFilter) return false;
      if (schoolFilter !== "all" && item.school !== schoolFilter) return false;

      // Date Range Filter
      const rawDate = item.submittedOn || item.createdAt;
      if (rawDate && datePreset !== "all") {
        const dateStr =
          typeof rawDate === "string" ? rawDate.replace(",", "") : rawDate;
        const itemDate = new Date(dateStr);
        if (!isNaN(itemDate.getTime())) {
          const now = new Date();
          if (datePreset === "today" && !isSameDay(itemDate, now)) return false;
          if (datePreset === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (!isSameDay(itemDate, yesterday)) return false;
          }
          if (datePreset === "7days") {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) return false;
          }
          if (datePreset === "30days") {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            if (itemDate < start) return false;
          }
        }
      }

      return true;
    });
  }, [
    liveSurveys,
    tabFilter,
    gradeFilter,
    searchQuery,
    stateFilter,
    cityFilter,
    schoolFilter,
    datePreset,
  ]);

  // Summary Counts
  const gradeCounts = useMemo(() => {
    let total = liveSurveys.length;
    let countA2 = 0;
    let countA1 = 0;
    let countA0 = 0;

    liveSurveys.forEach((item) => {
      const g = item.grade || "A";
      if (g === "A++") countA2++;
      else if (g === "A+") countA1++;
      else countA0++;
    });

    return { total, countA2, countA1, countA0 };
  }, [liveSurveys]);

  // Pagination Calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const startItemDisplay = totalItems === 0 ? 0 : startIndex + 1;
  const endItemDisplay = endIndex;

  const getRowId = (row) => row._id || row.id;

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(getRowId(row)));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedData.map((row) => getRowId(row));
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedData.map((row) => getRowId(row)));
      setSelectedRows((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export to Excel
  const handleExport = () => {
    let dataToExport = [];
    if (selectedRows.length > 0) {
      dataToExport = filteredData.filter((row) =>
        selectedRows.includes(getRowId(row))
      );
    } else {
      dataToExport = filteredData;
    }

    if (dataToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const excelRows = dataToExport.map((item, idx) => {
      const row = {
        "S.No": idx + 1,
        "ID": item.id || "-",
        "Grade": item.grade || "A",
        "Type": item.type || "-",
        "First Name": item.firstName || "-",
        "Last Name": item.lastName || "-",
        "Email": item.email || "-",
        "Mobile": item.mobile || "-",
        "DOB": item.dob || "-",
        "Gender": item.gender || "-",
        "Occupation": item.occupation || "-",
        "Class": item.studentClass || "-",
        "State": item.state || "-",
        "City": item.city || "-",
        "School": item.school || "-",
        "Submitted On": item.submittedOn || "-",
      };

      // Add all 15 Question Answers to Excel columns
      QUESTIONS.forEach((q, qIdx) => {
        const userAns = item.answers ? item.answers[q.id] : null;
        row[`Q${qIdx + 1}: ${q.question}`] = Array.isArray(userAns)
          ? userAns.join(", ")
          : userAns || "-";
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses & Grades");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Jagran_Sanskarshala_Grades_Report_${dateStr}.xlsx`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setGradeFilter("all");
    setStateFilter("all");
    setCityFilter("all");
    setSchoolFilter("all");
    setDatePreset("30days");
    setDateRangeLabel("Last 30 days");
    setOpenDropdown("none");
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/80 space-y-6">
      {/* Top Sub-Tabs: All Data / Parent Data / Student Data */}
        <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
          <button
            onClick={() => setTabFilter("all")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "all"
                ? "text-[var(--primary)]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>All Data ({gradeCounts.total})</span>
            {tabFilter === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>

          <button
            onClick={() => setTabFilter("parent")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "parent"
                ? "text-[var(--primary)]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Parent Data</span>
            {tabFilter === "parent" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>

          <button
            onClick={() => setTabFilter("student")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "student"
                ? "text-[var(--primary)]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Student Data</span>
            {tabFilter === "student" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Submissions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-[var(--primary)] flex items-center justify-center shrink-0">
              <FaTableCells className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Total Submissions</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {gradeCounts.total.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 2: Grade A++ Submissions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 font-black text-lg">
              A++
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Grade A++ (Top Conduct)</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {gradeCounts.countA2.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 3: Grade A+ Submissions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 font-black text-lg">
              A+
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800">Grade A+ (High Conduct)</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {gradeCounts.countA1.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 4: Grade A Submissions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 font-black text-lg">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">Grade A (Good Conduct)</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                {gradeCounts.countA0.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Date Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "date" ? "none" : "date")
              }
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FaCalendarDays className="text-gray-400" />
              <span>{dateRangeLabel}</span>
              <FaChevronDown className="text-[10px] text-gray-400" />
            </button>

            {openDropdown === "date" && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5">
                {datePresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDatePreset(p.id);
                      setDateRangeLabel(p.label);
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      datePreset === p.id
                        ? "text-[var(--primary)] font-bold bg-red-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{p.label}</span>
                    {datePreset === p.id && <FaCheck className="text-xs" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grade Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "grade" ? "none" : "grade")
              }
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FaAward className="text-gray-400" />
              <span>
                {gradeFilter === "all" ? "All Grades" : `Grade ${gradeFilter}`}
              </span>
              <FaChevronDown className="text-[10px] text-gray-400" />
            </button>

            {openDropdown === "grade" && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5">
                {[
                  { value: "all", label: "All Grades" },
                  { value: "A++", label: "Grade A++" },
                  { value: "A+", label: "Grade A+" },
                  { value: "A", label: "Grade A" },
                ].map((g) => (
                  <button
                    key={g.value}
                    onClick={() => {
                      setGradeFilter(g.value);
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      gradeFilter === g.value
                        ? "text-[var(--primary)] font-bold bg-red-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{g.label}</span>
                    {gradeFilter === g.value && <FaCheck className="text-xs" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "state" ? "none" : "state")
              }
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer max-w-[160px] truncate"
            >
              <span className="truncate">
                {stateFilter === "all" ? "All States" : stateFilter}
              </span>
              <FaChevronDown className="text-[10px] text-gray-400 shrink-0" />
            </button>

            {openDropdown === "state" && (
              <div className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5 [scrollbar-width:thin]">
                {stateOptions.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => {
                      setStateFilter(st.value);
                      setCityFilter("all");
                      setSchoolFilter("all");
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      stateFilter === st.value
                        ? "text-[var(--primary)] font-bold bg-red-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                    {stateFilter === st.value && (
                      <FaCheck className="text-xs shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "city" ? "none" : "city")
              }
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer max-w-[160px] truncate"
            >
              <span className="truncate">
                {cityFilter === "all" ? "Select City" : cityFilter}
              </span>
              <FaChevronDown className="text-[10px] text-gray-400 shrink-0" />
            </button>

            {openDropdown === "city" && (
              <div className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5 [scrollbar-width:thin]">
                {cityOptions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setCityFilter(c.value);
                      setSchoolFilter("all");
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      cityFilter === c.value
                        ? "text-[var(--primary)] font-bold bg-red-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {cityFilter === c.value && (
                      <FaCheck className="text-xs shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* School Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "school" ? "none" : "school")
              }
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer max-w-[180px] truncate"
            >
              <span className="truncate">
                {schoolFilter === "all" ? "Select School" : schoolFilter}
              </span>
              <FaChevronDown className="text-[10px] text-gray-400 shrink-0" />
            </button>

            {openDropdown === "school" && (
              <div className="absolute top-full left-0 mt-1.5 w-64 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5 [scrollbar-width:thin]">
                {schoolOptions.map((sch) => (
                  <button
                    key={sch.value}
                    onClick={() => {
                      setSchoolFilter(sch.value);
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      schoolFilter === sch.value
                        ? "text-[var(--primary)] font-bold bg-red-50/50"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{sch.label}</span>
                    {schoolFilter === sch.value && (
                      <FaCheck className="text-xs shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="px-3.5 py-2.5 rounded-2xl border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <FaRotateLeft className="text-xs" />
            <span>Reset</span>
          </button>
        </div>

        {/* Global Search Input & Show Entries Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Global Search Input */}
          <div className="relative w-full sm:w-96">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (ID, Name, Mobile, Email, Grade, School...)"
              className="w-full pl-9 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-colors shadow-2xs"
            />
          </div>

          {/* Show Entries Dropdown (Matching Screenshot 2) */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 self-end sm:self-auto">
            <span>Show</span>
            <div className="relative custom-dropdown-container">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "entries" ? "none" : "entries"
                  )
                }
                className="px-3 py-1 bg-white border border-red-500/80 rounded-full font-extrabold text-gray-900 flex items-center gap-1.5 shadow-xs hover:border-red-600 transition-colors cursor-pointer"
              >
                <span>{itemsPerPage}</span>
                <FaChevronDown className="text-[10px] text-gray-500" />
              </button>

              {openDropdown === "entries" && (
                <div className="absolute top-full right-0 mt-1.5 w-24 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5">
                  {[10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setOpenDropdown("none");
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-bold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                        itemsPerPage === num
                          ? "text-[var(--primary)] font-extrabold bg-red-50/50"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{num}</span>
                      {itemsPerPage === num && (
                        <FaCheck className="text-xs text-[var(--primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span>entries</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200/80 shadow-2xs [scrollbar-width:thin]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/90 text-gray-700 font-extrabold uppercase border-b border-gray-200/80 tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">ID / ID</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">GRADE / ग्रेड</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">FIRST NAME / नाम</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">LAST NAME / उपनाम</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">EMAIL / ईमेल</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">MOBILE / मोबाइल</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">TYPE / प्रकार</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">SCHOOL / CLASS</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">CITY / STATE</th>
                <th className="py-3.5 px-4 font-extrabold whitespace-nowrap">SUBMITTED / तारीख</th>
                <th className="py-3.5 px-4 font-extrabold text-center whitespace-nowrap">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="p-8 text-center text-gray-400 font-bold"
                  >
                    No survey grade submissions found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const rowId = getRowId(row);
                  const isChecked = selectedRows.includes(rowId);
                  const rowGrade = row.grade || "A";

                  return (
                    <tr
                      key={rowId}
                      className={`hover:bg-red-50/20 transition-colors ${
                        isChecked ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(rowId)}
                          className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono text-gray-500 font-bold whitespace-nowrap">
                        {row.id || String(row._id).substring(18, 24)}
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-black text-xs text-white shadow-2xs ${
                            rowGrade === "A++"
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20"
                              : rowGrade === "A+"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"
                              : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20"
                          }`}
                        >
                          {rowGrade}
                        </span>
                      </td>

                      {/* First & Last Name */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {row.firstName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{row.lastName}</td>

                      {/* Email & Mobile */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{row.email}</td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">{row.mobile}</td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            row.type === "Student"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-orange-50 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>

                      {/* School & Class */}
                      <td className="py-3.5 px-4 max-w-[170px] truncate" title={row.school}>
                        {row.school || row.studentClass || "-"}
                      </td>

                      {/* City & State */}
                      <td className="py-3.5 px-4 max-w-[150px] truncate whitespace-nowrap">
                        {row.city}, {row.state}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {row.submittedOn}
                      </td>

                      {/* View Details Eye Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSubmission(row)}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-[var(--primary)] hover:text-white text-gray-600 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="View Full Questionnaire Responses"
                        >
                          <FaEye className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination (Matching Screenshot 3) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs font-bold text-gray-500">
          <div>
            Showing {startItemDisplay} to {endItemDisplay} of {totalItems} entries
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                validPage === 1
                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = pNum === validPage;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-full font-black text-xs transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? "bg-[var(--primary)] text-white shadow-md shadow-red-500/20"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                validPage === totalPages
                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL: View All 15 Question Responses */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                    selectedSubmission.grade === "A++"
                      ? "bg-gradient-to-br from-emerald-500 to-green-700 shadow-emerald-500/30"
                      : selectedSubmission.grade === "A+"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/30"
                      : "bg-gradient-to-br from-amber-500 to-red-600 shadow-amber-500/30"
                  }`}
                >
                  {selectedSubmission.grade || "A"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedSubmission.firstName} {selectedSubmission.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold">
                    {selectedSubmission.type} Survey • Mobile: {selectedSubmission.mobile}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <FaXmark className="text-base" />
              </button>
            </div>

            {/* Scrollable Answers List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 [scrollbar-width:thin]">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 text-xs font-semibold text-gray-700 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Email:</span> {selectedSubmission.email}
                </div>
                <div>
                  <span className="text-gray-400">DOB / Gender:</span>{" "}
                  {selectedSubmission.dob} ({selectedSubmission.gender})
                </div>
                <div>
                  <span className="text-gray-400">Occupation / Class:</span>{" "}
                  {selectedSubmission.occupation} ({selectedSubmission.studentClass})
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>{" "}
                  {selectedSubmission.city}, {selectedSubmission.state}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">School:</span> {selectedSubmission.school}
                </div>
              </div>

              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider pt-2 border-t border-gray-100">
                Full 15 Questionnaire Responses
              </h4>

              <div className="space-y-3">
                {QUESTIONS.map((q, idx) => {
                  const userAns = selectedSubmission.answers
                    ? selectedSubmission.answers[q.id]
                    : null;
                  const ansDisplay = Array.isArray(userAns)
                    ? userAns.join(", ")
                    : userAns || "Not Answered";

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200/60 text-xs text-left"
                    >
                      <div className="font-extrabold text-gray-900 mb-1">
                        Q{idx + 1}. {q.question}
                      </div>
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-red-50 text-[var(--primary)] font-bold text-xs border border-red-100">
                        {ansDisplay}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="pt-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
