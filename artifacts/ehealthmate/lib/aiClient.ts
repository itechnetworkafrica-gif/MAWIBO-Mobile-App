import type { LangCode } from "@/constants/translations";
import type {
  CheckinPrompt,
  CopingPlan,
  DoctorMatch,
  JournalAnalysis,
  RiskAssessment,
  SentimentResult,
} from "@/lib/ai/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  crisis?: boolean;
}

export interface ChatResponse {
  content: string;
  crisis: boolean;
}

function getBaseUrl(): string {
  // For Vercel / standalone deployments: explicit full API base URL
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (apiBase) return apiBase.replace(/\/$/, "");
  // Replit dev/production: derive from domain
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return "";
  return `https://${domain}`;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const data = (await res.json()) as { error?: string };
      detail = data?.error;
    } catch {
      // ignore
    }
    throw new Error(detail ?? "Network error");
  }
  return (await res.json()) as T;
}

export async function sendChat(
  messages: { role: "user" | "assistant"; content: string }[],
  language: LangCode,
): Promise<ChatResponse> {
  return postJson<ChatResponse>("/api/ai/chat", {
    messages,
    language,
    simpleMode: language === "en-simple",
  });
}

export async function summarizeJournal(
  entries: { date: string; text: string }[],
): Promise<string> {
  const data = await postJson<{ summary: string }>("/api/ai/journal-summary", {
    entries,
  });
  return data.summary;
}

export async function checkSymptoms(input: {
  symptoms: string;
  age?: number;
  duration?: string;
}): Promise<{ content: string; crisis: boolean }> {
  return postJson<{ content: string; crisis: boolean }>(
    "/api/ai/symptom-check",
    input,
  );
}

export async function generateAffirmation(input: {
  mood?: string;
  name?: string;
}): Promise<string> {
  const data = await postJson<{ text: string }>("/api/ai/affirmation", input);
  return data.text;
}

export async function getMoodInsights(
  moods: { date: string; mood: string }[],
): Promise<string> {
  const data = await postJson<{ insights: string }>("/api/ai/mood-insights", {
    moods,
  });
  return data.insights;
}

export async function sleepCoach(issue: string): Promise<string> {
  const data = await postJson<{ plan: string }>("/api/ai/sleep-coach", {
    issue,
  });
  return data.plan;
}

export async function classifySentiment(text: string): Promise<SentimentResult> {
  return postJson<SentimentResult>("/api/ai/sentiment", { text });
}

export async function generateCoping(input: {
  emotion?: string;
  intensity?: string;
  context?: string;
}): Promise<CopingPlan> {
  return postJson<CopingPlan>("/api/ai/coping", input);
}

export async function assessRisk(input: {
  moods: { date: string; mood: string }[];
  recent_text?: string;
  crisis?: boolean;
}): Promise<RiskAssessment> {
  return postJson<RiskAssessment>("/api/ai/risk", input);
}

export async function getCheckinQuestion(input: {
  time_of_day?: "morning" | "evening";
  recent_mood?: string;
  streak?: number;
}): Promise<CheckinPrompt> {
  return postJson<CheckinPrompt>("/api/ai/checkin", input);
}

export async function matchDoctor(input: {
  symptoms: string;
  mood?: string;
  county?: string;
  specialties: string[];
}): Promise<DoctorMatch> {
  return postJson<DoctorMatch>("/api/ai/doctor-match", input);
}

export async function buildPreConsultation(input: {
  symptoms: string;
  duration?: string;
  mood_history?: { date: string; mood: string }[];
  notes?: string;
}): Promise<string> {
  const data = await postJson<{ summary: string }>(
    "/api/ai/pre-consultation",
    input,
  );
  return data.summary;
}

export async function simplifyText(text: string): Promise<string> {
  const data = await postJson<{ text: string }>("/api/ai/simplify", { text });
  return data.text;
}

export async function analyzeJournalEntry(text: string): Promise<JournalAnalysis> {
  return postJson<JournalAnalysis>("/api/ai/journal-analyze", { text });
}
