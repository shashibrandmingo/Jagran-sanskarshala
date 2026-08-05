"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  FaCommentDots,
  FaEnvelope,
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

// Helper to generate days for a month
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
  // State for leads list - fetches directly from MongoDB backend API
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real MongoDB contact leads from backend
  const fetchBackendLeads = async () => {
    setIsLoading(true);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_BASE}/contact/all`);
      const result = await res.json();

      if (res.ok && result.success && result.data?.leads) {
        const apiLeads = result.data.leads.map((item) => ({
          ...item,
          submittedOn: item.createdAt || item.submittedOn || new Date().toISOString(),
        }));
        setLeads(apiLeads);
      } else {
        // Fallback to local storage if API returns empty/error
        const saved = localStorage.getItem("jagran_admin_contact_leads");
        if (saved) {
          setLeads(JSON.parse(saved));
        }
      }
    } catch (err) {
      console.warn("Backend API fetch notice (falling back to local state):", err);
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("jagran_admin_contact_leads");
        if (saved) {
          try {
            setLeads(JSON.parse(saved));
          } catch (e) {
            console.error("Storage parse error", e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendLeads();
  }, []);

  // Filter States
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [dateRangePreset, setDateRangePreset] = useState("All Time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Custom Dropdown Open States
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isShowEntriesOpen, setIsShowEntriesOpen] = useState(false);

  // Custom Calendar Modal State
  const [isCustomCalendarOpen, setIsCustomCalendarOpen] = useState(false);
  const [calBaseDate, setCalBaseDate] = useState(() => new Date());
  const [tempStartDate, setTempStartDate] = useState(() => new Date());
  const [tempEndDate, setTempEndDate] = useState(() => new Date());

  // Submission Details Modal State
  const [activeModalLead, setActiveModalLead] = useState(null);

  const dateRangeRef = useRef(null);
  const subjectRef = useRef(null);
  const showEntriesRef = useRef(null);

  // Click outside listener for all custom dropdowns
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

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    const now = new Date();

    return leads.filter((lead) => {
      // Subject Filter
      if (
        subjectFilter !== "All Subjects" &&
        lead.subject !== subjectFilter
      ) {
        return false;
      }

      // Date Range Preset Filter
      const rawDateStr = lead.createdAt || lead.submittedOn;
      if (!rawDateStr) return true;
      const leadDate = new Date(rawDateStr);
      if (isNaN(leadDate.getTime())) return true;

      if (dateRangePreset === "Today") {
        if (leadDate.toDateString() !== now.toDateString()) return false;
      } else if (dateRangePreset === "Yesterday") {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        if (leadDate.toDateString() !== yest.toDateString()) return false;
      } else if (dateRangePreset === "Last 7 days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        if (leadDate < sevenDaysAgo) return false;
      } else if (dateRangePreset === "Last 30 days") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        if (leadDate < thirtyDaysAgo) return false;
      } else if (dateRangePreset === "This Month") {
        if (
          leadDate.getMonth() !== now.getMonth() ||
          leadDate.getFullYear() !== now.getFullYear()
        )
          return false;
      } else if (dateRangePreset === "Last Month") {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear =
          now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (
          leadDate.getMonth() !== lastMonth ||
          leadDate.getFullYear() !== lastMonthYear
        )
          return false;
      } else if (
        dateRangePreset === "Custom" ||
        dateRangePreset.includes("to") ||
        dateRangePreset.includes("-")
      ) {
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (leadDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (leadDate > toDate) return false;
        }
      }

      return true;
    });
  }, [leads, subjectFilter, dateRangePreset, dateFrom, dateTo]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / entriesPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredLeads.slice(start, start + entriesPerPage);
  }, [filteredLeads, currentPage, entriesPerPage]);

  // Reset page to 1 if current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Handle Preset Click
  const handlePresetSelect = (preset) => {
    setIsDateRangeOpen(false);
    if (preset === "Custom") {
      setIsCustomCalendarOpen(true);
    } else {
      setDateRangePreset(preset);
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

    // Format display string e.g. 07/02/2026 to 08/01/2026
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

  // Open Modal Details
  const handleOpenModal = (lead) => {
    setActiveModalLead(lead);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredLeads.length) {
      alert("No contact leads to export.");
      return;
    }
    const exportData = filteredLeads.map((lead, idx) => ({
      "S.No": idx + 1,
      "Lead ID": lead.leadId || "-",
      "Name": lead.name || "-",
      "Email": lead.email || "-",
      "Mobile": lead.mobile || "-",
      "Subject": lead.subject || "-",
      "Message": lead.message || "-",
      "Submitted On": new Date(lead.submittedOn).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contact Leads");
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Jagran_Contact_Leads_${dateStr}.xlsx`);
  };

  // Reset Filters
  const handleResetFilters = () => {
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
        }) +
        " " +
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch {
      return isoString;
    }
  };

  // Format Helper for Calendar Bottom Selection text
  const formatCalendarRangeText = () => {
    if (!tempStartDate) return "Please select start and end dates";
    const startFmt = `${String(tempStartDate.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(tempStartDate.getDate()).padStart(
      2,
      "0"
    )}/${tempStartDate.getFullYear()}`;

    if (!tempEndDate) return `${startFmt} (Select End Date)`;

    const endFmt = `${String(tempEndDate.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(tempEndDate.getDate()).padStart(
      2,
      "0"
    )}/${tempEndDate.getFullYear()}`;

    return `${startFmt} to ${endFmt}`;
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isFiltered =
    subjectFilter !== "All Subjects" ||
    dateRangePreset !== "All Time" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="space-y-6">
      {/* ── MAIN CARD CONTAINER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-6">
        {/* Top Control Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          {/* Left Group: Date Range + Subject Dropdown + Reset Button */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Custom Date Range Dropdown Component */}
            <div className="relative" ref={dateRangeRef}>
              <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                Date Range / दिनांक सीमा
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsDateRangeOpen(!isDateRangeOpen);
                  setIsSubjectOpen(false);
                  setIsShowEntriesOpen(false);
                }}
                className="bg-white border border-red-500 hover:border-[var(--primary)] px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-800 flex items-center gap-3 shadow-2xs cursor-pointer transition-all min-w-[170px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaCalendarDays className="text-[var(--primary)] text-xs" />
                  <span className="truncate max-w-[140px]">
                    {dateRangePreset}
                  </span>
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
                      (preset === "Custom" &&
                        dateRangePreset.includes("to"));
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
                        {isSelected && (
                          <FaCheck className="text-[var(--primary)] text-xs shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Subject Dropdown Component */}
            <div className="relative" ref={subjectRef}>
              <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                Subject
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSubjectOpen(!isSubjectOpen);
                  setIsDateRangeOpen(false);
                  setIsShowEntriesOpen(false);
                }}
                className="bg-white border border-red-500 hover:border-[var(--primary)] px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-800 flex items-center gap-3 shadow-2xs cursor-pointer transition-all min-w-[170px] justify-between"
              >
                <span className="truncate">{subjectFilter}</span>
                <FaChevronDown
                  className={`text-gray-400 text-[10px] transition-transform duration-200 shrink-0 ${
                    isSubjectOpen ? "rotate-180 text-[var(--primary)]" : ""
                  }`}
                />
              </button>

              {/* Subject Dropdown Menu */}
              {isSubjectOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = subjectFilter === subj;
                    return (
                      <div
                        key={subj}
                        onClick={() => {
                          setSubjectFilter(subj);
                          setIsSubjectOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-red-50 text-[var(--primary)] font-extrabold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{subj}</span>
                        {isSelected && (
                          <FaCheck className="text-[var(--primary)] text-xs shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset Button (Placed right after Subject dropdown) */}
            <div className="flex flex-col justify-end">
              <span className="block text-[10px] font-extrabold text-transparent uppercase tracking-wider mb-1 select-none">
                Reset
              </span>
              <button
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Reset filters"
              >
                <FaArrowRotateLeft className="text-xs" /> Reset
              </button>
            </div>
          </div>

          {/* Right Group: Show entries Dropdown + Export Excel */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Custom Show Entries Dropdown Component */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                Show:
              </span>
              <div className="relative" ref={showEntriesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsShowEntriesOpen(!isShowEntriesOpen);
                    setIsDateRangeOpen(false);
                    setIsSubjectOpen(false);
                  }}
                  className="bg-white border border-gray-200 hover:border-gray-400 px-3.5 py-2 rounded-2xl text-xs font-extrabold text-gray-800 flex items-center gap-2 shadow-2xs cursor-pointer transition-all min-w-[70px] justify-between"
                >
                  <span>{entriesPerPage}</span>
                  <FaChevronDown
                    className={`text-gray-400 text-[10px] transition-transform duration-200 ${
                      isShowEntriesOpen ? "rotate-180 text-[var(--primary)]" : ""
                    }`}
                  />
                </button>

                {/* Show Entries Dropdown Menu */}
                {isShowEntriesOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-red-50 text-[var(--primary)] font-extrabold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{val}</span>
                          {isSelected && (
                            <FaCheck className="text-[var(--primary)] text-[10px]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-gray-500">entries</span>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={handleExport}
              className="bg-white border border-gray-200 hover:border-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-gray-700 shadow-2xs hover:bg-emerald-50/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <FaFileExport className="text-emerald-600 text-sm" /> Export Excel
            </button>
          </div>
        </div>

        {/* ── TABLE DISPLAY ── */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs font-semibold text-gray-700">
            <thead className="bg-gray-50/80 text-gray-400 uppercase font-extrabold border-b border-gray-100">
              <tr>
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
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 font-bold">
                    <div className="max-w-xs mx-auto space-y-3">
                      <FaEnvelope className="text-4xl text-gray-300 mx-auto" />
                      <p className="text-sm font-extrabold text-gray-600">
                        No contact leads found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your subject filter or date range.
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
                paginatedLeads.map((lead) => {
                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-gray-50/90 transition-colors"
                    >
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
                        {lead.subject || "General Inquiry"}
                      </td>

                      {/* Submitted On */}
                      <td className="p-3.5 whitespace-nowrap text-gray-500 font-semibold text-[11px]">
                        {formatDate(lead.submittedOn)}
                      </td>

                      {/* Action (ONLY opens modal when clicked) */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenModal(lead)}
                            className="w-8 h-8 rounded-xl bg-red-50 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="View Submission Details"
                          >
                            <FaEye className="text-xs" />
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
              {filteredLeads.length === 0
                ? 0
                : (currentPage - 1) * entriesPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-black">
              {Math.min(currentPage * entriesPerPage, filteredLeads.length)}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-black">{filteredLeads.length}</span>{" "}
            entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <FaChevronLeft className="text-[10px]" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <div key={page} className="flex items-center gap-1.5">
                    {showEllipsis && (
                      <span className="text-xs text-gray-400 font-bold px-1">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-[var(--primary)] text-white shadow-xs"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CUSTOM DATE RANGE CALENDAR POPUP MODAL (Matching User Screenshot) ── */}
      {isCustomCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-[32px] max-w-3xl w-full shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Modal Top Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                PLEASE SELECT THE DATE RANGE
              </span>
              <button
                onClick={() => setIsCustomCalendarOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <FaXmark className="text-xs" />
              </button>
            </div>

            {/* Dual Month Calendar View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Month 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={() =>
                      setCalBaseDate(
                        new Date(m1Year, m1Month - 1, 1)
                      )
                    }
                    className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
                  >
                    <FaChevronLeft className="text-[10px]" />
                  </button>
                  <h4 className="text-base font-black text-slate-800">
                    {monthNames[m1Month]} {m1Year}
                  </h4>
                  <div className="w-8"></div>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 text-center text-xs font-extrabold text-slate-400">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                    <div key={w} className="py-1">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
                  {m1Days.map((item, idx) => {
                    if (!item.isCurrentMonth) {
                      return (
                        <div
                          key={idx}
                          className="h-9 flex items-center justify-center text-gray-300 font-medium select-none"
                        >
                          {item.day}
                        </div>
                      );
                    }

                    const itemTime = item.date.getTime();
                    const startTime = tempStartDate ? tempStartDate.getTime() : null;
                    const endTime = tempEndDate ? tempEndDate.getTime() : null;

                    const isStart = startTime && itemTime === startTime;
                    const isEnd = endTime && itemTime === endTime;
                    const isInRange =
                      startTime &&
                      endTime &&
                      itemTime > startTime &&
                      itemTime < endTime;

                    return (
                      <div key={idx} className="h-9 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleCalendarDayClick(item.date)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            isStart
                              ? "bg-[#c71518] text-white shadow-md font-black scale-105"
                              : isEnd
                              ? "bg-[#c71518] text-white shadow-md font-black scale-105"
                              : isInRange
                              ? "bg-red-50 text-[#c71518] font-bold w-full rounded-none"
                              : "hover:bg-gray-100 text-slate-800"
                          }`}
                        >
                          {item.day}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Month 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="w-8"></div>
                  <h4 className="text-base font-black text-slate-800">
                    {monthNames[m2Month]} {m2Year}
                  </h4>
                  <button
                    onClick={() =>
                      setCalBaseDate(
                        new Date(m1Year, m1Month + 1, 1)
                      )
                    }
                    className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
                  >
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 text-center text-xs font-extrabold text-slate-400">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                    <div key={w} className="py-1">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
                  {m2Days.map((item, idx) => {
                    if (!item.isCurrentMonth) {
                      return (
                        <div
                          key={idx}
                          className="h-9 flex items-center justify-center text-gray-300 font-medium select-none"
                        >
                          {item.day}
                        </div>
                      );
                    }

                    const itemTime = item.date.getTime();
                    const startTime = tempStartDate ? tempStartDate.getTime() : null;
                    const endTime = tempEndDate ? tempEndDate.getTime() : null;

                    const isStart = startTime && itemTime === startTime;
                    const isEnd = endTime && itemTime === endTime;
                    const isInRange =
                      startTime &&
                      endTime &&
                      itemTime > startTime &&
                      itemTime < endTime;

                    return (
                      <div key={idx} className="h-9 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleCalendarDayClick(item.date)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            isStart
                              ? "bg-[#c71518] text-white shadow-md font-black scale-105"
                              : isEnd
                              ? "bg-[#c71518] text-white shadow-md font-black scale-105"
                              : isInRange
                              ? "bg-red-50 text-[#c71518] font-bold w-full rounded-none"
                              : "hover:bg-gray-100 text-slate-800"
                          }`}
                        >
                          {item.day}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calendar Modal Footer (Selected range text + Cancel & Apply buttons) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-slate-800">
                Selected:{" "}
                <span className="font-black text-slate-900">
                  {formatCalendarRangeText()}
                </span>
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCustomCalendarOpen(false)}
                  className="flex-1 sm:flex-none border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCalendar}
                  className="flex-1 sm:flex-none bg-[#0f172a] text-white px-7 py-2.5 rounded-full text-xs font-black hover:bg-slate-800 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMISSION DETAILS POPUP MODAL (Clean, Rounded, Scrollbar-Free UI) ── */}
      {activeModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-[32px] max-w-lg w-full shadow-2xl shadow-gray-900/20 border border-gray-100 p-6 sm:p-7 space-y-4 relative max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Submission Details
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">
                  ID: {activeModalLead.leadId || "L-NEW"}
                </p>
              </div>
              <button
                onClick={() => setActiveModalLead(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-[var(--primary)] text-gray-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            {/* Form Field Value Pairs */}
            <div className="space-y-2">
              {/* Name */}
              <div className="bg-gray-50/80 hover:bg-gray-100/60 transition-colors rounded-2xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Name</span>
                <span className="text-xs font-black text-gray-900">
                  {activeModalLead.name || "-"}
                </span>
              </div>

              {/* Email */}
              <div className="bg-gray-50/80 hover:bg-gray-100/60 transition-colors rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-gray-500 shrink-0">
                  Email
                </span>
                <span className="text-xs font-black text-gray-900 truncate">
                  {activeModalLead.email || "-"}
                </span>
              </div>

              {/* Mobile */}
              <div className="bg-gray-50/80 hover:bg-gray-100/60 transition-colors rounded-2xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Mobile</span>
                <span className="text-xs font-black text-gray-900 font-mono">
                  {activeModalLead.mobile || "-"}
                </span>
              </div>

              {/* Subject */}
              <div className="bg-gray-50/80 hover:bg-gray-100/60 transition-colors rounded-2xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Subject
                </span>
                <span className="text-xs font-black text-[var(--primary)]">
                  {activeModalLead.subject || "General Inquiry"}
                </span>
              </div>

              {/* Submitted On */}
              <div className="bg-gray-50/80 hover:bg-gray-100/60 transition-colors rounded-2xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Submitted On
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {formatDate(activeModalLead.submittedOn)}
                </span>
              </div>

              {/* Your Message Field (From ContactUs form) */}
              <div className="pt-1.5">
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FaCommentDots className="text-[var(--primary)] text-xs" />
                  Your Message
                </label>
                <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-3.5 text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                  {activeModalLead.message || "No message content submitted."}
                </div>
              </div>
            </div>

            {/* Modal Bottom Button: Close Window */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActiveModalLead(null)}
                className="w-full bg-[var(--primary)] text-white py-3 rounded-2xl text-xs font-extrabold hover:bg-red-700 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
