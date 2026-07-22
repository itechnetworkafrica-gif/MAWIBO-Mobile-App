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

export interface JournalEntry {
  id: string;
  text: string;
  date: string;
  createdAt: number;
}

interface JournalContextValue {
  entries: JournalEntry[];
  ready: boolean;
  add: (text: string) => JournalEntry | null;
  remove: (id: string) => void;
  clear: () => void;
}

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    readJson<JournalEntry[]>(STORAGE_KEYS.journal, []).then((list) => {
      if (!mounted) return;
      setEntries(list);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.journal, entries);
  }, [entries, ready]);

  const add = useCallback<JournalContextValue["add"]>((text) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const next: JournalEntry = {
      id: uniqueId(),
      text: trimmed,
      date: formatDateISO(new Date()),
      createdAt: Date.now(),
    };
    setEntries((prev) => [next, ...prev]);
    return next;
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo(
    () => ({ entries, ready, add, remove, clear }),
    [entries, ready, add, remove, clear],
  );

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
}

export function useJournal(): JournalContextValue {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used within JournalProvider");
  return ctx;
}
