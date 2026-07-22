import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const PREFIX = "ehm.aicache.";

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export async function clearCachePrefix(prefix?: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const match = PREFIX + (prefix ?? "");
    const toRemove = keys.filter((k) => k.startsWith(match));
    if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
  } catch {
    // ignore
  }
}

export const CACHE_TTL = {
  short: 5 * 60 * 1000,
  medium: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
} as const;
