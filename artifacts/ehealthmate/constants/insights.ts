export interface Insight {
  title: string;
  body: string;
  icon: string;
}

export const DAILY_INSIGHTS: Insight[] = [
  {
    title: "Take 5 deep breaths",
    body: "Slow breathing tells your body it is safe. Try 4 seconds in, 6 seconds out.",
    icon: "air",
  },
  {
    title: "Drink water",
    body: "Even mild dehydration can affect your mood. A glass of water is a small win.",
    icon: "water-drop",
  },
  {
    title: "Step outside",
    body: "Five minutes of fresh air can shift your day. Look at the sky.",
    icon: "wb-sunny",
  },
  {
    title: "Reach out to one person",
    body: "Send a short message to someone you trust. Connection is medicine.",
    icon: "favorite",
  },
  {
    title: "Stretch your body",
    body: "Gentle stretching releases tension your mind has been carrying.",
    icon: "accessibility-new",
  },
  {
    title: "Name what you feel",
    body: "Saying the feeling out loud or writing it down loosens its grip.",
    icon: "edit-note",
  },
  {
    title: "Eat something nourishing",
    body: "A small balanced meal supports steady mood and energy.",
    icon: "restaurant",
  },
];

export function getInsightForDay(): Insight {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_INSIGHTS[day % DAILY_INSIGHTS.length]!;
}

export const STRESS_TIPS = [
  {
    title: "5-4-3-2-1 grounding",
    body: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
  },
  {
    title: "Box breathing",
    body: "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times.",
  },
  {
    title: "Walk it off",
    body: "A short 10-minute walk releases tension and clears thoughts.",
  },
  {
    title: "Name three small wins",
    body: "Even tiny ones count: you got out of bed, you ate, you reached out.",
  },
  {
    title: "Splash cool water",
    body: "Cool water on the face activates the calm response in your body.",
  },
  {
    title: "Talk to one person",
    body: "Share with someone you trust. Carrying it alone is heavier.",
  },
];

export const SLEEP_SOUNDS = [
  { id: "rain", title: "Soft rain", subtitle: "Steady rainfall", icon: "water" },
  { id: "ocean", title: "Ocean waves", subtitle: "Calm shoreline", icon: "waves" },
  { id: "forest", title: "Forest at night", subtitle: "Crickets and breeze", icon: "forest" },
  { id: "fan", title: "Quiet fan", subtitle: "Soft white noise", icon: "mode-fan-off" },
  { id: "fireplace", title: "Fireplace", subtitle: "Crackling warmth", icon: "fireplace" },
  { id: "river", title: "River stream", subtitle: "Gentle water", icon: "water-drop" },
];

export const MEDITATIONS = [
  {
    id: "body-scan",
    title: "Body scan",
    duration: "8 min",
    description:
      "Notice each part of your body, from head to toes. Release any tension you find.",
  },
  {
    id: "loving-kindness",
    title: "Loving kindness",
    duration: "10 min",
    description:
      "Send warm, kind thoughts to yourself, then to those you love, then to your community.",
  },
  {
    id: "gratitude",
    title: "Gratitude check-in",
    duration: "5 min",
    description:
      "Bring three small good moments to mind. Hold them gently for a breath each.",
  },
  {
    id: "letting-go",
    title: "Letting go",
    duration: "12 min",
    description:
      "Notice what you are holding. Imagine setting it down for the next few minutes.",
  },
];
