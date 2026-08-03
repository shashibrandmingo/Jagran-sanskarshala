"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTableCells,
  FaChartPie,
  FaAddressBook,
  FaBell,
  FaRightFromBracket,
  FaXmark,
  FaImages,
  FaNewspaper,
} from "react-icons/fa6";
import Logo from "@/assets/images/Logo-english.png";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, activeMenu, setActiveMenu }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("jagran_admin_session");
    document.cookie = "jagran_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin-login");
  };

  const navItems = [
    {
      id: "survey-data",
      label: "Survey Data",
      subLabel: "सर्वे फॉर्म डेटा",
      icon: FaTableCells,
      href: "/admin/dashboard",
    },
    {
      id: "story-publish",
      label: "Publish Story",
      subLabel: "कहानी प्रकाशित करें",
      icon: FaNewspaper,
      href: "/admin/dashboard?tab=story-publish",
    },
    {
      id: "gallery-mgmt",
      label: "Gallery Management",
      subLabel: "गैलरी प्रबंधन",
      icon: FaImages,
      href: "/admin/gallery",
    },
    {
      id: "analytics",
      label: "Analytics",
      subLabel: "एनालिटिक्स",
      icon: FaChartPie,
      href: "/admin/dashboard?tab=analytics",
    },
    {
      id: "leads",
      label: "Contact Leads",
      subLabel: "कॉन्टैक्ट लीड्स",
      icon: FaAddressBook,
      href: "/admin/dashboard?tab=leads",
    },
    {
      id: "notifications",
      label: "Push Notification",
      subLabel: "पुश नोटिफिकेशन",
      icon: FaBell,
      href: "/admin/dashboard?tab=notifications",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-60 xl:w-64 h-screen bg-[var(--primary)] text-white flex flex-col justify-between transition-transform duration-300 shadow-xl shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col min-h-0">
          {/* Sidebar Header with Logo */}
          <div className="p-4 border-b border-red-800/60 flex items-center justify-between shrink-0">
            <Link
              href="/"
              className="bg-white p-2 rounded-2xl inline-block shadow-md hover:scale-[1.02] transition-transform"
            >
              <Image
                src={Logo}
                alt="Logo"
                width={130}
                height={40}
                className="h-8.5 w-auto object-contain"
                priority
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white p-2"
            >
              <FaXmark className="text-xl" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeMenu
                ? activeMenu === item.id
                : pathname === item.href || (item.id === "gallery-mgmt" && pathname.startsWith("/admin/gallery"));

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveMenu) {
                      setActiveMenu(item.id);
                    }
                    if (setSidebarOpen) {
                      setSidebarOpen(false);
                    }
                    router.push(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-[var(--primary)] shadow-lg shadow-red-950/20"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="text-lg shrink-0" />
                  <div className="text-left leading-tight">
                    <div className="font-extrabold text-xs sm:text-sm tracking-tight">
                      {item.label}
                    </div>
                    <div className="text-[10px] opacity-75 font-medium">
                      {item.subLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Fixed Logout */}
        <div className="p-3.5 border-t border-red-800/60 shrink-0 bg-[var(--primary)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <FaRightFromBracket className="text-lg shrink-0 text-white" />
            <div className="text-left leading-tight">
              <div className="font-extrabold text-xs sm:text-sm tracking-tight">
                Logout
              </div>
              <div className="text-[10px] opacity-80 font-medium">लॉगआउट</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
