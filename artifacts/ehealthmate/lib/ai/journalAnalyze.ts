import { analyzeJournalEntry } from "@/lib/aiClient";
import { offlineJournalAnalysis } from "./offline";
import type { JournalAnalysis } from "./types";

export async function analyzeJournal(text: string): Promise<JournalAnalysis> {
  try {
    return await analyzeJournalEntry(text);
  } catch {
    return offlineJournalAnalysis(text);
  }
}
