import { classifySentiment } from "@/lib/aiClient";
import { CACHE_TTL, readCache, writeCache } from "./cache";
import { offlineSentiment } from "./offline";
import type { SentimentResult } from "./types";

function hash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return String(h);
}

export async function getSentiment(text: string): Promise<SentimentResult> {
  const trimmed = text.trim();
  if (!trimmed) return offlineSentiment("");

  const cacheKey = `sentiment.${hash(trimmed)}`;
  const cached = await readCache<SentimentResult>(cacheKey);
  if (cached) return cached;

  try {
    const result = await classifySentiment(trimmed);
    await writeCache(cacheKey, result, CACHE_TTL.day);
    return result;
  } catch {
    return offlineSentiment(trimmed);
  }
}
