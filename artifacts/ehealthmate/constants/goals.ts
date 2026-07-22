export interface Goal {
  id: string;
  label: string;
  icon: string;
}

export const GOALS: Goal[] = [
  { id: "stress", label: "Manage stress", icon: "self-improvement" },
  { id: "sleep", label: "Sleep better", icon: "bedtime" },
  { id: "talk", label: "Have someone to talk to", icon: "chat" },
  { id: "doctor", label: "Find a doctor", icon: "medical-services" },
  { id: "anxiety", label: "Ease anxious feelings", icon: "spa" },
  { id: "mood", label: "Track my mood", icon: "monitor-heart" },
  { id: "family", label: "Support my family", icon: "groups" },
  { id: "habits", label: "Build healthy habits", icon: "trending-up" },
];
