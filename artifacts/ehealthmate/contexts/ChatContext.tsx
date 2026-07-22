import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import { uniqueId } from "@/lib/dateUtils";
import { sendChat, type ChatMessage } from "@/lib/aiClient";
import { isCrisis } from "@/lib/sentiment";
import { useApp } from "@/contexts/AppContext";
import { useAIInsights } from "@/contexts/AIInsightsContext";

interface ChatContextValue {
  messages: ChatMessage[];
  ready: boolean;
  pending: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  clear: () => void;
  showCrisis: boolean;
  dismissCrisis: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useApp();
  const { flagCrisisFromText } = useAIInsights();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);

  useEffect(() => {
    let mounted = true;
    readJson<ChatMessage[]>(STORAGE_KEYS.chat, []).then((list) => {
      if (!mounted) return;
      setMessages(list);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.chat, messages);
  }, [messages, ready]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: uniqueId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const localCrisis = isCrisis(trimmed);
      if (localCrisis) {
        setShowCrisis(true);
        flagCrisisFromText(trimmed).catch(() => {
          // best-effort
        });
      }

      setError(null);
      setPending(true);
      setMessages((prev) => [...prev, userMsg]);

      try {
        const history = [...messages, userMsg]
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await sendChat(history, profile.language);

        const assistant: ChatMessage = {
          id: uniqueId(),
          role: "assistant",
          content: res.content,
          createdAt: Date.now(),
          crisis: res.crisis || localCrisis,
        };
        if (assistant.crisis) setShowCrisis(true);
        setMessages((prev) => [...prev, assistant]);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not reach the AI. Please try again.",
        );
      } finally {
        setPending(false);
      }
    },
    [messages, profile.language, flagCrisisFromText],
  );

  const clear = useCallback(() => setMessages([]), []);
  const dismissCrisis = useCallback(() => setShowCrisis(false), []);

  const value = useMemo(
    () => ({
      messages,
      ready,
      pending,
      error,
      send,
      clear,
      showCrisis,
      dismissCrisis,
    }),
    [messages, ready, pending, error, send, clear, showCrisis, dismissCrisis],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
