export type Sentiment = "positive" | "neutral" | "low" | "crisis";

const CRISIS_PHRASES = [
  "kill myself",
  "kill me",
  "suicide",
  "end my life",
  "want to die",
  "hurt myself",
  "self harm",
  "self-harm",
  "no reason to live",
  "better off dead",
  "take my life",
  "end it all",
];

const NEGATIVE_WORDS = [
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
  "afraid",
  "stressed",
  "angry",
  "hurt",
  "broken",
  "cry",
  "crying",
  "can't",
  "cannot",
  "useless",
];

const POSITIVE_WORDS = [
  "good",
  "great",
  "happy",
  "calm",
  "okay",
  "fine",
  "better",
  "grateful",
  "proud",
  "excited",
  "hopeful",
  "love",
  "thank",
];

export function analyzeSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  if (CRISIS_PHRASES.some((p) => t.includes(p))) return "crisis";

  const neg = NEGATIVE_WORDS.reduce(
    (count, word) => count + (t.includes(word) ? 1 : 0),
    0,
  );
  const pos = POSITIVE_WORDS.reduce(
    (count, word) => count + (t.includes(word) ? 1 : 0),
    0,
  );

  if (neg - pos >= 2) return "low";
  if (pos > neg) return "positive";
  return "neutral";
}

export function isCrisis(text: string): boolean {
  return analyzeSentiment(text) === "crisis";
}
