import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmptyState } from "@/components/EmptyState";
import { useJournal } from "@/contexts/JournalContext";
import { useAIInsights } from "@/contexts/AIInsightsContext";
import { summarizeJournal } from "@/lib/aiClient";
import { analyzeJournal } from "@/lib/ai";
import type { JournalAnalysis } from "@/lib/ai/types";

const EMOTION_COLORS: Record<string, string> = {
  joy: "#6FCF97",
  gratitude: "#6FCF97",
  neutral: "#6B7280",
  stress: "#E0A800",
  anxiety: "#7C5DB8",
  sadness: "#5C97E0",
  anger: "#E03E3E",
};

export default function JournalScreen() {
  const c = useColors();
  const { entries, add, remove } = useJournal();
  const { flagCrisisFromText, refresh } = useAIInsights();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const onSave = async () => {
    if (!text.trim()) return;
    const entryText = text.trim();
    add(entryText);
    setText("");
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const a = await analyzeJournal(entryText);
      setAnalysis(a);
      if (a.crisis) {
        await flagCrisisFromText(entryText);
        Alert.alert(
          "We are here for you",
          "Your words are important. Please consider reaching out for support right now from the Support tab.",
          [{ text: "OK" }],
        );
      } else {
        refresh();
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(id) },
    ]);
  };

  const onSummarize = async () => {
    if (entries.length === 0) return;
    setSummarizing(true);
    setSummary(null);
    try {
      const s = await summarizeJournal(
        entries.slice(0, 10).map((e) => ({ date: e.date, text: e.text })),
      );
      setSummary(s);
    } catch (e) {
      setSummary(
        e instanceof Error
          ? e.message
          : "Could not summarize right now. Please try again.",
      );
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Journal" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={[styles.cardTitle, { color: c.foreground }]}>
            Write what is on your mind
          </Text>
          <Text style={[styles.cardBody, { color: c.mutedForeground }]}>
            Putting feelings into words helps loosen them. Only you can read
            this.
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Today I felt..."
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[
              styles.input,
              {
                color: c.foreground,
                backgroundColor: c.muted,
              },
            ]}
          />
          <View style={{ height: 12 }} />
          <PrimaryButton
            label={analyzing ? "Saving and reflecting..." : "Save entry"}
            icon="check"
            onPress={onSave}
            disabled={!text.trim() || analyzing}
            loading={analyzing}
          />
        </Card>

        {analysis ? (
          <>
            <View style={{ height: 14 }} />
            <Card>
              <View style={styles.analysisHeader}>
                <View
                  style={[
                    styles.emotionDot,
                    {
                      backgroundColor:
                        EMOTION_COLORS[analysis.emotion] ?? c.mutedForeground,
                    },
                  ]}
                />
                <Text
                  style={[styles.analysisTitle, { color: c.foreground }]}
                >
                  {analysis.emotion.charAt(0).toUpperCase() +
                    analysis.emotion.slice(1)}{" "}
                  ·{" "}
                  {analysis.intensity.charAt(0).toUpperCase() +
                    analysis.intensity.slice(1)}
                </Text>
              </View>
              <Text
                style={[styles.analysisReflection, { color: c.foreground }]}
              >
                {analysis.reflection}
              </Text>
              {analysis.themes.length > 0 ? (
                <View style={styles.themeRow}>
                  {analysis.themes.map((th, i) => (
                    <View
                      key={i}
                      style={[
                        styles.themePill,
                        { backgroundColor: c.primarySoft },
                      ]}
                    >
                      <Text
                        style={[styles.themeText, { color: c.primary }]}
                      >
                        {th}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </>
        ) : null}

        {entries.length > 0 ? (
          <>
            <View style={{ height: 18 }} />
            <PrimaryButton
              label={summarizing ? "Reflecting..." : "Reflect on recent entries"}
              icon="auto-awesome"
              variant="secondary"
              onPress={onSummarize}
              loading={summarizing}
            />
            {summary ? (
              <>
                <View style={{ height: 14 }} />
                <Card>
                  <Text style={[styles.cardTitle, { color: c.foreground }]}>
                    Reflection
                  </Text>
                  <Text
                    style={[styles.summaryBody, { color: c.foreground }]}
                  >
                    {summary}
                  </Text>
                </Card>
              </>
            ) : null}
          </>
        ) : null}

        <View style={{ height: 22 }} />
        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          Past entries ({entries.length})
        </Text>

        {entries.length === 0 ? (
          <EmptyState
            icon="edit-note"
            title="No entries yet"
            message="Your saved entries will appear here."
          />
        ) : (
          <View style={{ gap: 12, marginTop: 8 }}>
            {entries.map((e) => (
              <Card key={e.id}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[styles.entryDate, { color: c.mutedForeground }]}
                  >
                    {new Date(e.createdAt).toLocaleString()}
                  </Text>
                  <Pressable onPress={() => onDelete(e.id)} hitSlop={8}>
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={c.mutedForeground}
                    />
                  </Pressable>
                </View>
                <Text style={[styles.entryBody, { color: c.foreground }]}>
                  {e.text}
                </Text>
              </Card>
            ))}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  cardBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    minHeight: 110,
    textAlignVertical: "top",
    padding: 14,
    borderRadius: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  entryDate: { fontFamily: "Inter_500Medium", fontSize: 12 },
  entryBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  analysisTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  analysisReflection: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  themeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
