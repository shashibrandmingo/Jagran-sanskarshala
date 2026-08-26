/**
 * Shared Survey Questions & Grade Calculation Service
 * Used by both Student and Parent survey pages.
 *
 * Grade Mapping:
 * - Q1: No grade (informational only)
 * - Q2-Q15: Each answer option index (Ans 1, Ans 2, Ans 3...) maps to A++ / A+ / A
 *   based directly on client Excel matrix.
 * - Q3 is multiple-select: highest grade among selected options counts.
 * - Final grade = grade with maximum count among Q2-Q15.
 * - Tie-breaking: A++ > A+ > A (higher grade wins).
 */

// ─── All 15 Survey Questions (shared between Student & Parent) ─────────────
export const QUESTIONS = [
  {
    id: "q1",
    questionEn: "Do you own a mobile phone?",
    questionHi: "क्या आपके पास अपना मोबाइल फोन है?",
    question: "Do you own a mobile phone? / क्या आपके पास अपना मोबाइल फोन है?",
    options: [
      { en: "Yes", hi: "हाँ", value: "Yes / हाँ" },
      { en: "No", hi: "नहीं", value: "No / नहीं" },
    ],
    type: "single",
  },
  {
    id: "q2",
    questionEn: "How many hours a day you spend on your phone?",
    questionHi: "आप रोज कितने घंटे मोबाइल फोन इस्तेमाल करते हैं?",
    question:
      "How many hours a day you spend on your phone? / आप रोज कितने घंटे मोबाइल फोन इस्तेमाल करते हैं?",
    options: [
      { en: "1-2", hi: "1–2 घंटे", value: "1-2 / 1–2 घंटे" },
      { en: "2-4", hi: "2–4 घंटे", value: "2-4 / 2–4 घंटे" },
      {
        en: "more than 4 hrs",
        hi: "4 घंटे से अधिक",
        value: "more than 4 hrs / 4 घंटे से अधिक",
      },
    ],
    type: "single",
  },
  {
    id: "q3",
    questionEn: "What kind of content you consume most on Phones?",
    questionHi: "आप मोबाइल फोन पर सबसे ज्यादा किस तरह का कंटेंट देखते हैं?",
    question:
      "What kind of content you consume most on Phones? / आप मोबाइल फोन पर सबसे ज्यादा किस तरह का कंटेंट देखते हैं?",
    options: [
      {
        en: "Educational",
        hi: "पढ़ाई से जुड़ी सामग्री",
        value: "Educational / पढ़ाई से जुड़ी सामग्री",
      },
      { en: "Entertainment", hi: "मनोरंजन", value: "Entertainment / मनोरंजन" },
      { en: "Gaming", hi: "गेमिंग", value: "Gaming / गेमिंग" },
      {
        en: "Social Media",
        hi: "सोशल मीडिया",
        value: "Social Media / सोशल मीडिया",
      },
      {
        en: "News & Information",
        hi: "समाचार और जानकारी",
        value: "News & Information / समाचार और जानकारी",
      },
      {
        en: "Devotional",
        hi: "धार्मिक / आध्यात्मिक सामग्री",
        value: "Devotional / धार्मिक / आध्यात्मिक सामग्री",
      },
    ],
    type: "single",
  },
  {
    id: "q4",
    questionEn:
      "I need to re-read paragraphs or review information due to distractions from device notification",
    questionHi:
      "मोबाइल पर आने वाले नोटिफिकेशन के कारण मेरा ध्यान भटक जाता है और मुझे पढ़े हुए पैराग्राफ या जानकारी को दोबारा पढ़ना पड़ता है।",
    question:
      "I need to re-read paragraphs or review information due to distractions from device notification / मोबाइल पर आने वाले नोटिफिकेशन के कारण मेरा ध्यान भटक जाता है और मुझे पढ़े हुए पैराग्राफ या जानकारी को दोबारा पढ़ना पड़ता है।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q5",
    questionEn:
      "I pick-up the phone for something Important and end-up scrolling through unnecessary content",
    questionHi:
      "मैं किसी जरूरी काम के लिए मोबाइल उठाता/उठाती हूँ, लेकिन फिर गैर-जरूरी चीजें देखने में लग जाता/जाती हूँ।",
    question:
      "I pick-up the phone for something Important and end-up scrolling through unnecessary content / मैं किसी जरूरी काम के लिए मोबाइल उठाता/उठाती हूँ, लेकिन फिर गैर-जरूरी चीजें देखने में लग जाता/जाती हूँ।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q6",
    questionEn: "I check my phone during in-person conversation",
    questionHi:
      "लोगों से आमने-सामने बात करते समय भी मैं मोबाइल चेक करता/करती हूँ।",
    question:
      "I check my phone during in-person conversation / लोगों से आमने-सामने बात करते समय भी मैं मोबाइल चेक करता/करती हूँ।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q7",
    questionEn:
      "Habit to scroll phone interrupts me from reading book or watching content on bigger screen.",
    questionHi:
      "मोबाइल पर लगातार स्क्रॉल करने की आदत के कारण मेरा ध्यान किताब पढ़ने या बड़ी स्क्रीन पर कुछ देखने से हट जाता है।",
    question:
      "Habit to scroll phone interrupts me from reading book or watching content on bigger screen. / मोबाइल पर लगातार स्क्रॉल करने की आदत के कारण मेरा ध्यान किताब पढ़ने या बड़ी स्क्रीन पर कुछ देखने से हट जाता है।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q8",
    questionEn:
      "I find myself scrolling through my phone even if I am no longer interested or entertained.",
    questionHi:
      "किसी चीज में रुचि न होने के बावजूद मैं मोबाइल पर स्क्रॉल करता/करती रहता/रहती हूँ।",
    question:
      "I find myself scrolling through my phone even if I am no longer interested or entertained. / किसी चीज में रुचि न होने के बावजूद मैं मोबाइल पर स्क्रॉल करता/करती रहता/रहती हूँ।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q9",
    questionEn:
      "Returning to original work after phone-breaks interrupts my focus.",
    questionHi:
      "मोबाइल देखने के बाद अपने मूल काम पर लौटने में मेरा ध्यान भटकता है।",
    question:
      "Returning to original work after phone-breaks interrupts my focus. / मोबाइल देखने के बाद अपने मूल काम पर लौटने में मेरा ध्यान भटकता है।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q10",
    questionEn:
      "After seeing other's post, I feel my own looks/life/ successes aren't good enough",
    questionHi:
      "दूसरों की सोशल मीडिया पोस्ट देखने के बाद मुझे लगता है कि मेरा रूप, जीवन या सफलता उतनी अच्छी नहीं है।",
    question:
      "After seeing other's post, I feel my own looks/life/ successes aren't good enough / दूसरों की सोशल मीडिया पोस्ट देखने के बाद मुझे लगता है कि मेरा रूप, जीवन या सफलता उतनी अच्छी नहीं है।",
    options: [
      { en: "Always", hi: "हमेशा", value: "Always / हमेशा" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "Never", hi: "कभी नहीं", value: "Never / कभी नहीं" },
    ],
    type: "single",
  },
  {
    id: "q11",
    questionEn:
      "Do you feel your phone takes away time from things that matter to you?",
    questionHi:
      "क्या आपको लगता है कि मोबाइल फोन उन चीजों के लिए आपका समय कम कर देता है, जो आपके लिए महत्वपूर्ण हैं?",
    question:
      "Do you feel your phone takes away time from things that matter to you? / क्या आपको लगता है कि मोबाइल फोन उन चीजों के लिए आपका समय कम कर देता है, जो आपके लिए महत्वपूर्ण हैं?",
    options: [
      { en: "Yes", hi: "हाँ", value: "Yes / हाँ" },
      { en: "Sometime", hi: "कभी-कभी", value: "Sometime / कभी-कभी" },
      { en: "No", hi: "नहीं", value: "No / नहीं" },
    ],
    type: "single",
  },
  {
    id: "q12",
    questionEn: "Have you ever tried to reduce or control your phone use?",
    questionHi:
      "क्या आपने कभी मोबाइल का इस्तेमाल कम करने या उस पर नियंत्रण रखने की कोशिश की है?",
    question:
      "Have you ever tried to reduce or control your phone use? / क्या आपने कभी मोबाइल का इस्तेमाल कम करने या उस पर नियंत्रण रखने की कोशिश की है?",
    options: [
      {
        en: "Yes, and it worked",
        hi: "हाँ, और मुझे इसमें सफलता मिली",
        value: "Yes, and it worked / हाँ, और मुझे इसमें सफलता मिली",
      },
      {
        en: "Yes, but it didn't last",
        hi: "हाँ, लेकिन यह ज्यादा समय तक नहीं चल पाया",
        value: "Yes, but it didn't last / हाँ, लेकिन यह ज्यादा समय तक नहीं चल पाया",
      },
      {
        en: "Thought about it, but never tried",
        hi: "मैंने सोचा है, लेकिन कभी कोशिश नहीं की",
        value:
          "Thought about it, but never tried / मैंने सोचा है, लेकिन कभी कोशिश नहीं की",
      },
      { en: "No", hi: "नहीं", value: "No / नहीं" },
    ],
    type: "single",
  },
  {
    id: "q13",
    questionEn: "When you think about your phone habits, you mostly feel",
    questionHi:
      "जब आप अपनी मोबाइल की आदत के बारे में सोचते हैं, तो आपको कैसा महसूस होता है?",
    question:
      "When you think about your phone habits, you mostly feel / जब आप अपनी मोबाइल की आदत के बारे में सोचते हैं, तो आपको कैसा महसूस होता है?",
    options: [
      {
        en: "Frustrated with myself",
        hi: "मुझे खुद से निराशा होती है",
        value: "Frustrated with myself / मुझे खुद से निराशा होती है",
      },
      {
        en: "A little guilty",
        hi: "मुझे थोड़ा अपराधबोध होता है",
        value: "A little guilty / मुझे थोड़ा अपराधबोध होता है",
      },
      {
        en: "I really don't think about it",
        hi: "मैं इसके बारे में ज्यादा सोचता/सोचती नहीं हूँ",
        value:
          "I really don't think about it / मैं इसके बारे में ज्यादा सोचता/सोचती नहीं हूँ",
      },
      {
        en: "It doesn't bother me",
        hi: "मुझे इससे कोई परेशानी नहीं होती",
        value: "It doesn't bother me / मुझे इससे कोई परेशानी नहीं होती",
      },
      {
        en: "It's normal, everyone is like this",
        hi: "यह सामान्य है, आजकल सब ऐसे ही हैं",
        value:
          "It's normal, everyone is like this / यह सामान्य है, आजकल सब ऐसे ही हैं",
      },
    ],
    type: "single",
  },
  {
    id: "q14",
    questionEn: "The biggest thing that pulls you back to the phone is?",
    questionHi:
      "आपको बार-बार मोबाइल की ओर वापस खींचने वाली सबसे बड़ी वजह क्या है?",
    question:
      "The biggest thing that pulls you back to the phone is? / आपको बार-बार मोबाइल की ओर वापस खींचने वाली सबसे बड़ी वजह क्या है?",
    options: [
      { en: "Habit", hi: "आदत", value: "Habit / आदत" },
      {
        en: "Fear of Missing out",
        hi: "कुछ छूट जाने का डर",
        value: "Fear of Missing out / कुछ छूट जाने का डर",
      },
      { en: "Boredom", hi: "बोरियत", value: "Boredom / बोरियत" },
      {
        en: "All my friends are there",
        hi: "मेरे सभी दोस्त मोबाइल पर हैं",
        value: "All my friends are there / मेरे सभी दोस्त मोबाइल पर हैं",
      },
      { en: "Notifications", hi: "नोटिफिकेशन", value: "Notifications / नोटिफिकेशन" },
      {
        en: "Nothing else to do",
        hi: "करने के लिए और कुछ नहीं होता",
        value: "Nothing else to do / करने के लिए और कुछ नहीं होता",
      },
    ],
    type: "single",
  },
  {
    id: "q15",
    questionEn:
      "Does infinite short-format content on your phone affect your ability to deeply understand complex issues?",
    questionHi:
      "क्या मोबाइल पर लगातार मिलने वाली छोटी-छोटी वीडियो सामग्री का असर जटिल विषयों को गहराई से समझने की आपकी क्षमता पर पड़ता है?",
    question:
      "Does infinite short-format content on your phone affect your ability to deeply understand complex issues? / क्या मोबाइल पर लगातार मिलने वाली छोटी-छोटी वीडियो सामग्री का असर जटिल विषयों को गहराई से समझने की आपकी क्षमता पर पड़ता है?",
    options: [
      {
        en: "Completely prevents deep understanding",
        hi: "इससे मैं किसी जटिल विषय को गहराई से समझ ही नहीं पाता/पाती",
        value:
          "Completely prevents deep understanding / इससे मैं किसी जटिल विषय को गहराई से समझ ही नहीं पाता/पाती",
      },
      {
        en: "Significantly reduces my understanding",
        hi: "इससे मेरी समझ काफी कम हो जाती है",
        value:
          "Significantly reduces my understanding / इससे मेरी समझ काफी कम हो जाती है",
      },
      {
        en: "Has a minor effect",
        hi: "इसका थोड़ा-बहुत असर पड़ता है",
        value: "Has a minor effect / इसका थोड़ा-बहुत असर पड़ता है",
      },
      {
        en: "Does not affect my understanding at all",
        hi: "इसका मेरी समझ पर कोई असर नहीं पड़ता",
        value:
          "Does not affect my understanding at all / इसका मेरी समझ पर कोई असर नहीं पड़ता",
      },
    ],
    type: "single",
  },
];

// ─── Grade Mapping by Option Index (Ans 1 = Index 0, Ans 2 = Index 1, ...) ───
const GRADE_MAP_BY_INDEX = {
  q2: ["A++", "A+", "A"],
  q3: ["A++", "A", "A", "A+", "A++", "A+"],
  q4: ["A", "A+", "A++"],
  q5: ["A", "A+", "A++"],
  q6: ["A", "A+", "A++"],
  q7: ["A", "A+", "A++"],
  q8: ["A", "A+", "A++"],
  q9: ["A", "A+", "A++"],
  q10: ["A++", "A+", "A", "A"],
  q11: ["A++", "A+", "A"],
  q12: ["A", "A", "A+", "A+", "A++", "A"],
  q13: ["A", "A", "A", "A+", "A++", "A"],
  q14: ["A", "A", "A+", "A++", "A++", "A++"],
  q15: ["A++", "A+", "A", "A"],
};

// Grade priority for tie-breaking: higher index = higher priority
const GRADE_PRIORITY = { A: 0, "A+": 1, "A++": 2 };

/**
 * Get the grade for a single question's answer based on option index.
 *
 * @param {string} questionId - e.g., "q2"
 * @param {string|string[]} answer - selected answer text(s)
 * @returns {string|null} - "A++", "A+", "A", or null
 */
function getGradeForAnswer(questionId, answer) {
  const indexGrades = GRADE_MAP_BY_INDEX[questionId];
  if (!indexGrades) return null; // Q1 or unmapped

  const qObj = QUESTIONS.find((q) => q.id === questionId);
  if (!qObj) return null;

  const findOptionIndex = (ansVal) => {
    if (!ansVal) return -1;
    return qObj.options.findIndex((opt) => {
      if (typeof opt === "string") return opt === ansVal;
      return (
        opt.value === ansVal ||
        opt.en === ansVal ||
        opt.hi === ansVal ||
        `${opt.en} / ${opt.hi}` === ansVal
      );
    });
  };

  // Multiple-select: find highest grade among selected options
  if (Array.isArray(answer)) {
    let highestGrade = null;
    let highestPriority = -1;

    for (const optVal of answer) {
      const idx = findOptionIndex(optVal);
      if (idx !== -1 && indexGrades[idx]) {
        const grade = indexGrades[idx];
        if (
          GRADE_PRIORITY[grade] !== undefined &&
          GRADE_PRIORITY[grade] > highestPriority
        ) {
          highestPriority = GRADE_PRIORITY[grade];
          highestGrade = grade;
        }
      }
    }
    return highestGrade;
  }

  // Single-select
  const idx = findOptionIndex(answer);
  if (idx !== -1 && indexGrades[idx]) {
    return indexGrades[idx];
  }

  return null;
}

/**
 * Calculate the final grade based on all answers.
 *
 * Logic:
 * 1. Skip Q1 (no grading)
 * 2. For Q2-Q15, map each answer index (Ans 1, Ans 2...) to a grade
 * 3. For Q3 (multiple-select): highest grade among selected options
 * 4. Count occurrences of A++, A+, A
 * 5. Final grade = grade with maximum count
 * 6. Tie-breaking: A++ > A+ > A (higher grade wins on tie)
 *
 * @param {Object} answers - { q1: "Yes", q2: "1-2", q3: ["Educational", "Social Media"], ... }
 * @returns {{ grade: string, breakdown: { "A++": number, "A+": number, "A": number } }}
 */
export function calculateGrade(answers) {
  const counts = { "A++": 0, "A+": 0, A: 0 };

  // Q2 through Q15 (skip Q1)
  for (let i = 2; i <= 15; i++) {
    const qId = `q${i}`;
    const answer = answers[qId];
    if (answer === undefined || answer === null) continue;

    const grade = getGradeForAnswer(qId, answer);
    if (grade && counts[grade] !== undefined) {
      counts[grade]++;
    }
  }

  // Determine the winning grade
  let finalGrade = "A"; // default
  let maxCount = 0;
  let maxPriority = -1;

  for (const [grade, count] of Object.entries(counts)) {
    const priority = GRADE_PRIORITY[grade];
    if (
      count > maxCount ||
      (count === maxCount && priority > maxPriority)
    ) {
      maxCount = count;
      maxPriority = priority;
      finalGrade = grade;
    }
  }

  return {
    grade: finalGrade,
    breakdown: { ...counts },
  };
}

/**
 * Get the correct certificate PDF filename for a given grade.
 * @param {string} grade - "A++", "A+", or "A"
 * @returns {string} - PDF filename (e.g., "CertificatefinalA++.pdf")
 */
export function getCertificateFileName(grade) {
  const validGrades = ["A++", "A+", "A"];
  if (validGrades.includes(grade)) {
    return `Certificatefinal${grade}.pdf`;
  }
  return "CertificatefinalA.pdf"; // fallback
}
