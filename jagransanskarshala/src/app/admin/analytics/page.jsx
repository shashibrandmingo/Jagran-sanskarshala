"use client";

import { useEffect, useState } from "react";
import AnalyticsView from "@/components/Admin/AnalyticsView";

export default function AnalyticsPage() {
  const [liveSurveys, setLiveSurveys] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchSurveys(token);
    }
  }, []);

  const fetchSurveys = async (token) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/survey/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) setLiveSurveys(data.data);
    } catch (err) {
      console.error("Error fetching surveys:", err);
    }
  };

  return (
    <>
      <header className="p-6 sm:p-8 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">एनालिटिक्स</p>
      </header>
      <div className="px-4 sm:px-8 pb-8">
        <AnalyticsView liveSurveys={liveSurveys} />
      </div>
    </>
  );
}
