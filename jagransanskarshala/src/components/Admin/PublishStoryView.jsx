"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaNewspaper,
  FaCheck,
  FaRegCalendar,
  FaEye,
  FaPen,
  FaXmark,
} from "react-icons/fa6";
import { storiesData as initialStories } from "@/services/stories";

export default function PublishStoryView() {
  const [stories, setStories] = useState(initialStories);
  const [filter, setFilter] = useState("all");
  const [editingStory, setEditingStory] = useState(null);

  const togglePublish = (id) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPublished: !s.isPublished } : s))
    );
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStory) return;
    setStories((prev) =>
      prev.map((s) => (s.id === editingStory.id ? editingStory : s))
    );
    setEditingStory(null);
  };

  const publishedCount = stories.filter((s) => s.isPublished).length;
  const draftCount = stories.filter((s) => !s.isPublished).length;

  const filtered = stories.filter((s) => {
    if (filter === "published") return s.isPublished;
    if (filter === "draft") return !s.isPublished;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Stories</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{stories.length} Weeks</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[var(--primary)] flex items-center justify-center text-xl">
            <FaNewspaper />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Published Stories</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{publishedCount} Live</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaCheck />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Draft / Scheduled</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{draftCount} Drafts</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <FaRegCalendar />
          </div>
        </div>
      </div>

      {/* Main Stories Table / Grid Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setFilter("all")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${filter === "all" ? "text-[var(--primary)]" : "text-gray-400 hover:text-gray-700"}`}
            >
              All Stories ({stories.length})
              {filter === "all" && <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />}
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${filter === "published" ? "text-[var(--primary)]" : "text-gray-400 hover:text-gray-700"}`}
            >
              Published ({publishedCount})
              {filter === "published" && <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />}
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`text-sm font-extrabold pb-2 relative transition-all cursor-pointer ${filter === "draft" ? "text-[var(--primary)]" : "text-gray-400 hover:text-gray-700"}`}
            >
              Drafts ({draftCount})
              {filter === "draft" && <span className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-full" />}
            </button>
          </div>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((story) => (
            <div
              key={story.id}
              className="border border-gray-200/80 rounded-2xl p-5 bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-red-50 text-[var(--primary)] text-xs font-black px-2.5 py-1 rounded-lg">
                    {story.weekHi || story.weekEn}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      story.isPublished
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {story.isPublished ? "✓ Published" : "⏳ Draft"}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {story.titleHi} ({story.titleEn})
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2">
                  {story.descHi || story.descEn}
                </p>
                <div className="text-[11px] font-semibold text-gray-400 mt-3 flex items-center gap-1.5">
                  <FaRegCalendar />
                  <span>Publish Date: {story.publishDateHi || story.publishDateEn}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-gray-100">
                <Link
                  href={`/story/${story.id}`}
                  target="_blank"
                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                >
                  <FaEye /> View Story Live
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingStory({ ...story })}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <FaPen className="text-[10px]" /> Edit
                  </button>
                  <button
                    onClick={() => togglePublish(story.id)}
                    className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      story.isPublished
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                        : "bg-[var(--primary)] text-white hover:opacity-90 shadow-xs"
                    }`}
                  >
                    {story.isPublished ? "Unpublish" : "Publish Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">
                Edit Story ({editingStory.weekHi})
              </h3>
              <button
                onClick={() => setEditingStory(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title (Hindi)</label>
                <input
                  type="text"
                  value={editingStory.titleHi || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, titleHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editingStory.titleEn || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, titleEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={editingStory.descHi || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, descHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Publish Date (Hindi)</label>
                <input
                  type="text"
                  value={editingStory.publishDateHi || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, publishDateHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-extrabold shadow-md hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
