import { getCheckinQuestion } from "@/lib/aiClient";
import { CACHE_TTL, readCache, writeCache } from "./cache";
import { offlineCheckin } from "./offline";
import type { CheckinPrompt } from "./types";

export function getTimeOfDay(): "morning" | "evening" {
  const hour = new Date().getHours();
  return hour >= 4 && hour < 16 ? "morning" : "evening";
}

export async function getDailyCheckin(input: {
  recent_mood?: string;
  streak?: number;
}): Promise<CheckinPrompt> {
  const tod = getTimeOfDay();
  const dateKey = new Date().toISOString().slice(0, 10);
  const key = `checkin.${dateKey}.${tod}`;

  const cached = await readCache<CheckinPrompt>(key);
  if (cached) return cached;

  try {
    const result = await getCheckinQuestion({ ...input, time_of_day: tod });
    await writeCache(key, result, CACHE_TTL.day);
    return result;
  } catch {
    return offlineCheckin(tod);
  }
}
