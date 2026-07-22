import { simplifyText as simplify } from "@/lib/aiClient";
import { CACHE_TTL, readCache, writeCache } from "./cache";

function hash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return String(h);
}

export async function simplifyTextCached(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const key = `simplify.${hash(trimmed)}`;
  const cached = await readCache<string>(key);
  if (cached) return cached;
  try {
    const result = await simplify(trimmed);
    await writeCache(key, result, CACHE_TTL.day);
    return result;
  } catch {
    return text;
  }
}
