"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaFileExport,
  FaEye,
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
  FaCheck,
  FaChevronDown,
  FaArrowRotateLeft,
  FaEnvelope,
  FaMagnifyingGlass,
  FaTrash,
  FaArrowsRotate,
  FaSpinner,
} from "react-icons/fa6";
import * as XLSX from "xlsx";

const SUBJECT_OPTIONS = [
  "All Subjects",
  "General Inquiry",
  "School Partnership",
  "Media & Press",
  "Sponsorship",
  "Feedback",
  "Other",
];

const SHOW_ENTRIES_OPTIONS = [10, 25, 50, 100];

// Helper to generate days for calendar grid
function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
      date: new Date(year, month, d),
    });
  }
  // Next month days to make 42 grid items
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }
  return days;
}

export default function ContactLeadsView() {
  const [leads, setLeads] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [dateRangePreset, setDateRangePreset] = useState("All Time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Modal States
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeModalLead, setActiveModalLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Custom Dropdown Open States
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isShowEntriesOpen, setIsShowEntriesOpen] = useState(false);

  // Custom Calendar Modal State
  const [isCustomCalendarOpen, setIsCustomCalendarOpen] = useState(false);
  const [calBaseDate, setCalBaseDate] = useState(() => new Date());
  const [tempStartDate, setTempStartDate] = useState(() => new Date());
  const [tempEndDate, setTempEndDate] = useState(() => new Date());

  const dateRangeRef = useRef(null);
  const subjectRef = useRef(null);
  const showEntriesRef = useRef(null);

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated leads from backend (Ultra-fast server-side queries)
  const fetchBackendLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (subjectFilter && subjectFilter !== "All Subjects") params.append("subject", subjectFilter);
      if (dateFrom) params.append("startDate", dateFrom);
      if (dateTo) params.append("endDate", dateTo);

      const res = await fetch(`${BACKEND}/api/v1/contact/all?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin-login";
        return;
      }

      const result = await res.json();
      if (res.ok && result.success && result.data) {
        const apiLeads = (result.data.leads || []).map((item) => ({
          ...item,
          submittedOn: item.createdAt || item.submittedOn || new Date().toISOString(),
        }));
        setLeads(apiLeads);
        setTotalRecords(result.data.total || 0);
        setTotalPages(result.data.totalPages || 1);
      } else {
        setLeads([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.warn("Backend API fetch notice:", err);
      setLeads([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND, currentPage, entriesPerPage, debouncedSearch, subjectFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBackendLeads();
  }, [fetchBackendLeads]);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(e.target)) {
        setIsDateRangeOpen(false);
      }
      if (subjectRef.current && !subjectRef.current.contains(e.target)) {
        setIsSubjectOpen(false);
      }
      if (showEntriesRef.current && !showEntriesRef.current.contains(e.target)) {
        setIsShowEntriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Delete single contact lead
  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      const res = await fetch(`${BACKEND}/api/v1/contact/${leadToDelete._id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setLeads((prev) => prev.filter((item) => item._id !== leadToDelete._id));
        setSelectedRows((prev) => prev.filter((id) => id !== leadToDelete._id));
        setTotalRecords((prev) => Math.max(0, prev - 1));
        setLeadToDelete(null);
      } else {
        alert("Failed to delete contact lead");
      }
    } catch (err) {
      console.error("Delete lead error:", err);
      alert("Error deleting contact lead");
    } finally {
      setIsDeleting(false);
    }
  };

  // Row selection helpers
  const isAllSelected =
    leads.length > 0 && leads.every((row) => selectedRows.includes(row._id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = leads.map((row) => row._id);
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(leads.map((row) => row._id));
      setSelectedRows((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick Preset Selection Logic
  const handlePresetSelect = (preset) => {
    setIsDateRangeOpen(false);
    setDateRangePreset(preset);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (preset === "Today") {
      setDateFrom(todayStr);
      setDateTo(todayStr);
      setCurrentPage(1);
    } else if (preset === "Yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setDateFrom(yStr);
      setDateTo(yStr);
      setCurrentPage(1);
    } else if (preset === "Last 7 days") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      setDateFrom(past7.toISOString().split("T")[0]);
      setDateTo(todayStr);
      setCurrentPage(1);
    } else if (preset === "Last 30 days") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      setDateFrom(past30.toISOString().split("T")[0]);
      setDateTo(todayStr);
      setCurrentPage(1);
    } else if (preset === "This Month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFrom(firstDay.toISOString().split("T")[0]);
      setDateTo(lastDay.toISOString().split("T")[0]);
      setCurrentPage(1);
    } else if (preset === "Last Month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setDateFrom(firstDay.toISOString().split("T")[0]);
      setDateTo(lastDay.toISOString().split("T")[0]);
      setCurrentPage(1);
    } else if (preset === "Custom") {
      setIsCustomCalendarOpen(true);
    } else {
      // All Time
      setDateFrom("");
      setDateTo("");
      setCurrentPage(1);
    }
  };

  // Calendar Day Selection Click
  const handleCalendarDayClick = (dateObj) => {
    const target = new Date(dateObj);
    target.setHours(0, 0, 0, 0);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(target);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      if (target < tempStartDate) {
        setTempStartDate(target);
        setTempEndDate(null);
      } else {
        setTempEndDate(target);
      }
    }
  };

  // Apply Calendar Custom Range
  const handleApplyCalendar = () => {
    if (!tempStartDate) return;
    const start = tempStartDate;
    const end = tempEndDate || tempStartDate;

    const fromISO = start.toISOString().split("T")[0];
    const toISO = end.toISOString().split("T")[0];

    setDateFrom(fromISO);
    setDateTo(toISO);

    const fmtStart = `${String(start.getMonth() + 1).padStart(2, "0")}/${String(
      start.getDate()
    ).padStart(2, "0")}/${start.getFullYear()}`;
    const fmtEnd = `${String(end.getMonth() + 1).padStart(2, "0")}/${String(
      end.getDate()
    ).padStart(2, "0")}/${end.getFullYear()}`;

    setDateRangePreset(`${fmtStart} to ${fmtEnd}`);
    setIsCustomCalendarOpen(false);
    setCurrentPage(1);
  };

  // Ultra-Fast Export Function (Selected Leads -> Excel, All Leads -> High Performance CSV Stream)
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Case 1: Export Selected Leads
      if (selectedRows.length > 0) {
        const selectedItems = leads.filter((row) => selectedRows.includes(row._id));
        if (!selectedItems.length) {
          alert("Selected leads not found on current view.");
          return;
        }

        const exportData = selectedItems.map((lead, idx) => ({
          "S.No": idx + 1,
          "Lead ID": lead.leadId || "-",
          "Name": lead.name || "-",
          "Email Address": lead.email || "-",
          "Mobile Number": lead.mobile || "-",
          "Subject": lead.subject || "-",
          "Message Content": lead.message || "-",
          "Submitted On": new Date(lead.submittedOn).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          }),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contact Leads");
        const dateStr = new Date().toISOString().split("T")[0];
        XLSX.writeFile(wb, `Jagran_Contact_Leads_Selected_${selectedRows.length}_${dateStr}.xlsx`);
        return;
      }

      // Case 2: Export All Filtered Leads via Streaming Backend API (Zero RAM spike, <10MB memory)
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (subjectFilter && subjectFilter !== "All Subjects") params.append("subject", subjectFilter);
      if (dateFrom) params.append("startDate", dateFrom);
      if (dateTo) params.append("endDate", dateTo);

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const downloadUrl = `${BACKEND}/api/v1/contact/export?${params.toString()}`;

      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to generate export file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Jagran_Contact_Leads_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting leads: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSubjectFilter("All Subjects");
    setDateRangePreset("All Time");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }) +
        ", " +
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
    } catch (e) {
      return isoString || "-";
    }
  };

  // Months for Calendar View
  const m1Year = calBaseDate.getFullYear();
  const m1Month = calBaseDate.getMonth();
  const m2Date = new Date(m1Year, m1Month + 1, 1);
  const m2Year = m2Date.getFullYear();
  const m2Month = m2Date.getMonth();

  const m1Days = getMonthDays(m1Year, m1Month);
  const m2Days = getMonthDays(m2Year, m2Month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isFiltered =
    searchQuery.trim() !== "" ||
    subjectFilter !== "All Subjects" ||
    dateRangePreset !== "All Time" ||
    dateFrom !== "" ||
    dateTo !== "";

  const startIndex = (currentPage - 1) * entriesPerPage;

  return (
    <div className="space-y-6">
      {/* ── MAIN CARD CONTAINER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-6">
        {/* Top Control Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          {/* Left Group: Date Range + Subject Dropdown + Search + Reset */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Custom Date Range Dropdown */}
            <div className="relative" ref={dateRangeRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDateRangeOpen(!isDateRangeOpen);
                  setIsSubjectOpen(false);
                  setIsShowEntriesOpen(false);
                }}
                className="bg-white border border-gray-200 hover:border-[var(--primary)] px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-800 flex items-center gap-2.5 shadow-2xs cursor-pointer transition-all min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaCalendarDays className="text-[var(--primary)] text-xs" />
                  <span className="truncate max-w-[130px]">{dateRangePreset}</span>
                </div>
                <FaChevronDown
                  className={`text-gray-400 text-[10px] transition-transform duration-200 shrink-0 ${
                    isDateRangeOpen ? "rotate-180 text-[var(--primary)]" : ""
                  }`}
                />
              </button>

              {/* Date Range Dropdown Menu */}
              {isDateRangeOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {[
                    "All Time",
                    "Today",
                    "Yesterday",
                    "Last 7 days",
                    "Last 30 days",
                    "This Month",
                    "Last Month",
                    "Custom",
                  ].map((preset) => {
                    const isSelected =
                      dateRangePreset === preset ||
                      (preset === "Custom" && dateRangePreset.includes("to"));
                    return (
                      <div
                        key={preset}
                        onClick={() => handlePresetSelect(preset)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-red-50 text-[var(--primary)] font-extrabold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{preset}</span>
                        {isSelected && <FaCheck className="text-[var(--primary)] text-xs" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subject Filter Dropdown */}
            <div className="relative" ref={subjectRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSubjectOpen(!isSubjectOpen);
                  setIsDateRangeOpen(false);
                  setIsShowEntriesOpen(false);
                }}
                className="bg-white border border-gray-200 hover:border-[var(--primary)] px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-800 flex items-center gap-2.5 shadow-2xs cursor-pointer transition-all min-w-[160px] justify-between"
              >
                <span className="truncate max-w-[130px]">{subjectFilter}</span>
                <FaChevronDown
                  className={`text-gray-400 text-[10px] transition-transform duration-200 shrink-0 ${
                    isSubjectOpen ? "rotate-180 text-[var(--primary)]" : ""
                  }`}
                />
              </button>

              {isSubjectOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isSelected = subjectFilter === sub;
                    return (
                      <div
                        key={sub}
                        onClick={() => {
                          setSubjectFilter(sub);
                          setIsSubjectOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-red-50 text-[var(--primary)] font-extrabold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{sub}</span>
                        {isSelected && <FaCheck className="text-[var(--primary)] text-xs" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 min-w-[200px]">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search by name, mobile, email, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
              />
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <FaArrowRotateLeft className="text-[10px]" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right Group: Refresh + Show Entries + Export Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={fetchBackendLeads}
              disabled={isLoading}
              className="p-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              title="Refresh latest leads"
            >
              <FaArrowsRotate className={`text-xs ${isLoading ? "animate-spin text-[var(--primary)]" : ""}`} />
            </button>

            {/* Show Entries Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 hidden sm:inline">Show</span>
              <div className="relative" ref={showEntriesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsShowEntriesOpen(!isShowEntriesOpen);
                    setIsDateRangeOpen(false);
                    setIsSubjectOpen(false);
                  }}
                  className="bg-white border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl text-xs font-extrabold text-gray-800 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <span>{entriesPerPage}</span>
                  <FaChevronDown className="text-gray-400 text-[9px]" />
                </button>

                {isShowEntriesOpen && (
                  <div className="absolute right-0 top-full mt-1 z-40 w-24 bg-white rounded-xl shadow-xl border border-gray-100 p-1 space-y-0.5">
                    {SHOW_ENTRIES_OPTIONS.map((val) => {
                      const isSelected = entriesPerPage === val;
                      return (
                        <div
                          key={val}
                          onClick={() => {
                            setEntriesPerPage(val);
                            setIsShowEntriesOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-red-50 text-[var(--primary)] font-extrabold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{val}</span>
                          {isSelected && <FaCheck className="text-[var(--primary)] text-[10px]" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Export Excel / CSV Button */}
            <button
              onClick={handleExport}
              disabled={isExporting || totalRecords === 0}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRows.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 hover:bg-emerald-50/50"
              }`}
            >
              {isExporting ? (
                <FaSpinner className="animate-spin text-sm text-[var(--primary)]" />
              ) : (
                <FaFileExport className={selectedRows.length > 0 ? "text-white text-sm" : "text-emerald-600 text-sm"} />
              )}
              <span>
                {isExporting
                  ? "Exporting..."
                  : selectedRows.length > 0
                  ? `Export Selected (${selectedRows.length})`
                  : `Export All (${totalRecords})`}
              </span>
            </button>
          </div>
        </div>

        {/* ── TABLE DISPLAY ── */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs font-semibold text-gray-700">
            <thead className="bg-[#faf4ed] text-gray-700 uppercase font-black text-[11px] tracking-wider border-b border-[#f5e6d6]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded-md text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Lead ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-4 mx-auto" /></td>
                    <td className="p-3.5"><div className="h-5 bg-gray-200 rounded-lg w-16" /></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-300 rounded-md w-28" /></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded-md w-36" /></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded-md w-24" /></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded-md w-28" /></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded-md w-24" /></td>
                    <td className="p-3.5 text-center"><div className="w-6 h-6 bg-gray-200 rounded-md mx-auto" /></td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400 font-bold">
                    <div className="max-w-xs mx-auto space-y-3">
                      <FaEnvelope className="text-4xl text-gray-300 mx-auto" />
                      <p className="text-sm font-extrabold text-gray-600">
                        No contact leads found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search query, subject filter, or date range.
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedRows.includes(lead._id);
                  return (
                    <tr
                      key={lead._id}
                      className={`hover:bg-red-50/30 transition-colors ${
                        isSelected ? "bg-red-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(lead._id)}
                          className="w-4 h-4 rounded-md text-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                        />
                      </td>

                      {/* Lead ID */}
                      <td className="p-3.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-[11px] border border-gray-200 font-bold">
                          {lead.leadId || "L-NEW"}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                        {lead.name}
                      </td>

                      {/* Email */}
                      <td className="p-3.5 font-medium text-gray-600 truncate max-w-[200px]">
                        {lead.email || "-"}
                      </td>

                      {/* Mobile */}
                      <td className="p-3.5 font-mono text-gray-800 whitespace-nowrap font-bold">
                        {lead.mobile || "-"}
                      </td>

                      {/* Subject */}
                      <td className="p-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                          {lead.subject || "General Inquiry"}
                        </span>
                      </td>

                      {/* Submitted On */}
                      <td className="p-3.5 whitespace-nowrap text-gray-500 font-semibold text-[11px]">
                        {formatDate(lead.submittedOn)}
                      </td>

                      {/* Actions: View Details & Delete */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveModalLead(lead)}
                            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="View Submission Details"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Delete Lead"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500">
            Showing{" "}
            <span className="text-gray-900 font-black">
              {totalRecords === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-black">
              {Math.min(startIndex + entriesPerPage, totalRecords)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-black">{totalRecords.toLocaleString()}</span>{" "}
            entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === 1 || isLoading
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
                    disabled={isLoading}
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

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors cursor-pointer ${
                currentPage >= totalPages || isLoading
                  ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CUSTOM DATE RANGE MODAL ── */}
      {isCustomCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full border border-gray-100 relative">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-6">
              Please select the date range
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Month 1 */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCalBaseDate(new Date(m1Year, m1Month - 1, 1))
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    <span className="text-sm font-extrabold text-slate-900">
                      {monthNames[m1Month]} {m1Year}
                    </span>
                    <div className="w-8 md:hidden" />
                  </div>

                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {m1Days.map((cell, idx) => {
                      const isStart = tempStartDate && cell.date.getTime() === tempStartDate.getTime();
                      const isEnd = tempEndDate && cell.date.getTime() === tempEndDate.getTime();
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
                          className={`h-9 flex items-center justify-center text-xs font-bold transition-all ${
                            !cell.isCurrentMonth
                              ? "text-gray-300 cursor-default"
                              : isStart || isEnd
                              ? "bg-[var(--primary)] text-white font-extrabold rounded-full shadow-sm z-10"
                              : isInRange
                              ? "bg-red-50 text-[var(--primary)] font-bold rounded-lg"
                              : "text-slate-700 hover:bg-gray-100 rounded-full cursor-pointer"
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Month 2 */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="w-8 hidden md:block" />
                    <span className="text-sm font-extrabold text-slate-900">
                      {monthNames[m2Month]} {m2Year}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCalBaseDate(new Date(m1Year, m1Month + 1, 1))
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {m2Days.map((cell, idx) => {
                      const isStart = tempStartDate && cell.date.getTime() === tempStartDate.getTime();
                      const isEnd = tempEndDate && cell.date.getTime() === tempEndDate.getTime();
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
                          className={`h-9 flex items-center justify-center text-xs font-bold transition-all ${
                            !cell.isCurrentMonth
                              ? "text-gray-300 cursor-default"
                              : isStart || isEnd
                              ? "bg-[var(--primary)] text-white font-extrabold rounded-full shadow-sm z-10"
                              : isInRange
                              ? "bg-red-50 text-[var(--primary)] font-bold rounded-lg"
                              : "text-slate-700 hover:bg-gray-100 rounded-full cursor-pointer"
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-5 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="font-bold text-slate-600">
                  Selected Range:{" "}
                  <span className="font-extrabold text-slate-900">
                    {tempStartDate && tempEndDate
                      ? `${tempStartDate.toLocaleDateString()} to ${tempEndDate.toLocaleDateString()}`
                      : tempStartDate
                      ? `${tempStartDate.toLocaleDateString()} to ...`
                      : "Select start & end date"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCustomCalendarOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCalendar}
                    disabled={!tempStartDate}
                    className="px-7 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold transition-all shadow-md cursor-pointer"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL (VIEW SUBMISSION LEAD) ── */}
      {activeModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl w-full border border-gray-100 relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Lead Details / लीड विवरण
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                  {activeModalLead.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalLead(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <FaXmark className="text-xs" />
              </button>
            </div>

            {/* Modal Content Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-0.5">
                  Lead ID
                </span>
                <span className="font-mono text-slate-900 font-extrabold text-sm">
                  {activeModalLead.leadId || "L-NEW"}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-0.5">
                  Subject Category
                </span>
                <span className="text-[var(--primary)] font-black text-sm">
                  {activeModalLead.subject || "General Inquiry"}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-0.5">
                  Mobile Number
                </span>
                <span className="font-mono text-slate-900 font-extrabold">
                  {activeModalLead.mobile || "-"}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-0.5">
                  Email Address
                </span>
                <span className="text-slate-900 font-extrabold truncate block">
                  {activeModalLead.email || "-"}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 sm:col-span-2">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-0.5">
                  Submitted On
                </span>
                <span className="text-slate-900 font-bold">
                  {formatDate(activeModalLead.submittedOn)}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 sm:col-span-2 space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase font-extrabold mb-1">
                  Message Content / सन्देश
                </span>
                <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-gray-200/60 text-xs">
                  {activeModalLead.message || "No message provided."}
                </p>
              </div>
            </div>

            {/* Modal Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalLead(null)}
                className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE DELETE CONFIRMATION MODAL ── */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto">
              <FaTrash />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">Delete Contact Lead</h3>
              <p className="text-xs text-gray-500 font-medium">
                Are you sure you want to delete the contact inquiry from{" "}
                <span className="font-extrabold text-gray-800">{leadToDelete.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-extrabold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLead}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
