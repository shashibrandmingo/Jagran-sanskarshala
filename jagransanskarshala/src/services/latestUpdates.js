// src/services/latestUpdates.js
// API service for Latest Updates - Fetches published notifications from backend.

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function getLatestUpdates() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/notifications/published`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      return [];
    }

    // Map backend notification fields to frontend expected format
    return json.data.map((item) => ({
      id: item._id,
      titleEn: item.msgEn || "",
      titleHi: item.msgHi || "",
      link: item.link || "#",
      actionType: item.link && item.link !== "#" ? "navigate" : "none",
    }));
  } catch (error) {
    console.error("Failed to fetch latest updates:", error);
    return [];
  }
}
