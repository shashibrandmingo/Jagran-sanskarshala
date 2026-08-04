"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FaBell,
  FaPaperPlane,
  FaCheck,
  FaEye,
  FaPen,
  FaTrash,
  FaLink,
  FaFilePen,
  FaCircleInfo,
  FaMagnifyingGlass,
  FaCalendarDays,
  FaXmark,
  FaClock,
  FaChevronDown,
  FaRotate,
} from "react-icons/fa6";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API_BASE = `${BACKEND_URL}/api/v1/notifications`;

export default function PushNotificationView() {
  // Notification List State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [language, setLanguage] = useState("Both");
  const [messageEn, setMessageEn] = useState("");
  const [messageHi, setMessageHi] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Feedback & UI State
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Delete confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Get admin token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  // Fetch all notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        (item.msgEn && item.msgEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.msgHi && item.msgHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.link && item.link.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchQuery, statusFilter]);

  // Handle Form Submit (Publish or Save as Draft)
  const handleSubmit = async (actionStatus = "Sent") => {
    if (language === "English" && !messageEn.trim()) {
      alert("Please enter English message.");
      return;
    }
    if (language === "Hindi" && !messageHi.trim()) {
      alert("कृपया हिंदी संदेश दर्ज करें। (Please enter Hindi message)");
      return;
    }
    if (language === "Both" && (!messageEn.trim() || !messageHi.trim())) {
      alert("Please enter both English and Hindi messages.");
      return;
    }

    setSubmitting(true);

    try {
      const token = getToken();
      const payload = {
        language,
        msgEn: messageEn.trim(),
        msgHi: messageHi.trim(),
        link: linkUrl.trim(),
        status: actionStatus,
      };

      let res;
      if (editingId) {
        // Update existing notification
        res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new notification
        res = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok && data.success) {
        if (editingId) {
          setSuccessBanner(
            actionStatus === "Sent"
              ? "Notification updated and published successfully!"
              : "Notification draft updated!"
          );
        } else {
          setSuccessBanner(
            actionStatus === "Sent"
              ? "New notification pushed successfully!"
              : "Notification saved to drafts!"
          );
        }

        // Refresh notifications list from backend
        await fetchNotifications();
        resetForm();
      } else {
        setError(data.message || "Failed to save notification");
      }
    } catch (err) {
      console.error("Error saving notification:", err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setSuccessBanner("");
        setError("");
      }, 4000);
    }
  };

  // Edit Notification Load
  const handleEdit = (item) => {
    setEditingId(item._id);
    setLanguage(item.language || "Both");
    setMessageEn(item.msgEn || "");
    setMessageHi(item.msgHi || "");
    setLinkUrl(item.link || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Notification
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      setDeletingId(id);
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessBanner("Notification deleted successfully!");
        await fetchNotifications();
        if (editingId === id) resetForm();
      } else {
        setError(data.message || "Failed to delete notification");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setDeletingId(null);
      setTimeout(() => {
        setSuccessBanner("");
        setError("");
      }, 4000);
    }
  };

  // Publish Draft Notification directly
  const handlePublishDraft = async (id) => {
    try {
      setSubmitting(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Sent" }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessBanner("Notification published successfully!");
        await fetchNotifications();
      } else {
        setError(data.message || "Failed to publish notification");
      }
    } catch (err) {
      console.error("Error publishing notification:", err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setSuccessBanner("");
        setError("");
      }, 4000);
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setLanguage("Both");
    setMessageEn("");
    setMessageHi("");
    setLinkUrl("");
  };

  return (
    <div className="space-y-8 text-gray-800">
      {/* Top Banner Alert / History Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-2">
        <div className="text-xs font-bold text-gray-500 flex items-center gap-3">
          <span>
            Total Notifications:{" "}
            <span className="text-[var(--primary)] font-black text-sm">
              {notifications.length}
            </span>{" "}
            ({notifications.filter((n) => n.status === "Sent").length} Published)
          </span>
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
            title="Refresh Notifications"
          >
            <FaRotate className={`text-xs ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("sent-notifications-list");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <FaClock className="text-[var(--primary)] text-xs" />
          <span>Notification History</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold animate-fadeIn flex items-center gap-2.5 shadow-xs">
          <FaCheck className="text-emerald-600 text-sm shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs font-extrabold animate-fadeIn flex items-center gap-2.5 shadow-xs">
          <FaCircleInfo className="text-red-600 text-sm shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto p-1 text-red-400 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
          >
            <FaXmark className="text-xs" />
          </button>
        </div>
      )}

      {/* Send / Edit Notification Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              {editingId ? "Edit Notification" : "Send New Notification"}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {editingId ? "संपादित करें" : "नई नोटिफिकेशन भेजें"}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-extrabold text-gray-400 hover:text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Language / भाषा
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-extrabold bg-white text-slate-800 appearance-none focus:outline-none focus:border-[var(--primary)] transition-all pr-8 cursor-pointer"
                >
                  <option value="Both">Both (English &amp; Hindi)</option>
                  <option value="English">English Only</option>
                  <option value="Hindi">Hindi Only</option>
                </select>
                <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>

            {/* Target Link (URL) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Link (URL) / लिंक (URL)
              </label>
              <div className="relative">
                <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-bold mt-1">
                Users can click this link from notification banner
              </p>
            </div>
          </div>

          {/* Messages Input Fields (English Primary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Message (Primary for Dashboard) */}
            {(language === "English" || language === "Both") && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Message (English) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">
                    {messageEn.length}/160
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={160}
                  value={messageEn}
                  onChange={(e) => setMessageEn(e.target.value)}
                  placeholder="Type English message... (e.g. Participate in the survey for your child's better future.)"
                  className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 bg-gray-50/50 focus:bg-white transition-all resize-none"
                />
              </div>
            )}

            {/* Hindi Message */}
            {(language === "Hindi" || language === "Both") && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Message / संदेश (Hindi) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">
                    {messageHi.length}/160
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={160}
                  value={messageHi}
                  onChange={(e) => setMessageHi(e.target.value)}
                  placeholder="हिंदी संदेश दर्ज करें... (उदा. अपने बच्चों के बेहतर भविष्य के लिए सर्वे में भाग लें।)"
                  className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 bg-gray-50/50 focus:bg-white transition-all resize-none"
                />
              </div>
            )}
          </div>

          {/* Info Banner Note */}
          <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100/80 flex items-start gap-2.5 text-xs text-red-900 font-bold">
            <FaCircleInfo className="text-red-500 text-sm shrink-0 mt-0.5" />
            <div>
              <span className="font-black">Note:</span> Maximum 160 characters allowed per message. This notification will be broadcast as a live ticker banner on the website frontend.
            </div>
          </div>

          {/* Action Buttons: Publish Now / Save as Draft */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("Draft")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFilePen className="text-slate-500 text-xs" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("Sent")}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[var(--primary)] hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-xs" />
              <span>
                {submitting
                  ? "Publishing..."
                  : editingId
                    ? "Update & Publish"
                    : "Send Notification"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Sent Notifications List Table Section (English Primary, Hindi Subtext) */}
      <div
        id="sent-notifications-list"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              Sent Notifications
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Notification History &amp; Drafts
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notification..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-extrabold bg-white text-slate-800 appearance-none focus:outline-none focus:border-[var(--primary)] transition-all pr-8 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Sent">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-gray-400 font-bold text-xs">
              <FaRotate className="text-sm animate-spin text-[var(--primary)]" />
              <span>Loading notifications from database...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-bold text-xs">
            {notifications.length === 0
              ? "No notifications yet. Create your first notification above!"
              : "No notifications found matching your search."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs font-semibold text-gray-700">
              <thead className="bg-gray-50 text-gray-400 uppercase font-black border-b border-gray-100">
                <tr>
                  <th className="p-3.5 pl-4">Message</th>
                  <th className="p-3.5">Link</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sent On</th>
                  <th className="p-3.5 text-center pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNotifications.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-gray-50/80 transition-colors ${deletingId === item._id ? "opacity-50" : ""}`}
                  >
                    {/* Message Column (English Primary in Bold, Hindi Secondary Light) */}
                    <td className="p-3.5 pl-4 max-w-xs sm:max-w-sm">
                      <p className="font-bold text-gray-900 line-clamp-2">
                        {item.msgEn || item.msgHi}
                      </p>
                      {item.msgHi && item.msgEn && (
                        <p className="text-[11px] text-gray-400 font-semibold line-clamp-1 mt-0.5">
                          {item.msgHi}
                        </p>
                      )}
                    </td>

                    {/* Link Column */}
                    <td className="p-3.5 max-w-xs">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <FaLink className="text-[10px] shrink-0" />
                          <span className="truncate">{item.link}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Language Column */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-extrabold text-[11px]">
                        {item.language}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="p-3.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black ${item.status === "Sent"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                      >
                        {item.status === "Sent" ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Sent Date Column */}
                    <td className="p-3.5 text-gray-500 font-bold whitespace-nowrap">
                      {item.sentOn}
                    </td>

                    {/* Actions Column */}
                    <td className="p-3.5 text-center pr-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Publish Button for Draft */}
                        {item.status === "Draft" && (
                          <button
                            type="button"
                            onClick={() => handlePublishDraft(item._id)}
                            disabled={submitting}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Publish Notification"
                          >
                            <FaPaperPlane className="text-xs" />
                          </button>
                        )}

                        {/* Preview Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setSelectedNotif(item)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                          title="Preview Notification"
                        >
                          <FaEye className="text-xs" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                          title="Edit Notification"
                        >
                          <FaPen className="text-xs" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Notification"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-gray-100 relative space-y-4">
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaXmark className="text-base" />
            </button>

            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              FRONTEND BANNER PREVIEW
            </h3>

            {/* English Version Banner */}
            {selectedNotif.msgEn && (
              <div className="p-4 rounded-2xl bg-[#fff8ee] border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                    <FaBell className="text-xs" />
                    <span>Latest Updates</span>
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {selectedNotif.msgEn}
                  </span>
                </div>
              </div>
            )}

            {/* Hindi Version Banner */}
            {selectedNotif.msgHi && (
              <div className="p-4 rounded-2xl bg-[#fff8ee] border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                    <FaBell className="text-xs" />
                    <span>ताज़ा जानकारी</span>
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {selectedNotif.msgHi}
                  </span>
                </div>
              </div>
            )}

            {selectedNotif.link && (
              <div className="pt-2 text-xs font-bold text-blue-600">
                Target Link:{" "}
                <a
                  href={selectedNotif.link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-700"
                >
                  {selectedNotif.link}
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedNotif(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
