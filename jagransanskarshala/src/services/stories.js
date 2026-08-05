// src/services/stories.js
// Production service layer connected to Node.js Backend API & MongoDB Database.

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BACKEND}/api/v1`;

export const DEFAULT_CAMPAIGN_WEEKS = [
  {
    id: 1,
    weekEn: "Week 1",
    weekHi: "सप्ताह 1",
    titleEn: "Attention",
    titleHi: "ध्यान",
    descEn: "What helps attention stay where it matters?",
    descHi: "ध्यान को वहाँ बनाए रखने में क्या मदद करता है जहाँ यह वास्तव में मायने रखता है?",
    isPublished: false,
    publishDateEn: "11th August 2026",
    publishDateHi: "11 अगस्त 2026",
  },
  {
    id: 2,
    weekEn: "Week 2",
    weekHi: "सप्ताह 2",
    titleEn: "Intention",
    titleHi: "इरादा",
    descEn: "What helps intention remain visible after attention shifts?",
    descHi: "ध्यान भटकने के बाद भी इरादे को स्पष्ट बनाए रखने में क्या मदद करता है?",
    isPublished: false,
    publishDateEn: "14th August 2026",
    publishDateHi: "14 अगस्त 2026",
  },
  {
    id: 3,
    weekEn: "Week 3",
    weekHi: "सप्ताह 3",
    titleEn: "Presence",
    titleHi: "उपस्थिति",
    descEn: "What helps full presence survive in a physical world amidst constant digital availability?",
    descHi: "निरंतर डिजिटल उपस्थिति के बीच भौतिक दुनिया में पूर्ण मौजूदगी बनाए रखने में क्या मदद करता है?",
    isPublished: false,
    publishDateEn: "18th August 2026",
    publishDateHi: "18 अगस्त 2026",
  },
  {
    id: 4,
    weekEn: "Week 4",
    weekHi: "सप्ताह 4",
    titleEn: "Pause",
    titleHi: "विराम",
    descEn: "What happens when pauses become rare?",
    descHi: "क्या होता है जब जीवन में विराम और ठहराव दुर्लभ हो जाते हैं?",
    isPublished: false,
    publishDateEn: "21st August 2026",
    publishDateHi: "21 अगस्त 2026",
  },
  {
    id: 5,
    weekEn: "Week 5",
    weekHi: "सप्ताह 5",
    titleEn: "Priority",
    titleHi: "प्राथमिकता",
    descEn: "How does one prioritize amidst infinite content?",
    descHi: "असीम सूचनाओं और कंटेंट के बीच कोई अपनी प्राथमिकताएं कैसे तय करे?",
    isPublished: false,
    publishDateEn: "25th August 2026",
    publishDateHi: "25 अगस्त 2026",
  },
  {
    id: 6,
    weekEn: "Week 6",
    weekHi: "सप्ताह 6",
    titleEn: "Return",
    titleHi: "वापसी",
    descEn: "How does one return to what truly matters after drifting?",
    descHi: "भटकने के बाद कोई उस ओर कैसे वापस लौटे जो वास्तव में मायने रखता है?",
    isPublished: false,
    publishDateEn: "27th August 2026",
    publishDateHi: "27 अगस्त 2026",
  },
  {
    id: 7,
    weekEn: "Week 7",
    weekHi: "सप्ताह 7",
    titleEn: "Identity",
    titleHi: "पहचान",
    descEn: "How does identity remain self-directed amidst endless comparison?",
    descHi: "अनंत तुलनाओं के बीच अपनी पहचान को आत्म-निर्देशित कैसे रखा जाए?",
    isPublished: false,
    publishDateEn: "1st September 2026",
    publishDateHi: "1 सितंबर 2026",
  },
  {
    id: 8,
    weekEn: "Week 8",
    weekHi: "सप्ताह 8",
    titleEn: "Depth",
    titleHi: "गहराई",
    descEn: "What protects depth in a fast-moving environment?",
    descHi: "तेज़ गति से बदलती दुनिया में विचारों की गहराई को क्या सुरक्षित रखता है?",
    isPublished: false,
    publishDateEn: "3rd September 2026",
    publishDateHi: "3 सितंबर 2026",
  },
];

export const storiesData = DEFAULT_CAMPAIGN_WEEKS;

export function resolveStoryPublishStatus(story) {
  if (!story) return false;
  if (story.scheduledDate) {
    const todayStr = new Date().toISOString().split("T")[0];
    return story.scheduledDate <= todayStr;
  }
  return Boolean(story.isPublished);
}

export function mergeWithDefaultWeeks(dbStories) {
  if (!dbStories || !Array.isArray(dbStories) || dbStories.length === 0) {
    return DEFAULT_CAMPAIGN_WEEKS;
  }

  const dbMap = new Map();
  dbStories.forEach((s) => {
    const id = Number(s.id || s.storyId);
    if (id) dbMap.set(id, s);
  });

  const merged = DEFAULT_CAMPAIGN_WEEKS.map((def) => {
    if (dbMap.has(def.id)) {
      const dbItem = dbMap.get(def.id);
      dbMap.delete(def.id);
      return {
        ...def,
        ...dbItem,
        isPublished: resolveStoryPublishStatus(dbItem),
      };
    }
    return def;
  });

  // Append any extra weeks added by admin in future (Week 9, 10...)
  dbMap.forEach((extraItem) => {
    merged.push({
      ...extraItem,
      isPublished: resolveStoryPublishStatus(extraItem),
    });
  });

  return merged;
}

/**
 * Fetch all live stories from MongoDB Backend API
 */
export async function getStories() {
  try {
    const res = await fetch(`${API_BASE_URL}/stories/all`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data.data)) {
      return mergeWithDefaultWeeks(data.data);
    }
  } catch (e) {
    console.error("Error fetching stories from backend API:", e);
  }
  return DEFAULT_CAMPAIGN_WEEKS;
}

/**
 * Fetch single story by storyId from MongoDB Backend API
 */
export async function getStoryById(id) {
  const numId = Number(id);
  try {
    const res = await fetch(`${API_BASE_URL}/stories/${numId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data?.success && data.data) {
      return {
        ...data.data,
        id: data.data.storyId || data.data.id,
        isPublished: resolveStoryPublishStatus(data.data),
      };
    }
  } catch (e) {
    console.error(`Error fetching story ID ${id} from backend API:`, e);
  }

  const allStories = await getStories();
  const story = allStories.find((s) => Number(s.id || s.storyId) === numId);
  return story || null;
}
