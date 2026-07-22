import type {
  CheckinPrompt,
  CopingPlan,
  DoctorMatch,
  Emotion,
  JournalAnalysis,
  RiskAssessment,
  SentimentResult,
} from "./types";

const NEG = [
  "sad",
  "depressed",
  "alone",
  "lonely",
  "hopeless",
  "tired",
  "exhausted",
  "anxious",
  "worried",
  "scared",
  "stressed",
  "angry",
  "hurt",
  "broken",
  "cry",
];
const POS = [
  "good",
  "happy",
  "calm",
  "okay",
  "fine",
  "better",
  "grateful",
  "proud",
  "hopeful",
  "love",
  "thank",
];
const STRESS = ["stress", "overwhelm", "pressure", "deadline", "busy"];
const ANXIETY = ["anxious", "nervous", "panic", "worried", "fear"];
const SADNESS = ["sad", "lonely", "cry", "hopeless", "down"];
const ANGER = ["angry", "mad", "furious", "hate"];
const JOY = ["happy", "joy", "excited", "great"];
const GRATITUDE = ["grateful", "thankful", "thanks", "blessed"];

const CRISIS = [
  "kill myself",
  "suicide",
  "end my life",
  "want to die",
  "hurt myself",
  "self harm",
  "self-harm",
  "no reason to live",
  "better off dead",
  "take my life",
];

export function offlineCrisis(text: string): boolean {
  const t = text.toLowerCase();
  return CRISIS.some((p) => t.includes(p));
}

export function offlineSentiment(text: string): SentimentResult {
  const t = text.toLowerCase();
  const crisis = offlineCrisis(t);

  const negCount = NEG.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const posCount = POS.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);

  let emotion: Emotion = "neutral";
  if (STRESS.some((w) => t.includes(w))) emotion = "stress";
  else if (ANXIETY.some((w) => t.includes(w))) emotion = "anxiety";
  else if (SADNESS.some((w) => t.includes(w))) emotion = "sadness";
  else if (ANGER.some((w) => t.includes(w))) emotion = "anger";
  else if (GRATITUDE.some((w) => t.includes(w))) emotion = "gratitude";
  else if (JOY.some((w) => t.includes(w))) emotion = "joy";

  const intensityScore = Math.max(negCount, posCount);
  const intensity =
    intensityScore >= 3 ? "high" : intensityScore >= 1 ? "medium" : "low";

  const score = Math.max(-1, Math.min(1, (posCount - negCount) / 5));

  return {
    emotion,
    intensity,
    score,
    keywords: [],
    crisis,
  };
}

export function offlineCoping(emotion: Emotion): CopingPlan {
  const map: Record<Emotion, CopingPlan> = {
    stress: {
      steps: [
        {
          title: "Slow breath",
          detail: "Breathe in 4, hold 4, out 4. Repeat for 1 minute.",
          icon: "air",
          minutes: 2,
        },
        {
          title: "Name it",
          detail: "Write the one thing that is heaviest right now.",
          icon: "edit-note",
          minutes: 5,
        },
        {
          title: "Move a little",
          detail: "Stretch or walk for a few minutes to release tension.",
          icon: "directions-walk",
          minutes: 5,
        },
      ],
      primary_action: { label: "Try breathing", route: "breathing" },
    },
    anxiety: {
      steps: [
        {
          title: "Ground yourself",
          detail: "Name 5 things you see, 4 you can touch, 3 you hear.",
          icon: "self-improvement",
          minutes: 3,
        },
        {
          title: "Box breathing",
          detail: "Calm your nervous system with steady breaths.",
          icon: "air",
          minutes: 4,
        },
        {
          title: "Talk to AI Mate",
          detail: "Share what is on your mind in a safe space.",
          icon: "forum",
          minutes: 5,
        },
      ],
      primary_action: { label: "Open AI Mate", route: "ai-mate" },
    },
    sadness: {
      steps: [
        {
          title: "A kind word",
          detail: "Read today's affirmation. Let it land.",
          icon: "tips-and-updates",
          minutes: 1,
        },
        {
          title: "Write it out",
          detail: "Put what you feel on the page. No one else reads it.",
          icon: "edit-note",
          minutes: 8,
        },
        {
          title: "Reach out",
          detail: "A quick message to someone you trust can shift the day.",
          icon: "forum",
          minutes: 5,
        },
      ],
      primary_action: { label: "Open Journal", route: "journal" },
    },
    anger: {
      steps: [
        {
          title: "Pause and breathe",
          detail: "Slow exhales calm the anger response.",
          icon: "air",
          minutes: 2,
        },
        {
          title: "Walk it off",
          detail: "Movement helps process strong feelings.",
          icon: "directions-walk",
          minutes: 10,
        },
        {
          title: "Write it down",
          detail: "Get the story out before talking to anyone.",
          icon: "edit-note",
          minutes: 5,
        },
      ],
      primary_action: { label: "Try breathing", route: "breathing" },
    },
    joy: {
      steps: [
        {
          title: "Savor it",
          detail: "Notice the good feeling for a full minute.",
          icon: "self-improvement",
          minutes: 1,
        },
        {
          title: "Write what helped",
          detail: "Note what made today feel good so you can repeat it.",
          icon: "edit-note",
          minutes: 3,
        },
        {
          title: "Share it",
          detail: "Tell someone what you appreciated today.",
          icon: "forum",
          minutes: 5,
        },
      ],
      primary_action: { label: "Open Journal", route: "journal" },
    },
    gratitude: {
      steps: [
        {
          title: "Three thanks",
          detail: "Name three small things you're grateful for.",
          icon: "edit-note",
          minutes: 3,
        },
        {
          title: "Send thanks",
          detail: "Tell one person what you appreciate about them.",
          icon: "forum",
          minutes: 4,
        },
        {
          title: "Quiet moment",
          detail: "Sit and breathe slowly for a minute.",
          icon: "self-improvement",
          minutes: 2,
        },
      ],
      primary_action: { label: "Open Journal", route: "journal" },
    },
    neutral: {
      steps: [
        {
          title: "Check in",
          detail: "Notice how your body feels right now.",
          icon: "self-improvement",
          minutes: 2,
        },
        {
          title: "Drink water",
          detail: "Hydration affects mood more than we think.",
          icon: "local-drink",
          minutes: 1,
        },
        {
          title: "One small step",
          detail: "Pick the smallest thing on your mind and do it.",
          icon: "tips-and-updates",
          minutes: 5,
        },
      ],
      primary_action: { label: "Try breathing", route: "breathing" },
    },
  };
  return map[emotion];
}

export function offlineRisk(
  moods: { mood: string }[],
  recentText?: string,
): RiskAssessment {
  if (recentText && offlineCrisis(recentText)) {
    return {
      risk_level: "high",
      signals: ["Crisis language detected"],
      guidance:
        "Please reach out for support right now. Open the Support tab for emergency lines.",
      suggest_support: true,
    };
  }
  const negative = moods.filter((m) =>
    ["sad", "anxious", "low", "stressed", "tired"].includes(m.mood),
  ).length;
  const total = moods.length;
  if (total === 0)
    return {
      risk_level: "low",
      signals: ["Not enough mood data yet"],
      guidance: "Log your mood each day for clearer insights.",
      suggest_support: false,
    };
  const ratio = negative / total;
  if (ratio >= 0.7)
    return {
      risk_level: "elevated",
      signals: [
        `${negative} of last ${total} entries were low or anxious`,
        "Negative trend across recent days",
      ],
      guidance:
        "Your week has been heavy. Consider talking to AI Mate or booking a doctor.",
      suggest_support: true,
    };
  if (ratio >= 0.4)
    return {
      risk_level: "moderate",
      signals: [`${negative} of ${total} entries leaned negative`],
      guidance:
        "A mixed week. Try one small care step today, like breathing or a short journal.",
      suggest_support: false,
    };
  return {
    risk_level: "low",
    signals: ["Mood mostly stable"],
    guidance: "Keep checking in. Small daily care makes a difference.",
    suggest_support: false,
  };
}

export function offlineCheckin(
  timeOfDay: "morning" | "evening",
): CheckinPrompt {
  if (timeOfDay === "morning") {
    return {
      question: "How would you like today to feel?",
      placeholder: "One word or a short line...",
    };
  }
  return {
    question: "What is one thing that mattered today?",
    placeholder: "Big or small...",
  };
}

export function offlineDoctorMatch(
  symptoms: string,
  allowed: string[],
): DoctorMatch {
  const t = symptoms.toLowerCase();
  let pick = "general";
  if (
    /(sad|anxious|stress|depress|panic|sleep|mood|cry|lonely|worry)/.test(t)
  )
    pick = "mental-health";
  else if (/(child|baby|infant|toddler|kid)/.test(t)) pick = "pediatrics";
  else if (/(pregnan|menstr|period|gyno|labor)/.test(t)) pick = "obgyn";
  else if (/(chest|heart|palpitation|hypertension)/.test(t))
    pick = "cardiology";
  else if (/(skin|rash|itch|acne)/.test(t)) pick = "dermatology";
  else if (/(diabet|blood pressure|chronic)/.test(t)) pick = "internal";

  if (!allowed.includes(pick)) pick = allowed[0] ?? "general";

  const urgent = /(chest pain|severe|bleeding|fainting|trouble breathing|stroke)/.test(
    t,
  );

  return {
    specialty: pick,
    alt_specialty: null,
    reason: "Suggested based on the words you used.",
    confidence: "medium",
    urgency: urgent ? "urgent" : "routine",
  };
}

export function offlineJournalAnalysis(text: string): JournalAnalysis {
  const s = offlineSentiment(text);
  return {
    summary: text.slice(0, 100) + (text.length > 100 ? "…" : ""),
    emotion: s.emotion,
    intensity: s.intensity,
    themes: [],
    reflection:
      "Thank you for writing. Putting feelings into words is already a kind step.",
    crisis: s.crisis,
  };
}
