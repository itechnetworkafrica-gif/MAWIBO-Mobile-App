export interface Mood {
  id: "calm" | "okay" | "stressed" | "low" | "overwhelmed";
  label: string;
  icon: string;
  color: string;
}

export const MOODS: Mood[] = [
  { id: "calm", label: "Calm", icon: "self-improvement", color: "#6FCF97" },
  { id: "okay", label: "Okay", icon: "sentiment-satisfied", color: "#3A7BD5" },
  { id: "stressed", label: "Stressed", icon: "bolt", color: "#E0A800" },
  { id: "low", label: "Low", icon: "sentiment-dissatisfied", color: "#7C8BA3" },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    icon: "blur-on",
    color: "#E03E3E",
  },
];
