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
    question: "Do you own a mobile phone?",
    options: ["Yes", "No"],
    type: "single",
  },
  {
    id: "q2",
    question: "How many hours a day you spend on your phone?",
    options: ["1-2", "2-4", "more than 4 hrs"],
    type: "single",
  },
  {
    id: "q3",
    question: "What kind of content you consume most on Phones?",
    options: [
      "Educational",
      "Entertainment",
      "Gaming",
      "Social Media",
      "News & Information",
      "Devotional",
    ],
    type: "single",
  },
  {
    id: "q4",
    question:
      "I need to re-read paragraphs or review information due to distractions from device notification",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q5",
    question:
      "I pick-up the phone for something Important and end-up scrolling through unnecessary content",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q6",
    question: "I check my phone during in-person conversation",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q7",
    question:
      "Habit to scroll phone interrupts me from reading book or watching content on bigger screen.",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q8",
    question:
      "I find myself scrolling through my phone even if I am no longer interested or entertained.",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q9",
    question:
      "Returning to original work after phone-breaks interrupts my focus.",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q10",
    question:
      "After seeing other's post, I feel my own looks/life/ successes aren't good enough",
    options: ["Always", "Sometime", "Never"],
    type: "single",
  },
  {
    id: "q11",
    question:
      "Do you feel your phone takes away time from things that matter to you?",
    options: ["Yes", "Sometime", "No"],
    type: "single",
  },
  {
    id: "q12",
    question: "Have you ever tried to reduce or control your phone use?",
    options: [
      "Yes, and it worked",
      "Yes, but it didn't last",
      "Thought about it, but never tried",
      "No",
    ],
    type: "single",
  },
  {
    id: "q13",
    question: "When you think about your phone habits, you mostly feel",
    options: [
      "Frustrated with myself",
      "A little guilty",
      "I really don't think about it",
      "It doesn't bother me",
      "It's normal, everyone is like this",
    ],
    type: "single",
  },
  {
    id: "q14",
    question: "The biggest thing that pulls you back to the phone is?",
    options: [
      "Habit",
      "Fear of Missing out",
      "Boredom",
      "All my friends are there",
      "Notifications",
      "Nothing else to do",
    ],
    type: "single",
  },
  {
    id: "q15",
    question:
      "How much infinite short-format content on your phone affect your ability to deeply understand complex issues?",
    options: [
      "Completely prevents deep understanding",
      "Significantly reduces my understanding",
      "Has a minor effect",
      "Does not affect my understanding at all",
    ],
    type: "single",
  },
];

// ─── Grade Mapping by Option Index (Ans 1 = Index 0, Ans 2 = Index 1, ...) ───
// Exactly matches the client spreadsheet matrix:
// Q2:  Ans1: A++, Ans2: A+,  Ans3: A
// Q3:  Ans1: A++, Ans2: A,   Ans3: A,  Ans4: A+,  Ans5: A++, Ans6: A+
// Q4:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q5:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q6:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q7:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q8:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q9:  Ans1: A,   Ans2: A+,  Ans3: A++
// Q10: Ans1: A++, Ans2: A+,  Ans3: A,  Ans4: A
// Q11: Ans1: A++, Ans2: A+,  Ans3: A
// Q12: Ans1: A,   Ans2: A,   Ans3: A+, Ans4: A+,  Ans5: A++, Ans6: A
// Q13: Ans1: A,   Ans2: A,   Ans3: A,  Ans4: A+,  Ans5: A++, Ans6: A
// Q14: Ans1: A,   Ans2: A,   Ans3: A+, Ans4: A++, Ans5: A++, Ans6: A++
// Q15: Ans1: A++, Ans2: A+,  Ans3: A,  Ans4: A

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

  // Multiple-select: find highest grade among selected options
  if (Array.isArray(answer)) {
    let highestGrade = null;
    let highestPriority = -1;

    for (const optText of answer) {
      const idx = qObj.options.indexOf(optText);
      if (idx !== -1 && indexGrades[idx]) {
        const grade = indexGrades[idx];
        if (GRADE_PRIORITY[grade] !== undefined && GRADE_PRIORITY[grade] > highestPriority) {
          highestPriority = GRADE_PRIORITY[grade];
          highestGrade = grade;
        }
      }
    }
    return highestGrade;
  }

  // Single-select: find index of option text
  const idx = qObj.options.indexOf(answer);
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
