// src/services/stories.js
// Service layer for "Talks So Far" stories & weekly details.
// Can be directly connected to your Node.js backend API in the future.

export const storiesData = [
  {
    id: 1,
    weekEn: "Week 1",
    weekHi: "सप्ताह 1",
    isPublished: true,
    publishDateEn: "11th August 2026",
    publishDateHi: "11 अगस्त 2026",
    titleEn: "Attention",
    titleHi: "ध्यान",
    descEn: "What helps attention stay where it matters?",
    descHi: "ध्यान को वहाँ बनाए रखने में क्या मदद करता है जहाँ यह वास्तव में मायने रखता है?",
    fullBodyEn: `Before, it used to feel like...
Attention just wanders away.
Now it feels like...
It stays a little bit, everywhere.

In today's digital world, our minds are constantly splitting focus between multiple screens, notifications, and streams of information. Adolescents, being digital natives, often find themselves living in a state of continuous partial attention.

Through Sanskarshala 2026, we explore how practicing conscious attention helps young minds reclaim depth, build stronger family connections, and engage meaningfully with their surroundings.`,
    fullBodyHi: `पहले लगता था...
ध्यान भटक जाता है।
अब लगता है...
हर जगह थोड़ा-थोड़ा रह जाता है।

आज की डिजिटल दुनिया में, हमारा मन लगातार कई स्क्रीन, नोटिफिकेशन और सूचनाओं के बीच विभाजित रहता है। किशोर, डिजिटल नेटिव होने के नाते, अक्सर निरंतर आंशिक ध्यान की स्थिति में रहते हैं।

संस्कारशाला 2026 के माध्यम से, हम यह तलाशते हैं कि कैसे सचेत ध्यान का अभ्यास युवाओं को गहराई हासिल करने, मजबूत पारिवारिक संबंध बनाने और अपने आसपास के माहौल के साथ सार्थक रूप से जुड़ने में मदद करता है।`,
    link: "/story/1",
    image: null,
  },
  {
    id: 2,
    weekEn: "Week 2",
    weekHi: "सप्ताह 2",
    isPublished: false,
    publishDateEn: "14th August 2026",
    publishDateHi: "14 अगस्त 2026",
    titleEn: "Intention",
    titleHi: "इरादा",
    descEn: "What helps intention remain visible after attention shifts?",
    descHi: "ध्यान भटकने के बाद भी इरादे को स्पष्ट बनाए रखने में क्या मदद करता है?",
    fullBodyEn: `It was just meant to set an alarm... and suddenly an hour slipped by in mindless scrolling. Intention is the anchor that brings purpose back into our digital routine.`,
    fullBodyHi: `बस अलार्म लगाना था... और अचानक बिना सोचे-समझे स्क्रॉल करते हुए एक घंटा बीत गया। इरादा वह लंगर है जो हमारी डिजिटल दिनचर्या में उद्देश्य वापस लाता है।`,
    link: "/story/2",
  },
  {
    id: 3,
    weekEn: "Week 3",
    weekHi: "सप्ताह 3",
    isPublished: false,
    publishDateEn: "18th August 2026",
    publishDateHi: "18 अगस्त 2026",
    titleEn: "Presence",
    titleHi: "उपस्थिति",
    descEn: "What helps full presence survive in a physical world amidst constant digital availability?",
    descHi: "निरंतर डिजिटल उपस्थिति के बीच भौतिक दुनिया में पूर्ण मौजूदगी बनाए रखने में क्या मदद करता है?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/3",
  },
  {
    id: 4,
    weekEn: "Week 4",
    weekHi: "सप्ताह 4",
    isPublished: false,
    publishDateEn: "21st August 2026",
    publishDateHi: "21 अगस्त 2026",
    titleEn: "Pause",
    titleHi: "विराम",
    descEn: "What happens when pauses become rare?",
    descHi: "क्या होता है जब जीवन में विराम और ठहराव दुर्लभ हो जाते हैं?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/4",
  },
  {
    id: 5,
    weekEn: "Week 5",
    weekHi: "सप्ताह 5",
    isPublished: false,
    publishDateEn: "25th August 2026",
    publishDateHi: "25 अगस्त 2026",
    titleEn: "Priority",
    titleHi: "प्राथमिकता",
    descEn: "How does one prioritize amidst infinite content?",
    descHi: "असीम सूचनाओं और कंटेंट के बीच कोई अपनी प्राथमिकताएं कैसे तय करे?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/5",
  },
  {
    id: 6,
    weekEn: "Week 6",
    weekHi: "सप्ताह 6",
    isPublished: false,
    publishDateEn: "27th August 2026",
    publishDateHi: "27 अगस्त 2026",
    titleEn: "Return",
    titleHi: "वापसी",
    descEn: "How does one return to what truly matters after drifting?",
    descHi: "भटकने के बाद कोई उस ओर कैसे वापस लौटे जो वास्तव में मायने रखता है?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/6",
  },
  {
    id: 7,
    weekEn: "Week 7",
    weekHi: "सप्ताह 7",
    isPublished: false,
    publishDateEn: "1st September 2026",
    publishDateHi: "1 सितंबर 2026",
    titleEn: "Identity",
    titleHi: "पहचान",
    descEn: "How does identity remain self-directed amidst endless comparison?",
    descHi: "अनंत तुलनाओं के बीच अपनी पहचान को आत्म-निर्देशित कैसे रखा जाए?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/7",
  },
  {
    id: 8,
    weekEn: "Week 8",
    weekHi: "सप्ताह 8",
    isPublished: false,
    publishDateEn: "3rd September 2026",
    publishDateHi: "3 सितंबर 2026",
    titleEn: "Depth",
    titleHi: "गहराई",
    descEn: "What protects depth in a fast-moving environment?",
    descHi: "तेज़ गति से बदलती दुनिया में विचारों की गहराई को क्या सुरक्षित रखता है?",
    fullBodyEn: "Coming soon...",
    fullBodyHi: "जल्द आ रहा है...",
    link: "/story/8",
  },
];

export async function getStories() {
  return Promise.resolve(storiesData);
}

export async function getStoryById(id) {
  const numId = Number(id);
  const story = storiesData.find((s) => s.id === numId);
  return Promise.resolve(story || null);
}
