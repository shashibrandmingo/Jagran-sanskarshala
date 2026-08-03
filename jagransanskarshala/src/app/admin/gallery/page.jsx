"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import Logo from "@/assets/images/Logo-english.png";
import {
  FaImages,
  FaPlus,
  FaTrash,
  FaPen,
  FaUpload,
  FaFolderPlus,
  FaCalendarPlus,
  FaBars,
  FaXmark,
} from "react-icons/fa6";
import {
  galleryTabs as initialGalleryTabs,
  initialGalleryCategories,
} from "@/services/galleryService";

export default function AdminGalleryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Gallery Management State
  const [galleryYears, setGalleryYears] = useState(initialGalleryTabs);
  const [galleryCategories, setGalleryCategories] = useState(initialGalleryCategories);
  const [selectedGalleryYear, setSelectedGalleryYear] = useState("All");

  // Modals for Gallery Management
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showUploadImageModal, setShowUploadImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form Inputs
  const [newYearInput, setNewYearInput] = useState("");
  const [newYearTitleInput, setNewYearTitleInput] = useState("");
  const [newYearSubtitleInput, setNewYearSubtitleInput] = useState("");

  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatTitleHi, setNewCatTitleHi] = useState("");
  const [newCatYear, setNewCatYear] = useState("2025");

  const [imgFormTitle, setImgFormTitle] = useState("");
  const [imgFormUrl, setImgFormUrl] = useState("");
  const [imgFormCaption, setImgFormCaption] = useState("");
  const [imgFormCatId, setImgFormCatId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load stored gallery data from Express Backend (with LocalStorage fallback)
  const fetchBackendData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/gallery`);
      if (res.ok) {
        const result = await res.json();
        if (result.data?.categories) {
          setGalleryCategories(result.data.categories);
        }
        if (result.data?.years) {
          setGalleryYears(result.data.years);
        }
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Backend fetch failed, falling back to local state:", e.message);
    }

    // Local fallback
    if (typeof window !== "undefined") {
      const savedYears = localStorage.getItem("jagran_admin_gallery_years");
      const savedCats = localStorage.getItem("jagran_admin_gallery_categories");
      if (savedYears) {
        try { setGalleryYears(JSON.parse(savedYears)); } catch (e) {}
      }
      if (savedCats) {
        try { setGalleryCategories(JSON.parse(savedCats)); } catch (e) {}
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin-login");
      return;
    }
    fetchBackendData();
  }, [router]);

  const saveGalleryData = (updatedYears, updatedCats) => {
    if (updatedYears) {
      setGalleryYears(updatedYears);
      if (typeof window !== "undefined") {
        localStorage.setItem("jagran_admin_gallery_years", JSON.stringify(updatedYears));
      }
    }
    if (updatedCats) {
      setGalleryCategories(updatedCats);
      if (typeof window !== "undefined") {
        localStorage.setItem("jagran_admin_gallery_categories", JSON.stringify(updatedCats));
      }
    }
  };

  // Add New Year Handler
  const handleAddYear = async (e) => {
    e.preventDefault();
    if (!newYearInput.trim() || !newYearTitleInput.trim()) return;
    const yearVal = newYearInput.trim();

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/gallery/years`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: yearVal,
          title: { en: newYearTitleInput.trim(), hi: newYearTitleInput.trim() },
          subtitle: { en: newYearSubtitleInput.trim(), hi: newYearSubtitleInput.trim() },
        }),
      });

      if (res.ok) {
        await fetchBackendData();
        setNewYearInput("");
        setNewYearTitleInput("");
        setNewYearSubtitleInput("");
        setShowAddYearModal(false);
        return;
      }
    } catch (err) {
      console.warn("Backend year post failed, using local save:", err);
    }

    const newTab = {
      id: yearVal.toLowerCase(),
      title: { hi: newYearTitleInput.trim(), en: newYearTitleInput.trim() },
      subtitle: { hi: newYearSubtitleInput.trim(), en: newYearSubtitleInput.trim() },
      year: yearVal,
    };
    saveGalleryData([...galleryYears, newTab], null);
    setNewYearInput("");
    setNewYearTitleInput("");
    setNewYearSubtitleInput("");
    setShowAddYearModal(false);
  };

  // Delete Year Handler
  const handleDeleteYear = async (yearVal) => {
    if (yearVal === "All") return;
    if (!confirm(`Are you sure you want to delete edition ${yearVal}?`)) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/gallery/years/${yearVal}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchBackendData();
        if (selectedGalleryYear === yearVal) setSelectedGalleryYear("All");
        return;
      }
    } catch (err) {
      console.warn("Backend year delete failed, using local delete:", err);
    }

    const updated = galleryYears.filter((y) => y.year !== yearVal);
    saveGalleryData(updated, null);
    if (selectedGalleryYear === yearVal) setSelectedGalleryYear("All");
  };

  // Create or Update Category Handler
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatTitle.trim() || !newCatYear) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      if (editingCategory) {
        const res = await fetch(`${backendUrl}/api/v1/gallery/categories/${editingCategory._id || editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryTitle: newCatTitle.trim(),
            categoryTitleHi: newCatTitleHi.trim() || newCatTitle.trim(),
            year: newCatYear,
          }),
        });
        if (res.ok) {
          await fetchBackendData();
          setNewCatTitle("");
          setNewCatTitleHi("");
          setEditingCategory(null);
          setShowAddCategoryModal(false);
          return;
        }
      } else {
        const res = await fetch(`${backendUrl}/api/v1/gallery/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryTitle: newCatTitle.trim(),
            categoryTitleHi: newCatTitleHi.trim() || newCatTitle.trim(),
            year: newCatYear,
          }),
        });
        if (res.ok) {
          await fetchBackendData();
          setNewCatTitle("");
          setNewCatTitleHi("");
          setEditingCategory(null);
          setShowAddCategoryModal(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend category operation failed, fallback to local:", err);
    }

    let updated;
    if (editingCategory) {
      updated = galleryCategories.map((c) =>
        c.id === editingCategory.id || c._id === editingCategory._id
          ? {
              ...c,
              categoryTitle: newCatTitle.trim(),
              categoryTitleHi: newCatTitleHi.trim() || newCatTitle.trim(),
              year: newCatYear,
            }
          : c
      );
    } else {
      const catId = `cat-${Date.now()}`;
      const newCategory = {
        id: catId,
        categoryTitle: newCatTitle.trim(),
        categoryTitleHi: newCatTitleHi.trim() || newCatTitle.trim(),
        year: newCatYear,
        images: [],
      };
      updated = [newCategory, ...galleryCategories];
    }

    saveGalleryData(null, updated);
    setNewCatTitle("");
    setNewCatTitleHi("");
    setEditingCategory(null);
    setShowAddCategoryModal(false);
  };

  // Save Image Handler (Upload to Cloudinary via Express Backend Multer endpoint)
  const handleSaveImage = async (e) => {
    e.preventDefault();
    if ((selectedFiles.length === 0 && !imgFormUrl.trim()) || !imgFormCatId) return;
    if (isUploading) return; // Prevent duplicate submissions

    const targetCat = galleryCategories.find(
      (c) => String(c._id) === String(imgFormCatId) || String(c.id) === String(imgFormCatId)
    );
    if (!targetCat) {
      console.error("Target category not found! imgFormCatId:", imgFormCatId);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    setIsUploading(true); // 🔒 Lock - prevent duplicate clicks

    try {
      // Try Express Cloudinary Multipart Upload
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("categoryId", String(targetCat._id || targetCat.id));
        selectedFiles.forEach((file) => {
          formData.append("photos", file);
        });

        const res = await fetch(`${backendUrl}/api/v1/gallery/photos`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          await fetchBackendData();
          setImgFormTitle("");
          setImgFormUrl("");
          setImgFormCaption("");
          setImgFormCatId("");
          setSelectedFiles([]);
          setEditingImage(null);
          setShowUploadImageModal(false);
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("Upload failed:", errData.message || res.status);
        }
      }

      // Local Fallback (only used if backend fails)
      let newImagesToAdd = [];
      if (selectedFiles.length > 0) {
        newImagesToAdd = selectedFiles.map((file, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          title: "Sanskarshala Moment",
          url: URL.createObjectURL(file),
          caption: "",
        }));
      } else if (imgFormUrl.trim()) {
        newImagesToAdd = [
          {
            id: `img-${Date.now()}`,
            title: "Sanskarshala Moment",
            url: imgFormUrl.trim(),
            caption: "",
          },
        ];
      }

      const updatedCategories = galleryCategories.map((cat) => {
        if (String(cat._id) === String(targetCat._id) || String(cat.id) === String(targetCat.id)) {
          return {
            ...cat,
            images: [...newImagesToAdd, ...cat.images],
          };
        }
        return cat;
      });

      saveGalleryData(null, updatedCategories);
      setImgFormTitle("");
      setImgFormUrl("");
      setImgFormCaption("");
      setImgFormCatId("");
      setSelectedFiles([]);
      setEditingImage(null);
      setShowUploadImageModal(false);
    } finally {
      setIsUploading(false); // 🔓 Always unlock after completion/error
    }
  };

  // Delete Image Handler (Deletes from Mongo & Cloudinary)
  const handleDeleteImage = async (catId, imgId, publicId) => {
    if (!confirm("Are you sure you want to delete this photo from gallery and Cloudinary?")) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/gallery/categories/${catId}/photos/${imgId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBackendData();
        return;
      }
    } catch (err) {
      console.warn("Backend deletion failed, performing local delete:", err);
    }

    const updatedCategories = galleryCategories.map((cat) => {
      if (String(cat.id) === String(catId) || String(cat._id) === String(catId)) {
        return {
          ...cat,
          images: cat.images.filter(
            (img) => String(img.id) !== String(imgId) && String(img._id) !== String(imgId)
          ),
        };
      }
      return cat;
    });
    saveGalleryData(null, updatedCategories);
  };

  // Delete Category Handler (Deletes Category & all Cloudinary images)
  const handleDeleteCategory = async (catId) => {
    if (!confirm("Are you sure you want to delete this entire category and all its Cloudinary photos?")) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/gallery/categories/${catId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBackendData();
        return;
      }
    } catch (err) {
      console.warn("Backend category deletion failed, using local fallback:", err);
    }

    const updatedCategories = galleryCategories.filter(
      (c) => String(c.id) !== String(catId) && String(c._id) !== String(catId)
    );
    saveGalleryData(null, updatedCategories);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf4ed] flex items-center justify-center">
        <div className="flex items-center gap-3 font-extrabold text-gray-700">
          <svg className="animate-spin h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading Gallery Management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f8f5f0] text-gray-800 flex flex-col lg:flex-row font-admin overflow-hidden">
      {/* Shared Admin Sidebar Component */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu="gallery-mgmt"
      />

      {/* Main Content Area */}
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
        <header className="p-4 sm:p-6 lg:p-8 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
              Gallery Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">
              गैलरी प्रबंधन (Upload, Edit, Update & Add Categories / Years)
            </p>
          </div>
        </header>

        {/* Gallery Content Container */}
        <div className="px-3 sm:px-6 lg:px-8 pb-8 space-y-4 sm:space-y-6">
          {/* Top Control Panel (2 Clean Distinct Rows for Actions & Year Tabs) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-200/80 space-y-4">
            {/* ROW 1: Action Buttons & Quick Stats */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full border border-gray-200">
                  Editions / Filter
                </span>
                <span className="text-[11px] sm:text-xs font-extrabold text-[var(--primary)] bg-red-50 px-2.5 py-1 rounded-full">
                  {galleryCategories.length} Categories
                </span>
              </div>

              {/* Action Buttons (Full width stacked on mobile, row on tablet/desktop) */}
              <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex items-center gap-2 sm:gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl sm:rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <FaFolderPlus className="text-sm text-red-400 shrink-0" />
                  <span>Add Category</span>
                </button>
                <button
                  onClick={() => setShowAddYearModal(true)}
                  className="px-3 sm:px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                >
                  <FaCalendarPlus className="text-sm text-[var(--primary)] shrink-0" />
                  <span>Add Year / Edition</span>
                </button>
                <button
                  onClick={() => {
                    setEditingImage(null);
                    setImgFormTitle("");
                    setImgFormUrl("");
                    setImgFormCaption("");
                    setImgFormCatId(galleryCategories[0]?.id || "");
                    setShowUploadImageModal(true);
                  }}
                  className="px-4 sm:px-5 py-2.5 bg-[var(--primary)] hover:bg-red-700 text-white rounded-xl sm:rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <FaUpload className="text-sm shrink-0" />
                  <span>Upload Photos</span>
                </button>
              </div>
            </div>

            {/* ROW 2: Horizontal Scrollable Year Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto thin-scrollbar pt-0.5 pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedGalleryYear("All")}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGalleryYear === "All"
                    ? "bg-[var(--primary)] text-white shadow-md shadow-red-950/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Years
              </button>
              {galleryYears.map((t) => {
                if (t.year === "All") return null;
                const isActive = selectedGalleryYear === t.year;
                return (
                  <div
                    key={t._id || t.id || t.year}
                    className={`px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-md shadow-red-950/20"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedGalleryYear(t.year)}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.title?.en || t.title?.hi || t.year}</span>
                      <span className="opacity-75">({t.year})</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteYear(t.year);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        isActive
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-gray-300 text-gray-500"
                      }`}
                      title={`Delete ${t.year} edition`}
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Sections & Image Cards */}
          {(() => {
            const filteredCategories =
              selectedGalleryYear === "All"
                ? galleryCategories
                : galleryCategories.filter((c) => c.year === selectedGalleryYear);

            if (filteredCategories.length === 0) {
              return (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-gray-200/80">
                  <FaImages className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-700">No photo categories for {selectedGalleryYear}</h3>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Add Category&quot; or &quot;Upload Photos&quot; above to add images.</p>
                </div>
              );
            }

            return filteredCategories.map((category) => (
              <div
                key={category._id || category.id}
                className="bg-[#fffcf7] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-[#f0e6d8] space-y-3 sm:space-y-4"
              >
                {/* Category Header with Add Photo, Edit Category, Delete Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-orange-100/80 pb-3 gap-2 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {category.categoryTitle}
                      </h2>
                      <span className="text-[11px] sm:text-xs font-extrabold text-[var(--primary)] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                        {category.images.length} Photos
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {category.year}
                      </span>
                    </div>
                    {category.categoryTitleHi && (
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {category.categoryTitleHi}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setEditingImage(null);
                        setImgFormTitle("");
                        setImgFormUrl("");
                        setImgFormCaption("");
                        setImgFormCatId(category._id || category.id);
                        setShowUploadImageModal(true);
                      }}
                      className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-slate-700 hover:bg-gray-50 hover:text-[var(--primary)] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <FaPlus className="text-[10px]" />
                      <span>Add Photo</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setNewCatTitle(category.categoryTitle || "");
                        setNewCatTitleHi(category.categoryTitleHi || "");
                        setNewCatYear(category.year || "2025");
                        setShowAddCategoryModal(true);
                      }}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Category Name & Year"
                    >
                      <FaPen className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id || category.id)}
                      className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Images Grid */}
                {category.images.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-amber-200/60 rounded-2xl bg-amber-50/20">
                    No photos uploaded in this category yet. Click &quot;Add Photo&quot; to upload.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {category.images.map((img) => (
                      <div
                        key={img._id || img.id}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200/90 flex flex-col"
                      >
                        {/* Pure Image Container matching frontend UI */}
                        <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden rounded-2xl">
                          <img
                            src={img.url}
                            alt="Gallery Image"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Actions Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-2xs">
                            <button
                              onClick={() => {
                                setEditingImage(img);
                                setImgFormUrl(img.url || "");
                                setImgFormCatId(category._id || category.id);
                                setShowUploadImageModal(true);
                              }}
                              className="w-9 h-9 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                              title="Edit Photo URL"
                            >
                              <FaPen className="text-xs text-slate-800" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(category._id || category.id, img._id || img.id, img.public_id)}
                              className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                              title="Delete Photo from Gallery and Cloudinary"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* MODAL 1: ADD YEAR / EDITION */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowAddYearModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaXmark className="text-lg" />
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
              <FaCalendarPlus className="text-[var(--primary)]" />
              <span>Add New Year / Edition</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Add a new year tab (e.g., 2026, 2027) to organize Sanskarshala gallery images.
            </p>

            <form onSubmit={handleAddYear} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Year (e.g. 2026)</label>
                <input
                  type="text"
                  required
                  placeholder="2026"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Edition Title (English / Hindi)</label>
                <input
                  type="text"
                  required
                  placeholder="Sanskarshala 2026"
                  value={newYearTitleInput}
                  onChange={(e) => setNewYearTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  placeholder="(2026)"
                  value={newYearSubtitleInput}
                  onChange={(e) => setNewYearSubtitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white font-extrabold shadow-md hover:bg-red-700 transition-all cursor-pointer"
                >
                  Save Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => {
                setShowAddCategoryModal(false);
                setEditingCategory(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaXmark className="text-lg" />
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
              <FaFolderPlus className="text-red-500" />
              <span>{editingCategory ? "Edit Category" : "Add New Category"}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {editingCategory ? "Update category name or target edition year." : "Create categories like Assembly Take Over, News Paper Reading, etc."}
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Target Year</label>
                <select
                  value={newCatYear}
                  onChange={(e) => setNewCatYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                >
                  {galleryYears.map((t) => {
                    if (t.year === "All") return null;
                    return (
                      <option key={t.year} value={t.year}>
                        {t.year} ({t.title?.en || t.title?.hi})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Category Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Newspaper Reading"
                  value={newCatTitle}
                  onChange={(e) => setNewCatTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Category Title (Hindi - Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. न्यूज़पेपर रीडिंग"
                  value={newCatTitleHi}
                  onChange={(e) => setNewCatTitleHi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold shadow-md hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD / EDIT PHOTO */}
      {showUploadImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => {
                setShowUploadImageModal(false);
                setEditingImage(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaXmark className="text-lg" />
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
              <FaUpload className="text-[var(--primary)]" />
              <span>{editingImage ? "Edit Photo Details" : "Upload / Add New Photo"}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {editingImage ? "Update photo title or URL." : "Enter photo URL and select the category to publish on gallery."}
            </p>

            <form onSubmit={handleSaveImage} className="space-y-4 text-xs font-semibold">
              {/* Improved Category Select Dropdown */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>Select Target Category</span>
                  <span className="text-[10px] text-gray-400 font-medium">Req. Edition</span>
                </label>
                <div className="relative">
                  <select
                    disabled={!!editingImage}
                    value={imgFormCatId}
                    onChange={(e) => setImgFormCatId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50/80 hover:bg-gray-50 border border-gray-200 focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-red-100 rounded-2xl text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer disabled:opacity-60 pr-10 shadow-2xs"
                  >
                    {galleryCategories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        [{cat.year}] {cat.categoryTitle} {cat.categoryTitleHi ? `(${cat.categoryTitleHi})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>

              {/* Direct Multi-File Selection Box with Individual Cross Removal */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">
                  Select Multiple / Drag & Drop Image Files
                </label>

                <div
                  onClick={() => document.getElementById("admin-gallery-file-input")?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    selectedFiles.length > 0 || imgFormUrl
                      ? "border-[var(--primary)] bg-red-50/20"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50/60 hover:bg-gray-50"
                  }`}
                >
                  <input
                    id="admin-gallery-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setSelectedFiles((prev) => [...prev, ...files]);
                        const firstPreview = URL.createObjectURL(files[0]);
                        setImgFormUrl(firstPreview);
                      }
                    }}
                  />

                  {selectedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {/* Grid preview of selected photos with Individual Cross Icons */}
                      <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto thin-scrollbar p-1">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            {/* Individual Unselect Cross Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedFiles = selectedFiles.filter((_, i) => i !== idx);
                                setSelectedFiles(updatedFiles);
                                if (updatedFiles.length === 0) setImgFormUrl("");
                              }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                              title="Unselect this photo"
                            >
                              <FaXmark className="text-[10px]" />
                            </button>
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-2xs">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold border-t border-red-100 pt-2">
                        <span className="text-emerald-600">
                          ✓ {selectedFiles.length} {selectedFiles.length === 1 ? "Image" : "Images"} selected
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles([]);
                            setImgFormUrl("");
                          }}
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Unselect All
                        </button>
                      </div>
                    </div>
                  ) : imgFormUrl ? (
                    <div className="space-y-2">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative mx-auto">
                        <img
                          src={imgFormUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles([]);
                          setImgFormUrl("");
                        }}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Change / Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-[var(--primary)] flex items-center justify-center mx-auto text-lg shadow-2xs">
                        <FaUpload />
                      </div>
                      <div className="font-extrabold text-slate-800 text-xs">
                        Click to Select Multiple Photos or Drag & Drop
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Select multiple images at once (Batch Upload to Cloudinary)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setShowUploadImageModal(false);
                    setEditingImage(null);
                    setSelectedFiles([]);
                    setImgFormUrl("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (selectedFiles.length === 0 && !imgFormUrl)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] disabled:opacity-50 text-white font-extrabold shadow-md hover:bg-red-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Uploading {selectedFiles.length > 0 ? `${selectedFiles.length} Photos...` : "Photo..."}</span>
                    </>
                  ) : editingImage ? (
                    "Update Photo"
                  ) : selectedFiles.length > 1 ? (
                    `Upload ${selectedFiles.length} Photos`
                  ) : (
                    "Upload Photo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
