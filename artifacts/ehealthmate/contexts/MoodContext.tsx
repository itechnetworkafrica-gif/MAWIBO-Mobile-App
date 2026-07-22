import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import { formatDateISO, uniqueId } from "@/lib/dateUtils";
import type { Mood } from "@/constants/moods";
import { notifyStreakMilestone } from "@/lib/pushEngine";

export interface MoodEntry {
  id: string;
  moodId: Mood["id"];
  date: string;
  createdAt: number;
}

interface MoodContextValue {
  entries: MoodEntry[];
  ready: boolean;
  todayEntry: MoodEntry | null;
  log: (moodId: Mood["id"]) => void;
  streak: number;
  last7: { date: string; moodId: Mood["id"] | null }[];
}

const MoodContext = createContext<MoodContextValue | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    readJson<MoodEntry[]>(STORAGE_KEYS.moods, []).then((list) => {
      if (!mounted) return;
      setEntries(list);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.moods, entries);
  }, [entries, ready]);

  const todayEntry = useMemo(() => {
    const today = formatDateISO(new Date());
    return entries.find((e) => e.date === today) ?? null;
  }, [entries]);

  const log = useCallback((moodId: Mood["id"]) => {
    const today = formatDateISO(new Date());
    setEntries((prev) => {
      const already = prev.some((e) => e.date === today);
      const without = prev.filter((e) => e.date !== today);
      const next = [
        { id: uniqueId(), moodId, date: today, createdAt: Date.now() },
        ...without,
      ];
      if (!already) {
        let streakCount = 0;
        for (let i = 0; ; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const iso = formatDateISO(d);
          if (iso === today || next.find((e) => e.date === iso)) {
            streakCount++;
          } else {
            break;
          }
        }
        notifyStreakMilestone(streakCount).catch(() => {});
      }
      return next;
    });
  }, []);

  const last7 = useMemo(() => {
    const out: { date: string; moodId: Mood["id"] | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatDateISO(d);
      const found = entries.find((e) => e.date === iso);
      out.push({ date: iso, moodId: found?.moodId ?? null });
    }
    return out;
  }, [entries]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; ; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatDateISO(d);
      if (entries.find((e) => e.date === iso)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [entries]);

  const value = useMemo(
    () => ({ entries, ready, todayEntry, log, streak, last7 }),
    [entries, ready, todayEntry, log, streak, last7],
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood(): MoodContextValue {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
