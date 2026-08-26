"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/images/Logo-english.png";
import { FaBars } from "react-icons/fa6";
import AdminSidebar from "@/components/Admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin-login");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#faf5ef] via-[#f8f0e6] to-[#f4eae0] flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center space-y-4">
          <div className="relative w-28 h-12 flex items-center justify-center">
            <Image src={Logo} alt="Jagran Sanskarshala" width={110} height={35} className="object-contain animate-pulse" />
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 text-[var(--primary)] text-xs font-bold border border-red-100/80 shadow-2xs">
            <svg className="animate-spin h-4 w-4 text-[var(--primary)] shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Verifying Admin Session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f8f5f0] text-gray-800 flex flex-col lg:flex-row font-admin overflow-hidden">
      {/* Persistent Sidebar (Never unmounts or reloads on tab clicks) */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
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

        {/* Dynamic Page Content */}
        {children}
      </div>
    </div>
  );
}
