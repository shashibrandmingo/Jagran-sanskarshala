// src/services/latestUpdates.js
// Mock data and API service for Latest Updates.
// Can be replaced with your Node.js backend API fetch in the future.

export const latestUpdatesData = [
  {
    id: 1,
    titleEn: "Read the Latest Stories & Stay Updated",
    titleHi: "नवीनतम कहानियाँ पढ़ें और अपडेट रहें",
    link: "/story/1",
    actionType: "navigate",
  },
  {
    id: 2,
    titleEn: "Participate in India's Largest Survey",
    titleHi: "भारत के सबसे बड़े सर्वे में भाग लें",
    link: "#",
    actionType: "surveyModal",
  },
  {
    id: 3,
    titleEn: "Download Your Participation Certificate After Completing the Survey",
    titleHi: "सर्वे पूरा करने के बाद अपना सहभागिता प्रमाणपत्र डाउनलोड करें",
    link: "#",
    actionType: "none",
  },
];

export async function getLatestUpdates() {
  // Simulated backend API response
  return Promise.resolve(latestUpdatesData);
}
