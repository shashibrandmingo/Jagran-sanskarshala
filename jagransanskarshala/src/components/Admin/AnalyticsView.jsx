"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  FaCalendarDays,
  FaRegCalendar,
  FaSliders,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaRotateLeft,
  FaCheck,
  FaXmark,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChartColumn,
  FaInbox,
} from "react-icons/fa6";
import schoolsData from "@/data/schoolsData.json";

// Calendar Helpers
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

const formatShortDate = (d) => {
  if (!d) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      date: new Date(year, month, d),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }
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

export default function AnalyticsView({ liveSurveys = [] }) {
  // Comparison Mode: "week" (Week vs Week) | "month" (Month vs Month) | "custom" (Custom Range A vs B)
  const [comparisonMode, setComparisonMode] = useState("month");
  const [viewBy, setViewBy] = useState("State"); // State | City | Category
  const [selectedStateFilter, setSelectedStateFilter] = useState("All");
  const [selectedCityFilter, setSelectedCityFilter] = useState("All");

  // Custom Calendar Modal State
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [activeCustomPeriodTarget, setActiveCustomPeriodTarget] = useState("A"); // "A" or "B"
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

  // Custom Ranges
  const [customRangeA, setCustomRangeA] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 14)),
    end: new Date(),
  });
  const [customRangeB, setCustomRangeB] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 29)),
    end: new Date(new Date().setDate(new Date().getDate() - 15)),
  });

  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  // Reset Filters Action
  const handleResetFilter = () => {
    setComparisonMode("month");
    setViewBy("State");
    setSelectedStateFilter("All");
    setSelectedCityFilter("All");
    setCustomRangeA({
      start: new Date(new Date().setDate(new Date().getDate() - 14)),
      end: new Date(),
    });
    setCustomRangeB({
      start: new Date(new Date().setDate(new Date().getDate() - 29)),
      end: new Date(new Date().setDate(new Date().getDate() - 15)),
    });
  };

  // States & Cities list from schoolsData.json
  const availableStates = useMemo(() => {
    if (!schoolsData) return [];
    return Object.keys(schoolsData);
  }, []);

  const availableCities = useMemo(() => {
    if (!schoolsData) return [];
    if (selectedStateFilter !== "All" && schoolsData[selectedStateFilter]) {
      return Object.keys(schoolsData[selectedStateFilter]);
    }
    const citySet = new Set();
    Object.values(schoolsData).forEach((stateObj) => {
      if (stateObj && typeof stateObj === "object") {
        Object.keys(stateObj).forEach((city) => citySet.add(city));
      }
    });
    return Array.from(citySet);
  }, [selectedStateFilter]);

  // Calculate Date Bounds for Period A and Period B
  const periodBounds = useMemo(() => {
    const now = new Date();

    if (comparisonMode === "week") {
      // Current Week (Period A)
      const startA = new Date(now);
      const day = now.getDay();
      startA.setDate(now.getDate() - day);
      startA.setHours(0, 0, 0, 0);
      const endA = new Date(now);

      // Previous Week (Period B)
      const startB = new Date(startA);
      startB.setDate(startA.getDate() - 7);
      startB.setHours(0, 0, 0, 0);

      const endB = new Date(startA);
      endB.setMilliseconds(-1);

      return {
        labelA: `This Week (${formatShortDate(startA)} - ${formatShortDate(endA)})`,
        labelB: `Previous Week (${formatShortDate(startB)} - ${formatShortDate(endB)})`,
        startA,
        endA,
        startB,
        endB,
      };
    }

    if (comparisonMode === "month") {
      // Current Month (Period A)
      const startA = new Date(now.getFullYear(), now.getMonth(), 1);
      const endA = new Date(now);

      // Previous Month (Period B)
      const startB = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endB = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      return {
        labelA: `This Month (${formatShortDate(startA)} - ${formatShortDate(endA)})`,
        labelB: `Previous Month (${formatShortDate(startB)} - ${formatShortDate(endB)})`,
        startA,
        endA,
        startB,
        endB,
      };
    }

    // Custom Range Comparison
    return {
      labelA: `Period A (${formatShortDate(customRangeA.start)} - ${formatShortDate(customRangeA.end)})`,
      labelB: `Period B (${formatShortDate(customRangeB.start)} - ${formatShortDate(customRangeB.end)})`,
      startA: customRangeA.start,
      endA: customRangeA.end,
      startB: customRangeB.start,
      endB: customRangeB.end,
    };
  }, [comparisonMode, customRangeA, customRangeB]);

  // Filter Surveys for Period A & Period B
  const surveysA = useMemo(() => {
    if (!Array.isArray(liveSurveys)) return [];

    return liveSurveys.filter((item) => {
      const itemDateStr = item.createdAt || item.submittedOn;
      if (itemDateStr) {
        const itemDate = new Date(itemDateStr);
        if (!isNaN(itemDate.getTime())) {
          if (itemDate < periodBounds.startA || itemDate > periodBounds.endA) return false;
        }
      }

      if (selectedStateFilter !== "All" && item.state) {
        if (selectedStateFilter === "Others") {
          const isStandardState = availableStates.some(
            (st) => st.toLowerCase() === item.state.trim().toLowerCase()
          );
          if (isStandardState) return false;
        } else {
          if (item.state.trim().toLowerCase() !== selectedStateFilter.toLowerCase()) return false;
        }
      }

      if (selectedCityFilter !== "All" && item.city) {
        if (selectedCityFilter === "Others") {
          const isStandardCity = availableCities.some(
            (c) => c.toLowerCase() === item.city.trim().toLowerCase()
          );
          if (isStandardCity) return false;
        } else {
          if (item.city.trim().toLowerCase() !== selectedCityFilter.toLowerCase()) return false;
        }
      }

      return true;
    });
  }, [liveSurveys, periodBounds, selectedStateFilter, selectedCityFilter, availableStates, availableCities]);

  const surveysB = useMemo(() => {
    if (!Array.isArray(liveSurveys)) return [];

    return liveSurveys.filter((item) => {
      const itemDateStr = item.createdAt || item.submittedOn;
      if (itemDateStr) {
        const itemDate = new Date(itemDateStr);
        if (!isNaN(itemDate.getTime())) {
          if (itemDate < periodBounds.startB || itemDate > periodBounds.endB) return false;
        }
      }

      if (selectedStateFilter !== "All" && item.state) {
        if (selectedStateFilter === "Others") {
          const isStandardState = availableStates.some(
            (st) => st.toLowerCase() === item.state.trim().toLowerCase()
          );
          if (isStandardState) return false;
        } else {
          if (item.state.trim().toLowerCase() !== selectedStateFilter.toLowerCase()) return false;
        }
      }

      if (selectedCityFilter !== "All" && item.city) {
        if (selectedCityFilter === "Others") {
          const isStandardCity = availableCities.some(
            (c) => c.toLowerCase() === item.city.trim().toLowerCase()
          );
          if (isStandardCity) return false;
        } else {
          if (item.city.trim().toLowerCase() !== selectedCityFilter.toLowerCase()) return false;
        }
      }

      return true;
    });
  }, [liveSurveys, periodBounds, selectedStateFilter, selectedCityFilter, availableStates, availableCities]);

  // Aggregate Comparison Data per Location/Category for Dual Bars
  const comparisonData = useMemo(() => {
    const countsA = {};
    const countsB = {};
    const keyField = viewBy === "State" ? "state" : viewBy === "City" ? "city" : "type";

    surveysA.forEach((item) => {
      let val = item[keyField] && String(item[keyField]).trim() ? String(item[keyField]).trim() : "Other / अन्य";
      countsA[val] = (countsA[val] || 0) + 1;
    });

    surveysB.forEach((item) => {
      let val = item[keyField] && String(item[keyField]).trim() ? String(item[keyField]).trim() : "Other / अन्य";
      countsB[val] = (countsB[val] || 0) + 1;
    });

    const allKeys = Array.from(new Set([...Object.keys(countsA), ...Object.keys(countsB)]));

    return allKeys
      .map((name) => {
        const countA = countsA[name] || 0;
        const countB = countsB[name] || 0;
        const diff = countA - countB;
        const growthPct = countB > 0 ? ((diff / countB) * 100).toFixed(1) : countA > 0 ? "+100" : "0";
        return { name, countA, countB, diff, growthPct };
      })
      .sort((a, b) => b.countA - a.countA);
  }, [surveysA, surveysB, viewBy]);

  // Top Summary Metric Comparisons
  const summaryMetrics = useMemo(() => {
    const totalA = surveysA.length;
    const totalB = surveysB.length;
    const totalDiff = totalA - totalB;
    const totalGrowth = totalB > 0 ? ((totalDiff / totalB) * 100).toFixed(1) : totalA > 0 ? "+100" : "0";

    const parentsA = surveysA.filter((s) => s.type === "Parent").length;
    const parentsB = surveysB.filter((s) => s.type === "Parent").length;

    const studentsA = surveysA.filter((s) => s.type === "Student").length;
    const studentsB = surveysB.filter((s) => s.type === "Student").length;

    return {
      totalA,
      totalB,
      totalDiff,
      totalGrowth,
      parentsA,
      parentsB,
      studentsA,
      studentsB,
    };
  }, [surveysA, surveysB]);

  // Max value for Y-axis scale across both Period A & Period B
  const maxCount = useMemo(() => {
    if (!comparisonData.length) return 5;
    const maxVal = Math.max(
      ...comparisonData.map((d) => Math.max(d.countA, d.countB)),
      1
    );
    if (maxVal <= 5) return 5;
    if (maxVal <= 10) return 10;
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    if (maxVal <= 500) return 500;
    if (maxVal <= 1000) return 1000;
    return Math.ceil(maxVal / 5000) * 5000 || 25000;
  }, [comparisonData]);

  // Handle Opening Custom Calendar Modal
  const openCustomCalendar = (targetPeriod) => {
    setActiveCustomPeriodTarget(targetPeriod);
    const targetRange = targetPeriod === "A" ? customRangeA : customRangeB;
    setTempStartDate(targetRange.start);
    setTempEndDate(targetRange.end);
    setShowCustomDateModal(true);
  };

  // Handle Day Click in Calendar Modal
  const handleCalendarDayClick = (dateObj) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(dateObj);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      if (dateObj < tempStartDate) {
        setTempStartDate(dateObj);
        setTempEndDate(null);
      } else {
        setTempEndDate(dateObj);
      }
    }
  };

  // Apply Custom Date Range
  const handleApplyCustomDateRange = () => {
    if (tempStartDate && tempEndDate) {
      if (activeCustomPeriodTarget === "A") {
        setCustomRangeA({ start: tempStartDate, end: tempEndDate });
      } else {
        setCustomRangeB({ start: tempStartDate, end: tempEndDate });
      }
      setComparisonMode("custom");
      setShowCustomDateModal(false);
    }
  };

  const visibleBars = comparisonData.slice(0, 10);

  return (
    <div className="space-y-6 text-gray-800">
      {/* Top Header Row with Reset Filters Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 -mt-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Leads Comparison Analytics
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-0.5">
            सर्वे आंकड़ों की तुलना (Period A vs Period B)
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetFilter}
          className="bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-2xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 self-end sm:self-auto"
          title="Reset all comparison filters"
        >
          <FaRotateLeft className="text-[var(--primary)] text-xs" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Mode & Filter Selection Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-200/80 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          {/* Comparison Mode Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/70">
            <button
              type="button"
              onClick={() => setComparisonMode("month")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                comparisonMode === "month"
                  ? "bg-white text-[var(--primary)] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaCalendarDays className="text-xs" />
              <span>Month vs Month (माह तुलना)</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode("week")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                comparisonMode === "week"
                  ? "bg-white text-[var(--primary)] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaRegCalendar className="text-xs" />
              <span>Week vs Week (सप्ताह तुलना)</span>
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode("custom")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                comparisonMode === "custom"
                  ? "bg-white text-[var(--primary)] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaSliders className="text-xs" />
              <span>Custom Range vs Range</span>
            </button>
          </div>

          {/* View By Selector */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs font-bold text-gray-500 shrink-0">View By:</span>
            <div className="relative">
              <select
                value={viewBy}
                onChange={(e) => setViewBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-extrabold bg-white text-slate-800 appearance-none focus:outline-none focus:border-[var(--primary)] transition-all pr-8 cursor-pointer"
              >
                <option value="State">State / राज्य</option>
                <option value="City">City / शहर</option>
                <option value="Category">Category / श्रेणी</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Custom Ranges Trigger Bar (Only shown in Custom Mode) */}
        {comparisonMode === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Period A (Primary Range)
              </label>
              <button
                type="button"
                onClick={() => openCustomCalendar("A")}
                className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 flex items-center justify-between hover:border-[var(--primary)] cursor-pointer"
              >
                <span className="truncate">{periodBounds.labelA}</span>
                <FaCalendarDays className="text-gray-400 text-xs shrink-0 ml-2" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Period B (Comparison Range)
              </label>
              <button
                type="button"
                onClick={() => openCustomCalendar("B")}
                className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-800 flex items-center justify-between hover:border-slate-800 cursor-pointer"
              >
                <span className="truncate">{periodBounds.labelB}</span>
                <FaCalendarDays className="text-gray-400 text-xs shrink-0 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-Filters: State & City Dropdowns */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 text-xs font-bold text-gray-500 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="shrink-0">State:</span>
              <select
                value={selectedStateFilter}
                onChange={(e) => {
                  setSelectedStateFilter(e.target.value);
                  setSelectedCityFilter("All");
                }}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-slate-800 cursor-pointer"
              >
                <option value="All">All States / सभी राज्य</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
                <option value="Others">Others / अन्य</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0">City:</span>
              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-slate-800 cursor-pointer"
              >
                <option value="All">All Cities / सभी शहर</option>
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
                <option value="Others">Others / अन्य</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Submissions Comparison Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Submissions
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                Number(summaryMetrics.totalGrowth) >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {Number(summaryMetrics.totalGrowth) >= 0 ? (
                <FaArrowTrendUp className="text-[10px]" />
              ) : (
                <FaArrowTrendDown className="text-[10px]" />
              )}
              {summaryMetrics.totalGrowth}%
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-2xl font-black text-gray-900">
                {summaryMetrics.totalA.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[var(--primary)] mt-0.5">
                Period A (Current)
              </div>
            </div>
            <div className="text-right border-l border-gray-100 pl-4">
              <div className="text-xl font-bold text-slate-500">
                {summaryMetrics.totalB.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                Period B (Previous)
              </div>
            </div>
          </div>
        </div>

        {/* Parent Submissions Comparison Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Parent Submissions
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-2xl font-black text-blue-600">
                {summaryMetrics.parentsA.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-blue-500 mt-0.5">
                Period A (Current)
              </div>
            </div>
            <div className="text-right border-l border-gray-100 pl-4">
              <div className="text-xl font-bold text-slate-500">
                {summaryMetrics.parentsB.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                Period B (Previous)
              </div>
            </div>
          </div>
        </div>

        {/* Student Submissions Comparison Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Student Submissions
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {summaryMetrics.studentsA.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-emerald-500 mt-0.5">
                Period A (Current)
              </div>
            </div>
            <div className="text-right border-l border-gray-100 pl-4">
              <div className="text-xl font-bold text-slate-500">
                {summaryMetrics.studentsB.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                Period B (Previous)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Grouped Bar Chart (Rectangular Columns - Screenshot 3 Match) */}
      <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-xs border border-gray-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-gray-900">
              Comparative Breakdown by {viewBy}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Period A (Red) vs Period B (Slate Navy) side-by-side comparison
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-extrabold bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200/60 self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[var(--primary)] inline-block" />
              <span className="text-gray-800">Period A</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#0f172a] inline-block" />
              <span className="text-gray-800">Period B</span>
            </div>
          </div>
        </div>

        {comparisonData.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/60 rounded-3xl border border-dashed border-gray-200 my-4">
            <FaInbox className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-gray-700">No Comparison Data</h3>
            <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto mt-1">
              No survey entries recorded for the selected comparison date ranges.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 pt-6 space-y-3 shadow-2xs">
              {/* Bars Grid Area */}
              <div className="relative h-64 w-full flex items-end justify-between border-b border-gray-200 pl-10 pr-2">
                {/* Y-Axis Grid Lines & Scale Markers */}
                {[...Array(6)].map((_, i) => {
                  const val = Math.round((maxCount / 5) * (5 - i));
                  const label =
                    val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : val >= 1000
                      ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`
                      : `${val}`;
                  const topPct = (i / 5) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 flex items-center text-[10px] font-bold text-gray-400 pointer-events-none"
                      style={{ top: `${topPct}%` }}
                    >
                      <span className="w-8 text-right pr-2 shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 border-b border-dashed border-gray-200/80" />
                    </div>
                  );
                })}

                {/* Side-by-Side Dual Bar Group Container */}
                <div className="w-full h-full flex items-end justify-around gap-2 sm:gap-6 relative z-10">
                  {visibleBars.map((item, idx) => {
                    const heightPctA = Math.max(
                      (item.countA / maxCount) * 100,
                      item.countA > 0 ? 6 : 0
                    );
                    const heightPctB = Math.max(
                      (item.countB / maxCount) * 100,
                      item.countB > 0 ? 6 : 0
                    );

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex items-end justify-center gap-1 h-full group relative"
                      >
                        {/* Bar A (Period A - Primary Red) */}
                        <div className="flex-1 flex flex-col items-center justify-end h-full max-w-[24px]">
                          <span className="text-[9px] sm:text-[10px] font-black text-gray-800 mb-1 group-hover:text-[var(--primary)]">
                            {item.countA}
                          </span>
                          <div
                            className="w-full bg-[var(--primary)] hover:bg-red-700 transition-all rounded-t-xs cursor-pointer shadow-2xs"
                            style={{ height: `${heightPctA}%` }}
                            title={`Period A - ${item.name}: ${item.countA} submissions`}
                          />
                        </div>

                        {/* Bar B (Period B - Dark Slate Navy) */}
                        <div className="flex-1 flex flex-col items-center justify-end h-full max-w-[24px]">
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-600 mb-1">
                            {item.countB}
                          </span>
                          <div
                            className="w-full bg-[#0f172a] hover:bg-slate-800 transition-all rounded-t-xs cursor-pointer shadow-2xs"
                            style={{ height: `${heightPctB}%` }}
                            title={`Period B - ${item.name}: ${item.countB} submissions`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis Labels Row */}
              <div className="pl-10 pr-2 flex items-start justify-around gap-2 sm:gap-6">
                {visibleBars.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 text-center py-1"
                    title={item.name}
                  >
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 block truncate max-w-[65px] sm:max-w-[90px] mx-auto">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Calendar Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full border border-gray-100 relative">
            <button
              onClick={() => setShowCustomDateModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaXmark className="text-base" />
            </button>

            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-6">
              SELECT DATE RANGE FOR PERIOD {activeCustomPeriodTarget}
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* Month 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <button
                          type="button"
                          onClick={() => setCalendarBaseDate(new Date(month1.getFullYear(), month1.getMonth() - 1, 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FaChevronLeft className="text-xs" />
                        </button>
                        <span className="text-sm font-extrabold text-slate-900">
                          {monthNames[month1.getMonth()]} {month1.getFullYear()}
                        </span>
                        <div className="w-8 md:hidden" />
                      </div>

                      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                      </div>

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
                              {cell.dayNumber}
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
                          {monthNames[month2.getMonth()]} {month2.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalendarBaseDate(new Date(month1.getFullYear(), month1.getMonth() + 1, 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <FaChevronRight className="text-xs" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                      </div>

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
                              {cell.dayNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="font-bold text-slate-600">
                      Selected Range:{" "}
                      <span className="font-extrabold text-slate-900">
                        {tempStartDate && tempEndDate
                          ? `${formatMMDDYYYY(tempStartDate)} to ${formatMMDDYYYY(tempEndDate)}`
                          : tempStartDate
                          ? `${formatMMDDYYYY(tempStartDate)} to ...`
                          : "Select start & end date"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowCustomDateModal(false)}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCustomDateRange}
                        disabled={!tempStartDate || !tempEndDate}
                        className="px-7 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold transition-all shadow-md cursor-pointer"
                      >
                        Apply For Period {activeCustomPeriodTarget}
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
