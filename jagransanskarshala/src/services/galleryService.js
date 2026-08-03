// src/services/galleryService.js
// Gallery API service and data store.
// Structured by categories/events for easy backend integration.

export const galleryTabs = [
  {
    id: "all",
    title: {
      hi: "संस्कृति से संस्कार",
      en: "Sanskriti Se Sanskar",
    },
    subtitle: {
      hi: "(All Images)",
      en: "(All Images)",
    },
    year: "All",
  },
  {
    id: "2020",
    title: {
      hi: "Sanskrti Se Sanskar",
      en: "Sanskrti Se Sanskar",
    },
    subtitle: {
      hi: "(2020)",
      en: "(2020)",
    },
    year: "2020",
  },
  {
    id: "2021",
    title: {
      hi: "Desh Se Hum Aur",
      en: "Desh Se Hum Aur",
    },
    subtitle: {
      hi: "Humse Desh Banta Hai (2021)",
      en: "Humse Desh Banta Hai (2021)",
    },
    year: "2021",
  },
  {
    id: "2022",
    title: {
      hi: "Digital Sanskar",
      en: "Digital Sanskar",
    },
    subtitle: {
      hi: "(2022)",
      en: "(2022)",
    },
    year: "2022",
  },
  {
    id: "2023",
    title: {
      hi: "Urja Saksharta",
      en: "Urja Saksharta",
    },
    subtitle: {
      hi: "(2023)",
      en: "(2023)",
    },
    year: "2023",
  },
  {
    id: "2024",
    title: {
      hi: "Sanskarshala 2024",
      en: "Sanskarshala 2024",
    },
    subtitle: {
      hi: "",
      en: "",
    },
    year: "2024",
  },
  {
    id: "2025",
    title: {
      hi: "Sanskarshala 2025",
      en: "Sanskarshala 2025",
    },
    subtitle: {
      hi: "",
      en: "",
    },
    year: "2025",
    isLatest: true,
  },
];

// Gallery Categories Data - Initially Empty (Data will be pushed from Admin Dashboard to Backend)
export const initialGalleryCategories = [];

export async function getGalleryData(year = "All") {
  let categories = [...initialGalleryCategories];
  if (typeof window !== "undefined") {
    const savedCats = localStorage.getItem("jagran_admin_gallery_categories");
    if (savedCats) {
      try {
        categories = JSON.parse(savedCats);
      } catch (e) {
        console.error("Error parsing saved categories", e);
      }
    }
  }
  if (year && year !== "All" && year !== "all") {
    categories = categories.filter((cat) => cat.year === year);
  }
  return Promise.resolve(categories);
}


