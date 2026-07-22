import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { readJson, writeJson } from "@/lib/storage";
import { formatDateISO } from "@/lib/dateUtils";
import { postJson } from "@/lib/aiClient";

interface GratitudeEntry {
  date: string;
  items: string[];
  aiMessage?: string;
}

const PROMPTS = [
  "Something that made you smile today",
  "A person you are grateful for right now",
  "Something about your body or health you appreciate",
  "A simple comfort in your day",
  "Something you learned recently",
  "A challenge that helped you grow",
];

function getThreePrompts(date: string): string[] {
  const seed = date.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
  const shuffled = [...PROMPTS].sort((a, b) => {
    const h = (s: string) =>
      s.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 100, seed);
    return h(a) - h(b);
  });
  return shuffled.slice(0, 3);
}

export default function GratitudeScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = formatDateISO(new Date());
  const prompts = getThreePrompts(today);

  const [answers, setAnswers] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GratitudeEntry[]>([]);

  useEffect(() => {
    readJson<GratitudeEntry[]>("ehm.gratitude.v1", []).then((data) => {
      setHistory(data);
      const todayEntry = data.find((e) => e.date === today);
      if (todayEntry) {
        const filled = ["", "", ""].map((_, i) => todayEntry.items[i] ?? "");
        setAnswers(filled);
        setSaved(true);
        setAiMessage(todayEntry.aiMessage ?? null);
      }
    });
  }, [today]);

  const onSave = async () => {
    const items = answers.filter((a) => a.trim());
    if (items.length === 0) return;

    setLoading(true);
    let message: string | undefined;
    try {
      const prompt = `A user shared their gratitude for today:\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\nWrite a warm, 1-2 sentence response that celebrates what they noticed. Be specific to what they wrote. Under 50 words.`;
      const result = await postJson<{ content: string }>("/api/ai/chat", { message: prompt });
      message = result.content;
      setAiMessage(message);
    } catch {
      message = "Beautiful gratitude. Noticing these moments is itself a practice of joy.";
      setAiMessage(message);
    } finally {
      setLoading(false);
    }

    const entry: GratitudeEntry = { date: today, items, aiMessage: message };
    const updated = [entry, ...history.filter((e) => e.date !== today)];
    await writeJson("ehm.gratitude.v1", updated);
    setHistory(updated);
    setSaved(true);
  };

  const recentHistory = history.filter((e) => e.date !== today).slice(0, 5);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          { backgroundColor: "#6FCF97", paddingTop: insets.top + 14 },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#0F3D24" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: "#0F3D24" }]}>Gratitude AI</Text>
          <Text style={[styles.headerSub, { color: "#0F3D2488" }]}>
            Three things · every day
          </Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: "rgba(15,61,36,0.12)" }]}>
          <MaterialIcons name="volunteer-activism" size={22} color="#0F3D24" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <View style={styles.dateRow}>
            <MaterialIcons name="today" size={16} color={c.mutedForeground} />
            <Text style={[styles.dateText, { color: c.mutedForeground }]}>
              {new Date(today).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <Text style={[styles.cardTitle, { color: c.foreground }]}>
            What are you grateful for today?
          </Text>
          <Text style={[styles.cardSub, { color: c.mutedForeground }]}>
            Three small things can shift your whole day.
          </Text>

          <View style={{ height: 14 }} />

          {prompts.map((prompt, i) => (
            <View key={i} style={styles.promptRow}>
              <View style={[styles.promptNum, { backgroundColor: "#6FCF97" + "33" }]}>
                <Text style={[styles.promptNumText, { color: "#3D9970" }]}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.promptText, { color: c.mutedForeground }]}>
                  {prompt}
                </Text>
                <TextInput
                  value={answers[i]}
                  onChangeText={(t) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[i] = t;
                      return next;
                    })
                  }
                  placeholder="I am grateful for..."
                  placeholderTextColor={c.mutedForeground + "88"}
                  style={[
                    styles.input,
                    {
                      backgroundColor: c.muted,
                      color: c.foreground,
                      borderColor: c.border,
                    },
                  ]}
                  editable={!saved}
                />
              </View>
            </View>
          ))}

          <View style={{ height: 16 }} />

          {!saved ? (
            <PrimaryButton
              label="Save today's gratitude"
              icon="check"
              onPress={onSave}
              disabled={answers.every((a) => !a.trim()) || loading}
              style={{ backgroundColor: "#3D9970" }}
            />
          ) : null}
        </Card>

        {aiMessage ? (
          <View style={{ height: 14 }} />
        ) : null}

        {aiMessage ? (
          <View
            style={[
              styles.aiCard,
              { backgroundColor: "#6FCF97" + "22", borderColor: "#6FCF97" + "55" },
            ]}
          >
            <MaterialIcons name="auto-awesome" size={18} color="#3D9970" />
            <Text style={[styles.aiText, { color: c.foreground }]}>
              {aiMessage}
            </Text>
          </View>
        ) : null}

        {recentHistory.length > 0 ? (
          <>
            <View style={{ height: 22 }} />
            <Text style={[styles.historyLabel, { color: c.mutedForeground }]}>
              PAST ENTRIES
            </Text>
            {recentHistory.map((entry) => (
              <Card key={entry.date} style={{ marginBottom: 10 }}>
                <Text style={[styles.historyDate, { color: c.mutedForeground }]}>
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                {entry.items.map((item, i) => (
                  <View key={i} style={styles.historyItem}>
                    <MaterialIcons name="fiber-manual-record" size={7} color={c.mutedForeground} />
                    <Text style={[styles.historyText, { color: c.foreground }]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </Card>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15,61,36,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  content: { padding: 16 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  promptRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  promptNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexShrink: 0,
  },
  promptNumText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  promptText: { fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 6, lineHeight: 17 },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 44,
  },
  aiCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  aiText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, flex: 1 },
  historyLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  historyDate: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginBottom: 6 },
  historyItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  historyText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
