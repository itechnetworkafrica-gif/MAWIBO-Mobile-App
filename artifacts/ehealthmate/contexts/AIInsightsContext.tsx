import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMood } from "@/contexts/MoodContext";
import { getRiskAssessment, refreshRiskAssessment } from "@/lib/ai/risk";
import type { RiskAssessment } from "@/lib/ai/types";
import { notifyElevatedInsight, notifyRiskAlert } from "@/lib/pushEngine";

interface AIInsightsContextValue {
  risk: RiskAssessment | null;
  loading: boolean;
  refresh: () => Promise<void>;
  flagCrisisFromText: (text: string) => Promise<void>;
}

const AIInsightsContext = createContext<AIInsightsContextValue | null>(null);

export function AIInsightsProvider({ children }: { children: React.ReactNode }) {
  const { entries, ready: moodReady } = useMood();
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const lastNotifiedLevel = useRef<string | null>(null);

  const buildPayload = useCallback(
    (recentText?: string) => ({
      moods: entries.slice(0, 14).map((e) => ({ date: e.date, mood: e.moodId })),
      recent_text: recentText,
    }),
    [entries],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await refreshRiskAssessment(buildPayload());
      setRisk(r);
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  const flagCrisisFromText = useCallback(
    async (text: string) => {
      const r = await refreshRiskAssessment({
        ...buildPayload(text),
        crisis: true,
      });
      setRisk(r);
    },
    [buildPayload],
  );

  // Initial load — try cached risk
  useEffect(() => {
    if (!moodReady) return;
    let mounted = true;
    (async () => {
      const r = await getRiskAssessment(buildPayload());
      if (mounted) setRisk(r);
    })();
    return () => {
      mounted = false;
    };
  }, [moodReady, buildPayload]);

  // Reach the user with a device notification when risk crosses a meaningful threshold —
  // but only once per level change, so we do not spam repeated notifications.
  useEffect(() => {
    if (!risk) return;
    const key = `${risk.risk_level}:${risk.suggest_support}`;
    if (lastNotifiedLevel.current === key) return;
    lastNotifiedLevel.current = key;
    if (risk.risk_level === "high" || risk.suggest_support) {
      notifyRiskAlert(risk.guidance).catch(() => {});
    } else if (risk.risk_level === "elevated") {
      notifyElevatedInsight(risk.guidance).catch(() => {});
    }
  }, [risk]);

  const value = useMemo(
    () => ({ risk, loading, refresh, flagCrisisFromText }),
    [risk, loading, refresh, flagCrisisFromText],
  );

  return (
    <AIInsightsContext.Provider value={value}>
      {children}
    </AIInsightsContext.Provider>
  );
}

export function useAIInsights(): AIInsightsContextValue {
  const ctx = useContext(AIInsightsContext);
  if (!ctx)
    throw new Error("useAIInsights must be used within AIInsightsProvider");
  return ctx;
}
