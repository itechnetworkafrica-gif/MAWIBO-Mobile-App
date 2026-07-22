import { assessRisk } from "@/lib/aiClient";
import { CACHE_TTL, readCache, writeCache } from "./cache";
import { offlineRisk } from "./offline";
import type { RiskAssessment } from "./types";

const KEY = "risk.latest";

export async function getRiskAssessment(input: {
  moods: { date: string; mood: string }[];
  recent_text?: string;
  crisis?: boolean;
}): Promise<RiskAssessment> {
  if (input.crisis) {
    const high: RiskAssessment = {
      risk_level: "high",
      signals: ["Crisis language detected"],
      guidance:
        "Please reach out for support right now. Open the Support tab for emergency lines.",
      suggest_support: true,
    };
    await writeCache(KEY, high, CACHE_TTL.medium);
    return high;
  }

  const cached = await readCache<RiskAssessment>(KEY);
  if (cached) return cached;

  try {
    const result = await assessRisk(input);
    await writeCache(KEY, result, CACHE_TTL.medium);
    return result;
  } catch {
    return offlineRisk(input.moods, input.recent_text);
  }
}

export async function refreshRiskAssessment(input: {
  moods: { date: string; mood: string }[];
  recent_text?: string;
  crisis?: boolean;
}): Promise<RiskAssessment> {
  try {
    const result = await assessRisk(input);
    await writeCache(KEY, result, CACHE_TTL.medium);
    return result;
  } catch {
    return offlineRisk(input.moods, input.recent_text);
  }
}
