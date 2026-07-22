import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors silently — UI will reflect in-memory state
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  profile: "ehm.profile.v1",
  appointments: "ehm.appointments.v1",
  moods: "ehm.moods.v1",
  journal: "ehm.journal.v1",
  chat: "ehm.chat.v1",
  checkin: "ehm.checkin.v1",
  notifications: "ehm.notifications.v1",
} as const;
