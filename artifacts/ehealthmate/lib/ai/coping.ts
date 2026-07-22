import { generateCoping } from "@/lib/aiClient";
import { CACHE_TTL, readCache, writeCache } from "./cache";
import { offlineCoping } from "./offline";
import type { CopingPlan, Emotion, Intensity } from "./types";

export async function getCopingPlan(input: {
  emotion: Emotion;
  intensity: Intensity;
  context?: string;
}): Promise<CopingPlan> {
  const key = `coping.${input.emotion}.${input.intensity}`;
  const cached = await readCache<CopingPlan>(key);
  if (cached) return cached;

  try {
    const result = await generateCoping(input);
    if (!result.steps || result.steps.length === 0) {
      const fallback = offlineCoping(input.emotion);
      await writeCache(key, fallback, CACHE_TTL.medium);
      return fallback;
    }
    await writeCache(key, result, CACHE_TTL.day);
    return result;
  } catch {
    return offlineCoping(input.emotion);
  }
}
