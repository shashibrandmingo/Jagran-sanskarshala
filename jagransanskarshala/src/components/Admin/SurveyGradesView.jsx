"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaGraduationCap,
  FaAward,
  FaEye,
  FaFileExport,
  FaMagnifyingGlass,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaUserGroup,
  FaTableCells,
  FaXmark,
  FaRotateLeft,
  FaCalendarDays,
  FaArrowsRotate,
} from "react-icons/fa6";
import * as XLSX from "xlsx";
import schoolsData from "@/data/schoolsData.json";
import { QUESTIONS } from "@/services/surveyQuestions";

const datePresets = [
  { id: "all", label: "All Time (सभी)" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
];

export default function SurveyGradesView() {
  const router = useRouter();

  // Primary Tab Filter: 'all' | 'parent' | 'student'
  const [tabFilter, setTabFilter] = useState("all");

  // Secondary Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all"); // 'all' | 'A++' | 'A+' | 'A'
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [dateRangeLabel, setDateRangeLabel] = useState("All Time (सभी)");

  // Dropdown Open State: 'none' | 'date' | 'state' | 'city' | 'school' | 'grade'
  const [openDropdown, setOpenDropdown] = useState("none");

  // Selection & Detail Modal State
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data & Loading States
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Stats Breakdown Counters
  const [stats, setStats] = useState({
    total: 0,
    studentCount: 0,
    parentCount: 0,
    todayCount: 0,
    gradeA2: 0,
    gradeA1: 0,
    gradeA0: 0,
  });

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-dropdown-container")) {
        setOpenDropdown("none");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tabFilter, gradeFilter, stateFilter, cityFilter, schoolFilter, datePreset, itemsPerPage]);

  // Fetch Live Stats from Backend
  const fetchStats = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) return;

    try {
      setIsStatsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/survey/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin-login");
        return;
      }

      const data = await res.json();
      if (res.ok && data.stats) {
        setStats({
          total: data.stats.total || 0,
          studentCount: data.stats.studentCount || 0,
          parentCount: data.stats.parentCount || 0,
          todayCount: data.stats.todayCount || 0,
          gradeA2: data.stats.gradeA2 || 0,
          gradeA1: data.stats.gradeA1 || 0,
          gradeA0: data.stats.gradeA0 || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load survey stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [router]);

  // Helper to compute date parameters
  const getDateRangeParams = useCallback(() => {
    if (datePreset === "all") return {};

    const now = new Date();
    let start = null;
    let end = null;

    if (datePreset === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (datePreset === "yesterday") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    } else if (datePreset === "7days") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (datePreset === "30days") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (datePreset === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (datePreset === "lastMonth") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    return {
      startDate: start ? start.toISOString() : undefined,
      endDate: end ? end.toISOString() : undefined,
    };
  }, [datePreset]);

  // Fetch Paginated Surveys from Backend
  const fetchSurveys = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) return;

    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (tabFilter !== "all") params.append("tab", tabFilter);
      if (gradeFilter !== "all") params.append("grade", gradeFilter);
      if (stateFilter !== "all") params.append("state", stateFilter);
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (schoolFilter !== "all") params.append("school", schoolFilter);
      if (debouncedSearch.trim() !== "") params.append("search", debouncedSearch.trim());

      const dateParams = getDateRangeParams();
      if (dateParams.startDate) params.append("startDate", dateParams.startDate);
      if (dateParams.endDate) params.append("endDate", dateParams.endDate);

      const res = await fetch(`${backendUrl}/api/v1/survey/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin-login");
        return;
      }

      const result = await res.json();
      if (res.ok && result.success) {
        setSurveys(result.data || []);
        setTotalItems(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } else {
        setSurveys([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load surveys:", err);
      setSurveys([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    tabFilter,
    gradeFilter,
    stateFilter,
    cityFilter,
    schoolFilter,
    debouncedSearch,
    getDateRangeParams,
    router,
  ]);

  // Load initial data and stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Location Dropdown Options
  const stateOptions = useMemo(() => {
    const knownStates = Object.keys(schoolsData || {}).sort();
    return [
      { value: "all", label: "All States" },
      ...knownStates.map((st) => ({ value: st, label: st })),
      { value: "Other", label: "Other / Custom" },
    ];
  }, []);

  const cityOptions = useMemo(() => {
    if (!stateFilter || stateFilter === "all") {
      return [{ value: "all", label: "Select State First" }];
    }
    if (stateFilter === "Other") {
      return [{ value: "all", label: "All Cities" }];
    }
    const stateObj = schoolsData[stateFilter];
    const cities = stateObj ? Object.keys(stateObj).sort() : [];
    return [
      { value: "all", label: "All Cities" },
      ...cities.map((c) => ({ value: c, label: c })),
    ];
  }, [stateFilter]);

  const schoolOptions = useMemo(() => {
    if (!stateFilter || stateFilter === "all") {
      return [{ value: "all", label: "Select State & City First" }];
    }
    if (!cityFilter || cityFilter === "all") {
      return [{ value: "all", label: "Select City First" }];
    }
    if (stateFilter === "Other" || cityFilter === "Other") {
      return [{ value: "all", label: "All Schools" }];
    }
    const schools = schoolsData[stateFilter]?.[cityFilter] || [];
    return [
      { value: "all", label: "All Schools" },
      ...schools.map((sch) => ({ value: sch, label: sch })),
    ];
  }, [stateFilter, cityFilter]);

  // Handle single submission details loading
  const handleViewDetail = async (item) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) return;

    setSelectedSubmission(item);
    setDetailLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/survey/detail/${item._id || item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setSelectedSubmission(data.data);
      }
    } catch (err) {
      console.error("Error loading detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Row selection helpers
  const getRowId = (row) => String(row?._id || row?.id || "");

  const isAllSelected =
    surveys.length > 0 && surveys.every((row) => selectedRows.includes(getRowId(row)));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = surveys.map((row) => getRowId(row)).filter(Boolean);
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(surveys.map((row) => getRowId(row)));
      setSelectedRows((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleRow = (id) => {
    const stringId = String(id);
    setSelectedRows((prev) =>
      prev.includes(stringId) ? prev.filter((item) => item !== stringId) : [...prev, stringId]
    );
  };

  // High-Speed Streaming CSV / Excel Export
  const handleExport = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) return;

    // If specific rows selected on current page, export selected items in Excel (.xlsx)
    if (selectedRows.length > 0) {
      const selectedIdSet = new Set(selectedRows.map(String));
      const selectedData = surveys.filter((row) => selectedIdSet.has(getRowId(row)));
      if (selectedData.length > 0) {
        const excelRows = selectedData.map((item, idx) => ({
          "S.No": idx + 1,
          "Survey ID": item.id || "-",
          "Grade": item.grade || "A",
          "Survey Type": item.type || "-",
          "First Name": item.firstName || "-",
          "Last Name": item.lastName || "-",
          "Email Address": item.email || "-",
          "Mobile Number": item.mobile || "-",
          "Date of Birth": item.dob || "-",
          "Gender": item.gender || "-",
          "Occupation": item.occupation || "-",
          "Class": item.studentClass || "-",
          "State": item.state || "-",
          "City": item.city || "-",
          "School": item.school || "-",
          "Submitted On": item.submittedOn || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Grades");
        XLSX.writeFile(
          workbook,
          `Jagran_Grades_Selected_${selectedRows.length}_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
        return;
      }
    }

    // Otherwise stream full filtered CSV from backend
    try {
      setIsExporting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const params = new URLSearchParams();

      if (tabFilter !== "all") params.append("tab", tabFilter);
      if (gradeFilter !== "all") params.append("grade", gradeFilter);
      if (stateFilter !== "all") params.append("state", stateFilter);
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (schoolFilter !== "all") params.append("school", schoolFilter);
      if (debouncedSearch.trim() !== "") params.append("search", debouncedSearch.trim());

      const dateParams = getDateRangeParams();
      if (dateParams.startDate) params.append("startDate", dateParams.startDate);
      if (dateParams.endDate) params.append("endDate", dateParams.endDate);

      const res = await fetch(`${backendUrl}/api/v1/survey/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Jagran_Sanskarshaala_Grades_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setGradeFilter("all");
    setStateFilter("all");
    setCityFilter("all");
    setSchoolFilter("all");
    setDatePreset("all");
    setDateRangeLabel("All Time (सभी)");
    setOpenDropdown("none");
  };

  // Pagination bounds
  const startItemDisplay = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItemDisplay = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/80 space-y-6">
        {/* Top Sub-Tabs: All Data / Parent Data / Student Data */}
        <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
          <button
            onClick={() => setTabFilter("all")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "all" ? "text-[var(--primary)]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>All Data ({stats.total.toLocaleString()})</span>
            {tabFilter === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>

          <button
            onClick={() => setTabFilter("parent")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "parent" ? "text-[var(--primary)]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Parent Data ({stats.parentCount.toLocaleString()})</span>
            {tabFilter === "parent" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>

          <button
            onClick={() => setTabFilter("student")}
            className={`text-xs sm:text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
              tabFilter === "student" ? "text-[var(--primary)]" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>Student Data ({stats.studentCount.toLocaleString()})</span>
            {tabFilter === "student" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
            )}
          </button>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isStatsLoading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 animate-pulse"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-200/90 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded-md w-28" />
                  <div className="h-7 bg-gray-300 rounded-lg w-16" />
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Card 1: Total Submissions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <FaTableCells className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Total Submissions</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                    {stats.total.toLocaleString()}
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
                    {stats.gradeA2.toLocaleString()}
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
                    {stats.gradeA1.toLocaleString()}
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
                    {stats.gradeA0.toLocaleString()}
                  </h3>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter Bar Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Date Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === "date" ? "none" : "date")}
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
                      datePreset === p.id ? "text-[var(--primary)] font-bold bg-red-50/50" : "text-gray-700"
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
              onClick={() => setOpenDropdown(openDropdown === "grade" ? "none" : "grade")}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FaAward className="text-gray-400" />
              <span>{gradeFilter === "all" ? "All Grades" : `Grade ${gradeFilter}`}</span>
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
                      gradeFilter === g.value ? "text-[var(--primary)] font-bold bg-red-50/50" : "text-gray-700"
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
              onClick={() => setOpenDropdown(openDropdown === "state" ? "none" : "state")}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer max-w-[160px] truncate"
            >
              <span className="truncate">{stateFilter === "all" ? "All States" : stateFilter}</span>
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
                      stateFilter === st.value ? "text-[var(--primary)] font-bold bg-red-50/50" : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                    {stateFilter === st.value && <FaCheck className="text-xs shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === "city" ? "none" : "city")}
              disabled={stateFilter === "all"}
              className={`px-3.5 py-2.5 border rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors max-w-[160px] truncate ${
                stateFilter === "all"
                  ? "bg-gray-100/60 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <span className="truncate">{cityFilter === "all" ? "All Cities" : cityFilter}</span>
              <FaChevronDown className="text-[10px] text-gray-400 shrink-0" />
            </button>

            {openDropdown === "city" && (
              <div className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5 [scrollbar-width:thin]">
                {cityOptions.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => {
                      setCityFilter(ct.value);
                      setSchoolFilter("all");
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      cityFilter === ct.value ? "text-[var(--primary)] font-bold bg-red-50/50" : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{ct.label}</span>
                    {cityFilter === ct.value && <FaCheck className="text-xs shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* School Filter Dropdown */}
          <div className="relative custom-dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === "school" ? "none" : "school")}
              disabled={cityFilter === "all"}
              className={`px-3.5 py-2.5 border rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors max-w-[180px] truncate ${
                cityFilter === "all"
                  ? "bg-gray-100/60 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <span className="truncate">{schoolFilter === "all" ? "All Schools" : schoolFilter}</span>
              <FaChevronDown className="text-[10px] text-gray-400 shrink-0" />
            </button>

            {openDropdown === "school" && (
              <div className="absolute top-full left-0 mt-1.5 w-72 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 space-y-0.5 [scrollbar-width:thin]">
                {schoolOptions.map((sch) => (
                  <button
                    key={sch.value}
                    onClick={() => {
                      setSchoolFilter(sch.value);
                      setOpenDropdown("none");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-red-50 hover:text-[var(--primary)] ${
                      schoolFilter === sch.value ? "text-[var(--primary)] font-bold bg-red-50/50" : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">{sch.label}</span>
                    {schoolFilter === sch.value && <FaCheck className="text-xs shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name, mobile, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
            />
          </div>

          {/* Reset Filters */}
          {(searchQuery ||
            gradeFilter !== "all" ||
            stateFilter !== "all" ||
            cityFilter !== "all" ||
            schoolFilter !== "all" ||
            datePreset !== "all") && (
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <FaRotateLeft className="text-[10px]" />
              <span>Reset</span>
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`ml-auto px-4 py-2 rounded-2xl text-xs font-extrabold shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 ${
              selectedRows.length > 0
                ? "bg-[var(--primary)] text-white hover:bg-red-700 shadow-md shadow-red-500/20"
                : "bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            title={
              selectedRows.length > 0
                ? `Export ${selectedRows.length} selected entries as Excel Sheet (.xlsx)`
                : "Export all filtered data as CSV"
            }
          >
            <FaFileExport className={selectedRows.length > 0 ? "text-white text-sm" : "text-[var(--primary)] text-sm"} />
            <span>
              {isExporting
                ? "Exporting..."
                : selectedRows.length > 0
                ? `Export Selected (${selectedRows.length})`
                : "Export CSV"}
            </span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 min-h-[300px]">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#faf4ed] text-gray-700 font-black uppercase text-[11px] tracking-wider border-b border-[#f5e6d6]">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded-md text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">S.No</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">First Name</th>
                <th className="py-3.5 px-4">Last Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">School / Class</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="12" className="py-4 px-4">
                      <div className="h-4 bg-gray-200/80 rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-12 text-center text-gray-400 font-bold">
                    No survey grade records found matching the applied filters.
                  </td>
                </tr>
              ) : (
                surveys.map((row, idx) => {
                  const isSelected = selectedRows.includes(getRowId(row));
                  const rowGrade = row.grade || "A";

                  return (
                    <tr
                      key={getRowId(row)}
                      className={`hover:bg-red-50/30 transition-colors ${
                        isSelected ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(getRowId(row))}
                          className="w-4 h-4 rounded-md text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-400">
                        {startItemDisplay + idx}
                      </td>

                      {/* Grade Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xs ${
                            rowGrade === "A++"
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20"
                              : rowGrade === "A+"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20"
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
                          onClick={() => handleViewDetail(row)}
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

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs font-bold text-gray-500">
          <div>
            Showing {startItemDisplay} to {endItemDisplay} of {totalItems.toLocaleString()} entries
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {/* Dynamic Page Buttons */}
            {(() => {
              const buttons = [];
              const maxButtons = 5;
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + maxButtons - 1);

              if (end - start + 1 < maxButtons) {
                start = Math.max(1, end - maxButtons + 1);
              }

              for (let p = start; p <= end; p++) {
                buttons.push(
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-full font-black text-xs transition-colors cursor-pointer flex items-center justify-center ${
                      p === currentPage
                        ? "bg-[var(--primary)] text-white shadow-md shadow-red-500/20"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              return buttons;
            })()}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === totalPages
                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL: View Full Questionnaire Responses */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                    (selectedSubmission.grade || "A") === "A++"
                      ? "bg-gradient-to-br from-emerald-500 to-green-700 shadow-emerald-500/30"
                      : (selectedSubmission.grade || "A") === "A+"
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
                  <span className="text-gray-400">DOB / Gender:</span> {selectedSubmission.dob} (
                  {selectedSubmission.gender})
                </div>
                <div>
                  <span className="text-gray-400">Occupation / Class:</span>{" "}
                  {selectedSubmission.occupation} ({selectedSubmission.studentClass})
                </div>
                <div>
                  <span className="text-gray-400">Location:</span> {selectedSubmission.city},{" "}
                  {selectedSubmission.state}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">School:</span> {selectedSubmission.school}
                </div>
              </div>

              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider pt-2 border-t border-gray-100 flex items-center justify-between">
                <span>Questionnaire Responses</span>
                {detailLoading && (
                  <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 normal-case">
                    <FaArrowsRotate className="animate-spin text-xs text-[var(--primary)]" />
                    Loading answers...
                  </span>
                )}
              </h4>

              <div className="space-y-3">
                {QUESTIONS.map((q, idx) => {
                  const userAns = selectedSubmission.answers
                    ? selectedSubmission.answers[q.id]
                    : null;
                  const ansDisplay = Array.isArray(userAns)
                    ? userAns.join(", ")
                    : userAns || (detailLoading ? "Loading..." : "Not Answered");

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
