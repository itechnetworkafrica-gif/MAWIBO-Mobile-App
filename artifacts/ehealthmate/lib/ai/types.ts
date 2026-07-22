export type Emotion =
  | "stress"
  | "anxiety"
  | "sadness"
  | "anger"
  | "joy"
  | "gratitude"
  | "neutral";

export type Intensity = "low" | "medium" | "high";

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export interface SentimentResult {
  emotion: Emotion;
  intensity: Intensity;
  score: number;
  keywords: string[];
  crisis: boolean;
}

export interface CopingStep {
  title: string;
  detail: string;
  icon: string;
  minutes: number;
}

export interface CopingPlan {
  steps: CopingStep[];
  primary_action: { label: string; route: string };
}

export interface RiskAssessment {
  risk_level: RiskLevel;
  signals: string[];
  guidance: string;
  suggest_support: boolean;
}

export interface CheckinPrompt {
  question: string;
  placeholder: string;
}

export interface DoctorMatch {
  specialty: string;
  alt_specialty: string | null;
  reason: string;
  confidence: "low" | "medium" | "high";
  urgency: "routine" | "soon" | "urgent";
}

export interface JournalAnalysis {
  summary: string;
  emotion: Emotion;
  intensity: Intensity;
  themes: string[];
  reflection: string;
  crisis: boolean;
}
