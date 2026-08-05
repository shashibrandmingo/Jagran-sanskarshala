"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaNewspaper,
  FaCheck,
  FaCalendarDays,
  FaEye,
  FaPenToSquare,
  FaXmark,
  FaCloudArrowUp,
  FaClock,
  FaPlus,
  FaSpinner,
  FaTrash,
} from "react-icons/fa6";
import { resolveStoryPublishStatus } from "@/services/stories";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function formatDateToEnglish(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return dateString;

  const standardMonths = [
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
  const monthName = standardMonths[monthIdx] || "";

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(day)} ${monthName} ${year}`;
}

export default function PublishStoryView() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingStory, setEditingStory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch live stories directly from MongoDB Backend API
  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/stories/all`, { cache: "no-store" });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setStories(data.data);
      } else {
        setStories([]);
      }
    } catch (err) {
      console.error("Error fetching stories from backend API", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Toggle publish state in Backend MongoDB
  const togglePublish = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${id}/toggle-publish`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data?.success) {
        fetchStories();
      }
    } catch (e) {
      console.error("Toggle publish error", e);
    }
  };

  // Delete story from MongoDB + Cloudinary
  const handleDeleteStory = async (id) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        fetchStories();
      }
    } catch (e) {
      console.error("Delete story error", e);
    }
  };

  const handleOpenEdit = (story) => {
    setEditingStory({ ...story });
    setImageFile(null);
    setImagePreview(story.image || null);
  };

  const handleAddNewStory = () => {
    const nextId =
      stories.length > 0 ? Math.max(...stories.map((s) => s.id || s.storyId || 0)) + 1 : 1;
    const newWeekNum = stories.length + 1;
    const todayStr = new Date().toISOString().split("T")[0];

    const newStory = {
      id: nextId,
      storyId: nextId,
      weekEn: `Week ${newWeekNum}`,
      weekHi: `सप्ताह ${newWeekNum}`,
      isPublished: false,
      scheduledDate: todayStr,
      publishDateEn: "",
      publishDateHi: "",
      titleEn: "",
      titleHi: "",
      descEn: "",
      descHi: "",
      fullBodyEn: "Coming soon...",
      fullBodyHi: "जल्द आ रहा है...",
      link: `/story/${nextId}`,
      image: null,
    };

    setEditingStory(newStory);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save story directly to MongoDB + Cloudinary image
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStory) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("storyId", editingStory.id || editingStory.storyId);
      formData.append("weekEn", editingStory.weekEn || `Week ${editingStory.id}`);
      formData.append("weekHi", editingStory.weekHi || `सप्ताह ${editingStory.id}`);
      formData.append("titleEn", editingStory.titleEn || "");
      formData.append("titleHi", editingStory.titleHi || editingStory.titleEn || "");
      formData.append("descEn", editingStory.descEn || "");
      formData.append("descHi", editingStory.descHi || editingStory.descEn || "");
      formData.append("scheduledDate", editingStory.scheduledDate || "");
      formData.append("publishDateEn", editingStory.publishDateEn || "");
      formData.append("publishDateHi", editingStory.publishDateHi || editingStory.publishDateEn || "");
      formData.append("isPublished", editingStory.isPublished || false);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (editingStory.image) {
        formData.append("existingImage", editingStory.image);
      }

      const res = await fetch(`${API_BASE_URL}/stories/save`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data?.success) {
        await fetchStories();
        setEditingStory(null);
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert(data?.message || "Failed to save story");
      }
    } catch (err) {
      console.error("Save story error", err);
      alert("Error saving story to database");
    } finally {
      setSaving(false);
    }
  };

  const publishedCount = stories.filter((s) =>
    resolveStoryPublishStatus(s)
  ).length;
  const scheduledCount = stories.length - publishedCount;

  const filtered = stories.filter((s) => {
    const isLive = resolveStoryPublishStatus(s);
    if (filter === "published") return isLive;
    if (filter === "scheduled") return !isLive;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* ── TOP STATS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Stories */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-gray-200/80 flex items-center justify-between transition-all hover:shadow-xs">
          <div>
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
              Total Stories
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {stories.length} Stories
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[var(--primary)] flex items-center justify-center text-xl shadow-2xs">
            <FaNewspaper />
          </div>
        </div>

        {/* Published Stories */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-gray-200/80 flex items-center justify-between transition-all hover:shadow-xs">
          <div>
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
              Published Stories
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {publishedCount} Live
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs">
            <FaCheck />
          </div>
        </div>

        {/* Scheduled Stories */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-gray-200/80 flex items-center justify-between transition-all hover:shadow-xs">
          <div>
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
              Scheduled Stories
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {scheduledCount} Scheduled
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-2xs">
            <FaClock />
          </div>
        </div>
      </div>

      {/* ── MAIN STORIES GRID CONTAINER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-gray-200/80 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setFilter("all")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
                filter === "all"
                  ? "text-[var(--primary)] font-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              All Stories ({stories.length})
              {filter === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setFilter("published")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
                filter === "published"
                  ? "text-[var(--primary)] font-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Published ({publishedCount})
              {filter === "published" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setFilter("scheduled")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${
                filter === "scheduled"
                  ? "text-[var(--primary)] font-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Scheduled ({scheduledCount})
              {filter === "scheduled" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />
              )}
            </button>
          </div>

          <button
            onClick={handleAddNewStory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <FaPlus className="text-xs" />
            <span>Add New Story</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-2xl text-[var(--primary)]" />
            <span className="text-xs font-bold">Loading stories from MongoDB...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-bold text-gray-400">
              No stories found in database. Click below to schedule a new story.
            </p>
            <button
              onClick={handleAddNewStory}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-extrabold shadow-md hover:opacity-90 cursor-pointer"
            >
              <FaPlus /> Add First Story
            </button>
          </div>
        ) : (
          /* Weekly Stories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((story) => {
              const isLive = resolveStoryPublishStatus(story);
              const displayWeek =
                story.weekEn || story.weekHi || `Week ${story.id || story.storyId}`;

              return (
                <div
                  key={story.id || story.storyId}
                  className={`border rounded-2xl p-5 sm:p-6 bg-white transition-all flex flex-col justify-between hover:shadow-md ${
                    isLive
                      ? "border-emerald-200/90 shadow-2xs"
                      : "border-gray-200/80"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-red-50 text-[var(--primary)] text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider border border-red-100">
                        {displayWeek}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                            isLive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isLive ? (
                            <>
                              <FaCheck className="text-[10px]" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <FaClock className="text-[10px]" />
                              <span>Scheduled</span>
                            </>
                          )}
                        </span>
                        <button
                          onClick={() => handleDeleteStory(story.id || story.storyId)}
                          title="Delete Story"
                          className="text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Heading Title */}
                    <h3 className="text-lg font-black text-gray-900 leading-snug">
                      {story.titleEn || story.titleHi}
                    </h3>

                    {/* Subheading / Description */}
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1.5 line-clamp-2 leading-relaxed">
                      {story.descEn || story.descHi}
                    </p>

                    {/* Newspaper Image Thumbnail Preview */}
                    {story.image && (
                      <div className="mt-3.5 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-32">
                        <img
                          src={story.image}
                          alt="Story feature"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Scheduled Date */}
                    <div className="text-xs font-bold text-gray-500 mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                      <FaCalendarDays className="text-[var(--primary)] text-xs" />
                      <span>
                        Publish Date:{" "}
                        <strong className="text-gray-900">
                          {story.publishDateEn || story.publishDateHi}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-gray-100">
                    <Link
                      href={`/story/${story.id || story.storyId}`}
                      target="_blank"
                      className="text-xs font-black text-red-600 hover:text-red-800 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                    >
                      <FaEye /> View Story Live
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(story)}
                        className="text-xs font-extrabold px-3.5 py-2 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 bg-white"
                      >
                        <FaPenToSquare className="text-xs text-gray-500" /> Edit
                      </button>

                      <button
                        onClick={() => togglePublish(story.id || story.storyId)}
                        className={`text-xs font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ${
                          isLive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                            : "bg-[var(--primary)] text-white hover:opacity-90"
                        }`}
                      >
                        {isLive ? "Schedule" : "Publish Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EDIT STORY MODAL (BILINGUAL EDITING & ROUNDED PILL DESIGN) ── */}
      {editingStory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {editingStory.weekEn || editingStory.weekHi}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  Manage Story Details
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              {/* Heading Title (English & Hindi) */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Heading Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStory.titleEn || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        titleEn: e.target.value,
                      })
                    }
                    placeholder="e.g. Attention"
                    className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Heading Title (Hindi)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStory.titleHi || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        titleHi: e.target.value,
                      })
                    }
                    placeholder="जैसे: ध्यान"
                    className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Subheading (English & Hindi) */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sub Heading (English)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingStory.descEn || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        descEn: e.target.value,
                      })
                    }
                    placeholder="Enter short subheading..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sub Heading (Hindi)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingStory.descHi || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        descHi: e.target.value,
                      })
                    }
                    placeholder="संक्षिप्त विवरण दर्ज करें..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50 resize-none"
                  />
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Scheduled Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingStory.scheduledDate || ""}
                    onChange={(e) => {
                      const newDateVal = e.target.value;
                      const formatted = formatDateToEnglish(newDateVal);
                      setEditingStory({
                        ...editingStory,
                        scheduledDate: newDateVal,
                        publishDateEn: formatted || editingStory.publishDateEn,
                        publishDateHi: formatted || editingStory.publishDateHi,
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Date Text (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={
                      editingStory.publishDateEn ||
                      editingStory.publishDateHi ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        publishDateEn: e.target.value,
                        publishDateHi: e.target.value,
                      })
                    }
                    placeholder="e.g. 11th August 2026"
                    className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)] bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Image Upload for Newspaper Feature */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload Newspaper Story Image (Cloudinary)
                </label>
                <div className="border-2 border-dashed border-gray-200 hover:border-[var(--primary)] rounded-2xl p-3.5 text-center transition-colors bg-gray-50/50 cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 text-gray-500">
                    <FaCloudArrowUp className="text-xl text-[var(--primary)]" />
                    <p className="text-xs font-extrabold text-gray-800">
                      Click to upload story newspaper image
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Uploads directly to Cloudinary (PNG, JPG, WEBP)
                    </p>
                  </div>
                </div>

                {/* Preview */}
                {imagePreview && (
                  <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-gray-200 max-h-36 bg-gray-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setEditingStory((prev) => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs shadow-md cursor-pointer"
                    >
                      <FaXmark />
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditingStory(null);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="px-6 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-extrabold shadow-md hover:opacity-90 cursor-pointer active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <FaSpinner className="animate-spin text-xs" />}
                  <span>{saving ? "Saving to Cloudinary..." : "Save Story Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
