// src/services/latestUpdates.js
// Production service layer connected to Node.js Backend API & MongoDB Database.

import { getStories, resolveStoryPublishStatus } from "./stories";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function getLatestUpdates() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/notifications/published`, {
      cache: "no-store",
    });

    let publishedNotifications = [];
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        publishedNotifications = json.data;
      }
    }

    // Fetch active published stories and get the LATEST published story (highest storyId)
    const allStories = await getStories();
    const publishedStories = allStories.filter((s) =>
      resolveStoryPublishStatus(s)
    );

    // Sort descending by storyId to pick the latest published story
    publishedStories.sort(
      (a, b) => Number(b.id || b.storyId) - Number(a.id || a.storyId)
    );

    const latestPublishedStory = publishedStories[0];
    const defaultStoryLink = latestPublishedStory
      ? `/story/${latestPublishedStory.id || latestPublishedStory.storyId}`
      : "/#till-now";

    return publishedNotifications.map((item) => {
      let rawLink = (item.link || "").trim();
      let targetLink = defaultStoryLink;

      if (rawLink && rawLink !== "-" && rawLink !== "#") {
        targetLink = rawLink;
      }

      // If text mentions "Latest Stories" or "नवीनतम कहानियाँ", auto route to latest published story!
      const msgText = ((item.msgEn || "") + " " + (item.msgHi || "")).toLowerCase();
      if (msgText.includes("latest stor") || msgText.includes("नवीनतम कहानियाँ")) {
        targetLink = defaultStoryLink;
      }

      return {
        id: item._id,
        titleEn: item.msgEn || "",
        titleHi: item.msgHi || "",
        link: targetLink,
        actionType: "navigate",
      };
    });
  } catch (error) {
    console.error("Failed to fetch latest updates:", error);
    return [];
  }
}
