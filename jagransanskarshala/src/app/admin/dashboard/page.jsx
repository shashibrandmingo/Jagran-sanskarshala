"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaTableCells,
  FaChartPie,
  FaAddressBook,
  FaBell,
  FaRightFromBracket,
  FaFileExport,
  FaEye,
  FaMagnifyingGlass,
  FaGraduationCap,
  FaUserGroup,
  FaCalendarCheck,
  FaBars,
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaRegCalendar,
  FaImages,
  FaNewspaper,
  FaPlus,
  FaTrash,
  FaPen,
  FaUpload,
  FaFolderPlus,
  FaCalendarPlus,
} from "react-icons/fa6";
import Logo from "@/assets/images/Logo-english.png";
import * as XLSX from "xlsx";
import schoolsData from "@/data/schoolsData.json";
import AdminSidebar from "@/components/Admin/AdminSidebar";

// Helper functions for Date calculations
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatMMDDYYYY = (d) => {
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const formatShortDateRange = (d1, d2) => {
  if (!d1 || !d2) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatSingle = (d) => `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  return `${formatSingle(d1)} - ${formatSingle(d2)}`;
};

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];
  // Trailing previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      date: new Date(year, month, d),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }
  // Leading next month days to complete 42 cells (6 rows)
  const remaining = 42 - days.length;
  for (let n = 1; n <= remaining; n++) {
    days.push({
      date: new Date(year, month + 1, n),
      dayNumber: n,
      isCurrentMonth: false,
    });
  }
  return days;
};

// Date Presets & Options
const datePresets = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7days", label: "Last 7 days" },
  { id: "30days", label: "Last 30 days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live MongoDB Submissions State
  const [liveSurveys, setLiveSurveys] = useState([]);

  // Sidebar state
  const [activeMenu, setActiveMenu] = useState("survey-data");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Survey Data Tab Filter State: 'all' | 'parent' | 'student'
  const [tabFilter, setTabFilter] = useState("all");

  // Search & Secondary Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");

  // Custom Dropdown Open State: 'none' | 'date' | 'state' | 'city' | 'school'
  const [openDropdown, setOpenDropdown] = useState("none");

  // Dynamic State Options derived from schoolsData.json & live submissions
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
      { value: "Other", label: "Other / अन्य (Custom)" },
      ...Array.from(customStates).sort().map((st) => ({ value: st, label: st })),
    ];
  }, [liveSurveys]);

  // Dynamic City Options based on selected stateFilter
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
        { value: "Other", label: "Other / अन्य (Custom)" },
        ...Array.from(customCities).sort().map((c) => ({ value: c, label: c })),
      ];
    }
    const stateObj = schoolsData[stateFilter];
    const cities = stateObj ? Object.keys(stateObj).sort() : [];
    return [
      { value: "all", label: "All Cities" },
      ...cities.map((c) => ({ value: c, label: c })),
      { value: "Other", label: "Other / अन्य (Custom)" },
    ];
  }, [stateFilter, liveSurveys]);

  // Dynamic School Options based on selected stateFilter & cityFilter
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
        { value: "Other", label: "Other / अन्य (Custom)" },
        ...Array.from(customSchools).sort().map((sch) => ({ value: sch, label: sch })),
      ];
    }
    const schools = schoolsData[stateFilter]?.[cityFilter] || [];
    return [
      { value: "all", label: "All Schools" },
      ...schools.map((sch) => ({ value: sch, label: sch })),
      { value: "Other", label: "Other / अन्य (Custom)" },
    ];
  }, [stateFilter, cityFilter, liveSurveys]);

  // Date Filter Preset & Custom Picker States
  const [datePreset, setDatePreset] = useState("30days");
  const [dateRangeLabel, setDateRangeLabel] = useState("Last 30 days");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [tempStartDate, setTempStartDate] = useState(new Date(2026, 6, 2)); // 07/02/2026
  const [tempEndDate, setTempEndDate] = useState(new Date(2026, 7, 1)); // 08/01/2026
  const [appliedStartDate, setAppliedStartDate] = useState(new Date(2026, 6, 2));
  const [appliedEndDate, setAppliedEndDate] = useState(new Date(2026, 7, 1));

  // Detail Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (!token) {
      router.push("/admin-login");
      return;
    }

    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    router.push("/admin-login");
  };

  // Fetch Live Survey Submissions from Backend API
  const fetchLiveSurveys = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/survey/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setLiveSurveys(data.data);
      }
    } catch (err) {
      console.error("Error fetching live surveys:", err);
    }
  };

  useEffect(() => {
    fetchLiveSurveys();
    // Auto-poll every 4 seconds for real-time live submission updates
    const interval = setInterval(fetchLiveSurveys, 4000);
    return () => clearInterval(interval);
  }, []);

  // Selected Row Checkbox State
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination to Page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tabFilter, stateFilter, cityFilter, schoolFilter, datePreset, appliedStartDate, appliedEndDate, itemsPerPage]);

  // Preset Selection Handler
  const handleSelectDatePreset = (preset) => {
    setOpenDropdown("none");
    if (preset.id === "custom") {
      setShowCustomDateModal(true);
    } else {
      setDatePreset(preset.id);
      setDateRangeLabel(preset.label);
    }
  };

  // Calendar Day Click Handler
  const handleCalendarDayClick = (clickedDate) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(clickedDate);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
      } else {
        setTempEndDate(clickedDate);
      }
    }
  };

  // Apply Custom Date Range
  const handleApplyCustomDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setAppliedStartDate(tempStartDate);
      setAppliedEndDate(tempEndDate);
      setDatePreset("custom");
      setDateRangeLabel(formatShortDateRange(tempStartDate, tempEndDate));
      setShowCustomDateModal(false);
    }
  };

  // Use ONLY Live MongoDB Submissions from Backend
  const currentDataset = liveSurveys;

  const filteredData = currentDataset.filter((item) => {
    // Tab filter
    if (tabFilter === "parent" && item.type.toLowerCase() !== "parent") return false;
    if (tabFilter === "student" && item.type.toLowerCase() !== "student") return false;

    // Global Search Query across ALL fields of lead
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      const fieldsToSearch = [
        item.id,
        item.firstName,
        item.lastName,
        `${item.firstName || ""} ${item.lastName || ""}`,
        item.email,
        item.mobile,
        item.dob,
        item.gender,
        item.type,
        item.occupation,
        item.studentClass,
        item.state,
        item.city,
        item.school,
        item.submittedOn,
      ];
      const matchesAnyField = fieldsToSearch.some(
        (val) => val && String(val).toLowerCase().includes(q)
      );
      if (!matchesAnyField) return false;
    }

    // Known standard states from schoolsData
    const knownStates = Object.keys(schoolsData || {});

    // State filter (Handles "Other / अन्य" and custom state entries)
    if (stateFilter !== "all") {
      if (stateFilter === "Other") {
        const isStandard = knownStates.includes(item.state);
        const isOther = !item.state || item.state.toLowerCase().includes("other") || !isStandard;
        if (!isOther) return false;
      } else {
        if (item.state !== stateFilter) return false;
      }
    }

    // City filter (Handles "Other / अन्य" and custom city entries)
    if (cityFilter !== "all") {
      if (cityFilter === "Other") {
        const knownCities = stateFilter && schoolsData[stateFilter] ? Object.keys(schoolsData[stateFilter]) : [];
        const isStandard = knownCities.includes(item.city);
        const isOther = !item.city || item.city.toLowerCase().includes("other") || !isStandard;
        if (!isOther) return false;
      } else {
        if (item.city !== cityFilter) return false;
      }
    }

    // School filter (Handles "Other / अन्य" and custom school entries)
    if (schoolFilter !== "all") {
      if (schoolFilter === "Other") {
        const knownSchools = stateFilter && cityFilter && schoolsData[stateFilter]?.[cityFilter] ? schoolsData[stateFilter][cityFilter] : [];
        const isStandard = knownSchools.includes(item.school);
        const isOther = !item.school || item.school.toLowerCase().includes("other") || !isStandard;
        if (!isOther) return false;
      } else {
        if (item.school !== schoolFilter) return false;
      }
    }

    // Date Range Filter
    if (item.submittedOn) {
      const itemDate = new Date(item.submittedOn.replace(",", ""));
      if (!isNaN(itemDate.getTime())) {
        if (datePreset === "custom" && appliedStartDate && appliedEndDate) {
          const start = new Date(appliedStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(appliedEndDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate < start || itemDate > end) return false;
        } else if (datePreset === "today") {
          const now = new Date();
          if (!isSameDay(itemDate, now)) return false;
        } else if (datePreset === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (!isSameDay(itemDate, yesterday)) return false;
        } else if (datePreset === "7days") {
          const start = new Date();
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          const end = new Date();
          end.setHours(23, 59, 59, 999);
          if (itemDate < start || itemDate > end) return false;
        } else if (datePreset === "30days") {
          const start = new Date();
          start.setDate(start.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          const end = new Date();
          end.setHours(23, 59, 59, 999);
          if (itemDate < start || itemDate > end) return false;
        }
      }
    }

    return true;
  });

  // Pagination Calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = totalItems === 0 ? 0 : (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const startItemDisplay = totalItems === 0 ? 0 : startIndex + 1;
  const endItemDisplay = endIndex;

  // Select All & Row Selection logic
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedData.map((row) => row.id);
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedData.map((row) => row.id));
      setSelectedRows((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export Data to Excel (.xlsx) File
  const handleExportData = () => {
    let dataToExport = [];
    if (selectedRows && selectedRows.length > 0) {
      // Export ONLY selected rows if checkboxes are checked
      dataToExport = filteredData.filter((row) => selectedRows.includes(row.id));
      if (dataToExport.length === 0) {
        dataToExport = currentDataset.filter((row) => selectedRows.includes(row.id));
      }
    } else {
      // Export all entries matching current active filters & date range
      dataToExport = filteredData;
    }

    if (!dataToExport || dataToExport.length === 0) {
      alert("No survey data available to export / एक्सपोर्ट करने के लिए कोई डेटा नहीं है।");
      return;
    }

    const excelRows = dataToExport.map((item, idx) => ({
      "S.No": idx + 1,
      "ID": item.id || "-",
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

    // Auto-fit column widths
    const max_widths = Object.keys(excelRows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...excelRows.map((r) => String(r[key] || "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    worksheet["!cols"] = max_widths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Submissions");

    const dateStr = new Date().toISOString().split("T")[0];
    const isSelectedMode = selectedRows && selectedRows.length > 0;
    const fileName = isSelectedMode
      ? `Jagran_Sanskarshala_${selectedRows.length}_Selected_Surveys_${dateStr}.xlsx`
      : `Jagran_Sanskarshala_Survey_Data_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) {
      return (
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white font-bold flex items-center justify-center shadow-xs text-xs"
        >
          1
        </button>
      );
    }

    const buttons = [];
    let startPage = Math.max(1, validPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          type="button"
          onClick={() => setCurrentPage(1)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs cursor-pointer"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="px-1 text-gray-400 text-xs">...</span>);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const isCurrent = p === validPage;
      buttons.push(
        <button
          key={p}
          type="button"
          onClick={() => setCurrentPage(p)}
          className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs transition-colors cursor-pointer ${isCurrent
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="px-1 text-gray-400 text-xs">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          type="button"
          onClick={() => setCurrentPage(totalPages)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs cursor-pointer"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStateFilter("all");
    setCityFilter("all");
    setSchoolFilter("all");
    setDatePreset("30days");
    setDateRangeLabel("Last 30 days");
    setOpenDropdown("none");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf4ed] flex items-center justify-center">
        <div className="flex items-center gap-3 font-extrabold text-gray-700">
          <svg className="animate-spin h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading Jagran Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f8f5f0] text-gray-800 flex flex-col lg:flex-row font-admin overflow-hidden">
      {/* Shared Modular Sidebar Component */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="survey-data"
      />

      {/* =========================================================
          MAIN DASHBOARD CONTENT AREA (Scrolls independently)
         ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-700 hover:text-[var(--primary)]"
          >
            <FaBars className="text-xl" />
          </button>
          <Image src={Logo} alt="Logo" width={120} height={35} className="h-8 w-auto object-contain" />
          <div className="w-8" />
        </div>

        {/* Top Header Banner */}
        <header className="p-6 sm:p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Survey Data
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">
              सर्वे फॉर्म डेटा
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-2xl text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title={selectedRows.length > 0 ? `Export ${selectedRows.length} selected entries` : "Export all filtered data"}
            >
              <FaFileExport className="text-[var(--primary)]" />
              <span>
                {selectedRows.length > 0
                  ? `Export Selected (${selectedRows.length})`
                  : "Export"}
              </span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="px-4 sm:px-8 pb-8 space-y-6">
              {/* Filter Sub-Tabs: All Data / Parent Data / Student Data */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
                <div className="flex items-center gap-8 border-b border-gray-100 pb-4 mb-6">
                  <button
                    onClick={() => setTabFilter("all")}
                    className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${tabFilter === "all"
                      ? "text-[var(--primary)]"
                      : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    <span>All Data</span>
                    {tabFilter === "all" && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full animate-fadeIn" />
                    )}
                  </button>

                  <button
                    onClick={() => setTabFilter("parent")}
                    className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${tabFilter === "parent"
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
                    className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${tabFilter === "student"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* Card 1: Total Submissions */}
                  <div className="p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-13 h-13 rounded-2xl bg-red-100/70 text-[var(--primary)] flex items-center justify-center shrink-0">
                      <FaTableCells className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Total Submissions</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                        {currentDataset.length.toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  {/* Card 2: Parent Submissions */}
                  <div className="p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-13 h-13 rounded-2xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                      <FaUserGroup className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Parent Submissions</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                        {currentDataset.filter((item) => item.type.toLowerCase() === "parent").length.toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  {/* Card 3: Student Submissions */}
                  <div className="p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-13 h-13 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                      <FaGraduationCap className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Student Submissions</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                        {currentDataset.filter((item) => item.type.toLowerCase() === "student").length.toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  {/* Card 4: Today's Submissions */}
                  <div className="p-5 rounded-2xl bg-[#fdf8f4] border border-[#f5e6d6] flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-13 h-13 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                      <FaCalendarCheck className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Today's Submissions</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                        {currentDataset.filter((item) => {
                          if (!item.submittedOn) return false;
                          const itemDate = new Date(item.submittedOn.replace(",", ""));
                          return !isNaN(itemDate.getTime()) && itemDate.toDateString() === new Date().toDateString();
                        }).length.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  FILTERS ROW (Custom Date Range, State, City, School)
                 ========================================================= */}
              <div className="bg-white rounded-3xl px-5 py-4 shadow-xs border border-gray-200/80">
                <div className="flex flex-wrap items-end gap-3">
                  {/* Date Range Dropdown (Matching Ref Screenshot 3) */}
                  <div className="min-w-[180px] flex-1 relative custom-dropdown-container">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Date Range</label>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === "date" ? "none" : "date")}
                      className={`w-full px-3.5 py-2 bg-gray-50 border rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between transition-all cursor-pointer ${openDropdown === "date"
                        ? "border-[var(--primary)] bg-white ring-2 ring-red-100 shadow-xs"
                        : "border-gray-200 hover:bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FaRegCalendar className="text-gray-500 text-xs shrink-0" />
                        <span className="truncate">{dateRangeLabel}</span>
                      </div>
                      {openDropdown === "date" ? (
                        <FaChevronUp className="text-[10px] text-gray-500 shrink-0 ml-1" />
                      ) : (
                        <FaChevronDown className="text-[10px] text-gray-400 shrink-0 ml-1" />
                      )}
                    </button>

                    {/* Date Presets Popover Menu (Screenshot 3) */}
                    {openDropdown === "date" && (
                      <div className="absolute top-full left-0 mt-1 z-40 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fadeIn text-xs font-semibold">
                        {datePresets.map((preset) => {
                          const isSelected = datePreset === preset.id;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => handleSelectDatePreset(preset)}
                              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                ? "bg-blue-50/70 text-blue-600 font-bold"
                                : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span>{preset.label}</span>
                              {isSelected && <FaCheck className="text-blue-600 text-xs" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* State Filter (Custom UI) */}
                  <div className="min-w-[140px] flex-1 relative custom-dropdown-container">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">State</label>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === "state" ? "none" : "state")}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between transition-all cursor-pointer ${openDropdown === "state"
                        ? "border-[var(--primary)] bg-white ring-2 ring-red-100 shadow-xs"
                        : "border-gray-200 hover:bg-white hover:border-gray-300"
                        }`}
                    >
                      <span className="truncate">
                        {stateOptions.find((o) => o.value === stateFilter)?.label || "All States"}
                      </span>
                      {openDropdown === "state" ? (
                        <FaChevronUp className="text-[10px] text-gray-500 shrink-0 ml-1" />
                      ) : (
                        <FaChevronDown className="text-[10px] text-gray-400 shrink-0 ml-1" />
                      )}
                    </button>

                    {openDropdown === "state" && (
                      <div className="absolute top-full left-0 mt-1 z-40 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 max-h-56 overflow-y-auto thin-scrollbar animate-fadeIn text-xs font-semibold">
                        {stateOptions.map((opt) => {
                          const isSelected = stateFilter === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                setStateFilter(opt.value);
                                setCityFilter("all");
                                setSchoolFilter("all");
                                setOpenDropdown("none");
                              }}
                              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                ? "bg-red-50 text-[var(--primary)] font-bold"
                                : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {isSelected && <FaCheck className="text-[var(--primary)] text-xs shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* City Filter (Custom UI) */}
                  <div className="min-w-[130px] flex-1 relative custom-dropdown-container">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">City</label>
                    <button
                      type="button"
                      disabled={!stateFilter || stateFilter === "all"}
                      onClick={() => stateFilter && stateFilter !== "all" && setOpenDropdown(openDropdown === "city" ? "none" : "city")}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-between transition-all ${!stateFilter || stateFilter === "all"
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75"
                        : openDropdown === "city"
                          ? "border-[var(--primary)] bg-white ring-2 ring-red-100 shadow-xs cursor-pointer text-gray-800"
                          : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 cursor-pointer text-gray-800"
                        }`}
                    >
                      <span className="truncate">
                        {cityOptions.find((o) => o.value === cityFilter)?.label || "All Cities"}
                      </span>
                      {openDropdown === "city" ? (
                        <FaChevronUp className="text-[10px] text-gray-500 shrink-0 ml-1" />
                      ) : (
                        <FaChevronDown className="text-[10px] text-gray-400 shrink-0 ml-1" />
                      )}
                    </button>

                    {openDropdown === "city" && stateFilter && stateFilter !== "all" && (
                      <div className="absolute top-full left-0 mt-1 z-40 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 max-h-56 overflow-y-auto thin-scrollbar animate-fadeIn text-xs font-semibold">
                        {cityOptions.map((opt) => {
                          const isSelected = cityFilter === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                setCityFilter(opt.value);
                                setSchoolFilter("all");
                                setOpenDropdown("none");
                              }}
                              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                ? "bg-red-50 text-[var(--primary)] font-bold"
                                : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {isSelected && <FaCheck className="text-[var(--primary)] text-xs shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* School Filter (Custom UI) */}
                  <div className="min-w-[140px] flex-1 relative custom-dropdown-container">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">School</label>
                    <button
                      type="button"
                      disabled={!cityFilter || cityFilter === "all"}
                      onClick={() => cityFilter && cityFilter !== "all" && setOpenDropdown(openDropdown === "school" ? "none" : "school")}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-between transition-all ${!cityFilter || cityFilter === "all"
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75"
                        : openDropdown === "school"
                          ? "border-[var(--primary)] bg-white ring-2 ring-red-100 shadow-xs cursor-pointer text-gray-800"
                          : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 cursor-pointer text-gray-800"
                        }`}
                    >
                      <span className="truncate">
                        {schoolOptions.find((o) => o.value === schoolFilter)?.label || "All Schools"}
                      </span>
                      {openDropdown === "school" ? (
                        <FaChevronUp className="text-[10px] text-gray-500 shrink-0 ml-1" />
                      ) : (
                        <FaChevronDown className="text-[10px] text-gray-400 shrink-0 ml-1" />
                      )}
                    </button>

                    {openDropdown === "school" && cityFilter && cityFilter !== "all" && (
                      <div className="absolute top-full left-0 mt-1 z-40 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 max-h-56 overflow-y-auto thin-scrollbar animate-fadeIn text-xs font-semibold">
                        {schoolOptions.map((opt) => {
                          const isSelected = schoolFilter === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                setSchoolFilter(opt.value);
                                setOpenDropdown("none");
                              }}
                              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                ? "bg-red-50 text-[var(--primary)] font-bold"
                                : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {isSelected && <FaCheck className="text-[var(--primary)] text-xs shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reset & Apply Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                    <button className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:bg-red-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer whitespace-nowrap">
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  SURVEY DATA TABLE (Matching Ref UI Image #2)
                 ========================================================= */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-4">
                {/* Table Header Tools */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Search Bar (Global Search Box) */}
                  <div className="relative w-full sm:w-96">
                    <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Global Search (ID, Name, Mobile, Email, State, City, School, Type, Gender...)"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>

                  {/* Show Entries Selector (Custom UI) */}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 self-end sm:self-auto relative custom-dropdown-container">
                    <span>Show</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === "entries" ? "none" : "entries")}
                        className={`px-3 py-1.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between gap-2 transition-all cursor-pointer ${openDropdown === "entries"
                          ? "border-[var(--primary)] bg-white ring-2 ring-red-100 shadow-xs"
                          : "border-gray-200 hover:bg-white hover:border-gray-300"
                          }`}
                      >
                        <span>{itemsPerPage}</span>
                        {openDropdown === "entries" ? (
                          <FaChevronUp className="text-[10px] text-gray-500" />
                        ) : (
                          <FaChevronDown className="text-[10px] text-gray-400" />
                        )}
                      </button>

                      {openDropdown === "entries" && (
                        <div className="absolute right-0 top-full mt-1 z-40 w-24 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 animate-fadeIn text-xs font-semibold">
                          {[10, 25, 50, 100].map((num) => {
                            const isSelected = itemsPerPage === num;
                            return (
                              <div
                                key={num}
                                onClick={() => {
                                  setItemsPerPage(num);
                                  setCurrentPage(1);
                                  setOpenDropdown("none");
                                }}
                                className={`px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                  ? "bg-red-50 text-[var(--primary)] font-bold"
                                  : "hover:bg-gray-50 text-gray-700"
                                  }`}
                              >
                                <span>{num}</span>
                                {isSelected && <FaCheck className="text-[var(--primary)] text-xs" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span>entries</span>
                  </div>
                </div>

                {/* Data Table Container — thin scrollbar at bottom */}
                <div className="w-full rounded-2xl border border-gray-200/80 bg-white overflow-x-auto thin-scrollbar shadow-2xs">
                  <table className="w-full min-w-[1200px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-[9.5px] font-black text-gray-500 uppercase tracking-wider">
                        <th className="py-2.5 pl-3 pr-1 text-center w-[32px]">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-2 whitespace-nowrap">ID<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">आईडी</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">First Name<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">पहला नाम</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Last Name<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">अंतिम नाम</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Email<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">ईमेल</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Mobile<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">मोबाइल</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">DOB<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">जन्म तिथि</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Gender<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">लिंग</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Type<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">प्रकार</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Occupation<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">व्यवसाय</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Class<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">कक्षा</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">State<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">राज्य</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">City<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">शहर</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">School<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">विद्यालय</span></th>
                        <th className="py-2.5 px-2 whitespace-nowrap">Submitted On<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">जमा दिनांक</span></th>
                        <th className="py-2.5 pr-3 pl-1 text-center w-[42px] whitespace-nowrap">Action<br /><span className="text-[7.5px] text-gray-400 font-normal normal-case">कार्रवाई</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px] font-semibold text-gray-700">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={16} className="py-8 text-center text-gray-400">
                            No submissions match the active filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((row) => {
                          const isRowSelected = selectedRows.includes(row.id);
                          return (
                            <tr
                              key={row.id}
                              className={`transition-colors ${
                                isRowSelected ? "bg-red-50/70" : "hover:bg-red-50/30"
                              }`}
                            >
                              <td className="py-2.5 pl-3 pr-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={isRowSelected}
                                  onChange={() => handleToggleRow(row.id)}
                                  className="rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-2 font-mono text-gray-500 text-[10.5px] whitespace-nowrap">{row.id}</td>
                              <td className="py-2.5 px-2 font-bold text-gray-900 whitespace-nowrap">{row.firstName}</td>
                              <td className="py-2.5 px-2 whitespace-nowrap">{row.lastName}</td>
                              <td className="py-2.5 px-2 text-gray-600 text-[10.5px] whitespace-nowrap">{row.email}</td>
                              <td className="py-2.5 px-2 text-gray-600 font-mono text-[10.5px] whitespace-nowrap">{row.mobile}</td>
                              <td className="py-2.5 px-2 text-gray-600 text-[10.5px] whitespace-nowrap">{row.dob}</td>
                              <td className="py-2.5 px-2 whitespace-nowrap">{row.gender}</td>
                              <td className="py-2.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-block whitespace-nowrap ${
                                  row.type === "Student"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-orange-50 text-orange-700 border border-orange-200"
                                }`}>
                                  {row.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 whitespace-nowrap">{row.occupation}</td>
                              <td className="py-2.5 px-2 text-center whitespace-nowrap">{row.studentClass}</td>
                              <td className="py-2.5 px-2 whitespace-nowrap">{row.state}</td>
                              <td className="py-2.5 px-2 whitespace-nowrap">{row.city}</td>
                              <td className="py-2.5 px-2 whitespace-nowrap max-w-[160px] truncate" title={row.school}>{row.school}</td>
                              <td className="py-2.5 px-2 text-gray-500 text-[10px] whitespace-nowrap">{row.submittedOn}</td>
                              <td className="py-2.5 pr-3 pl-1 text-center">
                                <button
                                  onClick={() => setSelectedSubmission(row)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="View Details"
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

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-xs text-gray-500 font-semibold">
                  <div>
                    Showing {startItemDisplay} to {endItemDisplay} of {totalItems.toLocaleString()} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>

                    {renderPaginationButtons()}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
        </div>
      </div>

      {/* =========================================================
          SUBMISSION DETAIL MODAL (When clicking eye icon)
         ========================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaXmark className="text-lg" />
            </button>

            <h3 className="text-lg font-black text-gray-900 mb-1">Submission Details</h3>
            <p className="text-xs text-gray-500 mb-4">ID: {selectedSubmission.id}</p>

            <div className="space-y-2.5 text-xs max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Name</span>
                <span className="font-extrabold text-gray-900">{selectedSubmission.firstName} {selectedSubmission.lastName}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Email</span>
                <span className="font-bold text-gray-800">{selectedSubmission.email}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Mobile</span>
                <span className="font-mono text-gray-800">{selectedSubmission.mobile}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Date of Birth</span>
                <span className="font-bold text-gray-800">{selectedSubmission.dob}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Gender</span>
                <span className="font-bold text-gray-800">{selectedSubmission.gender}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Type</span>
                <span className="font-extrabold text-[var(--primary)]">{selectedSubmission.type}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Occupation</span>
                <span className="font-bold text-gray-800">{selectedSubmission.occupation}</span>
              </div>
              {selectedSubmission.type === "Student" && (
                <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-500">Class</span>
                  <span className="font-bold text-gray-800">{selectedSubmission.studentClass}</span>
                </div>
              )}
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">State</span>
                <span className="font-bold text-gray-800">{selectedSubmission.state}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">City</span>
                <span className="font-bold text-gray-800">{selectedSubmission.city}</span>
              </div>
              {selectedSubmission.type === "Student" && (
                <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-500">School</span>
                  <span className="font-bold text-gray-800">{selectedSubmission.school}</span>
                </div>
              )}
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500">Submitted On</span>
                <span className="font-bold text-gray-800">{selectedSubmission.submittedOn}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSubmission(null)}
              className="w-full mt-6 py-2.5 rounded-2xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer hover:bg-red-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          CUSTOM DATE RANGE SELECTION CALENDAR MODAL (Screenshot 4)
         ========================================================= */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full border border-gray-100 relative">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4">
              Please select the date range
            </h3>

            {/* Calendar Side-by-Side View */}
            {(() => {
              const month1 = calendarBaseDate;
              const month2 = new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + 1, 1);
              const daysMonth1 = getCalendarDays(month1.getFullYear(), month1.getMonth());
              const daysMonth2 = getCalendarDays(month2.getFullYear(), month2.getMonth());

              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Month 1 (July 2026) */}
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <button
                          type="button"
                          onClick={() => setCalendarBaseDate(new Date(month1.getFullYear(), month1.getMonth() - 1, 1))}
                          className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FaChevronLeft className="text-[10px]" />
                        </button>
                        <span className="text-sm font-extrabold text-slate-800">
                          {monthNames[month1.getMonth()]} {month1.getFullYear()}
                        </span>
                        <div className="w-7 md:hidden"></div>
                      </div>

                      {/* Day Name Headers */}
                      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-slate-400 mb-1">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {daysMonth1.map((cell, idx) => {
                          const isStart = tempStartDate && isSameDay(cell.date, tempStartDate);
                          const isEnd = tempEndDate && isSameDay(cell.date, tempEndDate);
                          const isInRange =
                            tempStartDate &&
                            tempEndDate &&
                            cell.date > tempStartDate &&
                            cell.date < tempEndDate;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleCalendarDayClick(cell.date)}
                              className={`h-8 flex items-center justify-center text-xs font-semibold transition-all ${!cell.isCurrentMonth
                                ? "text-gray-300 cursor-default"
                                : isStart || isEnd
                                  ? "bg-[var(--primary)] text-white font-bold rounded-xl shadow-xs z-10"
                                  : isInRange
                                    ? "bg-red-50 text-[var(--primary)] font-bold rounded-md"
                                    : "text-slate-700 hover:bg-gray-100 rounded-xl cursor-pointer"
                                }`}
                            >
                              {cell.dayNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Month 2 (August 2026) */}
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="w-7 hidden md:block"></div>
                        <span className="text-sm font-extrabold text-slate-800">
                          {monthNames[month2.getMonth()]} {month2.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalendarBaseDate(new Date(month1.getFullYear(), month1.getMonth() + 1, 1))}
                          className="w-7 h-7 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FaChevronRight className="text-[10px]" />
                        </button>
                      </div>

                      {/* Day Name Headers */}
                      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-slate-400 mb-1">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {daysMonth2.map((cell, idx) => {
                          const isStart = tempStartDate && isSameDay(cell.date, tempStartDate);
                          const isEnd = tempEndDate && isSameDay(cell.date, tempEndDate);
                          const isInRange =
                            tempStartDate &&
                            tempEndDate &&
                            cell.date > tempStartDate &&
                            cell.date < tempEndDate;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleCalendarDayClick(cell.date)}
                              className={`h-8 flex items-center justify-center text-xs font-semibold transition-all ${!cell.isCurrentMonth
                                ? "text-gray-300 cursor-default"
                                : isStart || isEnd
                                  ? "bg-[var(--primary)] text-white font-bold rounded-xl shadow-xs z-10"
                                  : isInRange
                                    ? "bg-red-50 text-[var(--primary)] font-bold rounded-md"
                                    : "text-slate-700 hover:bg-gray-100 rounded-xl cursor-pointer"
                                }`}
                            >
                              {cell.dayNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer: Display Range & Action Buttons */}
                  <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="font-bold text-slate-600">
                      Selected:{" "}
                      <span className="font-extrabold text-slate-900">
                        {tempStartDate && tempEndDate
                          ? `${formatMMDDYYYY(tempStartDate)} to ${formatMMDDYYYY(tempEndDate)}`
                          : tempStartDate
                            ? `${formatMMDDYYYY(tempStartDate)} to ...`
                            : "Select start & end date"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomDateModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCustomDateRange}
                        disabled={!tempStartDate || !tempEndDate}
                        className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold transition-all shadow-md cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
