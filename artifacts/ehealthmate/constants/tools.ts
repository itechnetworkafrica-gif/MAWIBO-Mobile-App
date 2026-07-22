export interface ToolItem {
  id:
    | "symptom-check"
    | "affirmations"
    | "mood-insights"
    | "sleep-coach"
    | "breathing"
    | "meditation"
    | "journal"
    | "sleep"
    | "stress";
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  ai?: boolean;
}

export const TOOLS: ToolItem[] = [
  {
    id: "symptom-check",
    title: "AI Symptom Check",
    subtitle: "Describe symptoms, get triage",
    icon: "health-and-safety",
    route: "/symptom-check",
    color: "#3A7BD5",
    ai: true,
  },
  {
    id: "affirmations",
    title: "Daily Affirmation",
    subtitle: "AI words for today",
    icon: "auto-awesome",
    route: "/affirmations",
    color: "#6FCF97",
    ai: true,
  },
  {
    id: "mood-insights",
    title: "Mood Insights",
    subtitle: "AI patterns in your moods",
    icon: "insights",
    route: "/mood-insights",
    color: "#7C5DB8",
    ai: true,
  },
  {
    id: "sleep-coach",
    title: "AI Sleep Coach",
    subtitle: "A plan for better sleep",
    icon: "nights-stay",
    route: "/sleep-coach",
    color: "#5C6BC0",
    ai: true,
  },
  {
    id: "breathing",
    title: "Breathing",
    subtitle: "Box breathing in 4 minutes",
    icon: "air",
    route: "/breathing",
    color: "#3A7BD5",
  },
  {
    id: "meditation",
    title: "Meditation",
    subtitle: "Guided calm",
    icon: "self-improvement",
    route: "/meditation",
    color: "#6FCF97",
  },
  {
    id: "journal",
    title: "Journal",
    subtitle: "Write what is on your mind",
    icon: "edit-note",
    route: "/journal",
    color: "#E0A800",
  },
  {
    id: "sleep",
    title: "Sleep sounds",
    subtitle: "Gentle sounds for rest",
    icon: "bedtime",
    route: "/sleep-sounds",
    color: "#7C5DB8",
  },
  {
    id: "stress",
    title: "Stress tips",
    subtitle: "Quick coping ideas",
    icon: "tips-and-updates",
    route: "/stress-tips",
    color: "#E07A5F",
  },
];
