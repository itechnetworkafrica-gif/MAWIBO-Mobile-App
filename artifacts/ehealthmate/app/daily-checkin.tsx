import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/hooks/useColors";
import { useMood } from "@/contexts/MoodContext";
import { useJournal } from "@/contexts/JournalContext";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getDailyCheckin, getTimeOfDay } from "@/lib/ai";
import { getCopingPlan } from "@/lib/ai";
import { getSentiment } from "@/lib/ai";
import type { CheckinPrompt, CopingPlan } from "@/lib/ai/types";
import { STORAGE_KEYS } from "@/lib/storage";

interface SavedCheckin {
  date: string;
  tod: "morning" | "evening";
  question: string;
  answer: string;
}

export default function DailyCheckinScreen() {
  const c = useColors();
  const router = useRouter();
  const { todayEntry, streak } = useMood();
  const { add: addJournal } = useJournal();

  const [prompt, setPrompt] = useState<CheckinPrompt | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [answer, setAnswer] = useState("");
  const [coping, setCoping] = useState<CopingPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingPrompt(true);
    getDailyCheckin({
      recent_mood: todayEntry?.moodId,
      streak,
    })
      .then((p) => {
        if (mounted) setPrompt(p);
      })
      .finally(() => {
        if (mounted) setLoadingPrompt(false);
      });
    return () => {
      mounted = false;
    };
  }, [todayEntry?.moodId, streak]);

  const onSubmit = async () => {
    if (!answer.trim() || !prompt) return;
    setSubmitting(true);
    try {
      const sent = await getSentiment(answer);
      const plan = await getCopingPlan({
        emotion: sent.emotion,
        intensity: sent.intensity,
        context: answer.trim(),
      });
      setCoping(plan);

      const list = JSON.parse(
        (await AsyncStorage.getItem(STORAGE_KEYS.checkin)) ?? "[]",
      ) as SavedCheckin[];
      const next: SavedCheckin = {
        date: new Date().toISOString(),
        tod: getTimeOfDay(),
        question: prompt.question,
        answer: answer.trim(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.checkin,
        JSON.stringify([next, ...list].slice(0, 60)),
      );
      addJournal(`[Check-in] ${prompt.question}\n\n${answer.trim()}`);
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  };

  const onAction = (route: string) => {
    const map: Record<string, string> = {
      breathing: "/breathing",
      meditation: "/meditation",
      journal: "/journal",
      "sleep-coach": "/sleep-coach",
      "symptom-check": "/symptom-check",
      affirmations: "/affirmations",
      "book-doctor": "/(tabs)/book-doctor",
      "ai-mate": "/(tabs)/ai-mate",
    };
    router.push((map[route] ?? "/") as never);
  };

  const tod = getTimeOfDay();
  const todLabel = tod === "morning" ? "Morning check-in" : "Evening check-in";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Daily Check-in" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <View style={styles.headerRow}>
            <View
              style={[styles.icon, { backgroundColor: c.secondarySoft }]}
            >
              <MaterialIcons
                name={tod === "morning" ? "wb-sunny" : "nights-stay"}
                size={22}
                color={c.secondaryForeground}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>
                {todLabel.toUpperCase()}
              </Text>
              {loadingPrompt || !prompt ? (
                <ActivityIndicator color={c.primary} style={{ marginTop: 8 }} />
              ) : (
                <Text style={[styles.question, { color: c.foreground }]}>
                  {prompt.question}
                </Text>
              )}
            </View>
          </View>
          <View style={{ height: 12 }} />
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder={prompt?.placeholder ?? "Type a few words..."}
            placeholderTextColor={c.mutedForeground}
            multiline
            editable={!saved}
            style={[
              styles.input,
              { color: c.foreground, backgroundColor: c.muted },
            ]}
          />
          <View style={{ height: 12 }} />
          {!saved ? (
            <PrimaryButton
              label={submitting ? "Reflecting..." : "Save check-in"}
              icon="check"
              onPress={onSubmit}
              disabled={!answer.trim() || submitting}
              loading={submitting}
            />
          ) : (
            <View style={[styles.saved, { backgroundColor: c.secondarySoft }]}>
              <MaterialIcons
                name="check-circle"
                size={18}
                color={c.secondaryForeground}
              />
              <Text style={[styles.savedText, { color: c.secondaryForeground }]}>
                Saved to your journal
              </Text>
            </View>
          )}
        </Card>

        {coping ? (
          <>
            <View style={{ height: 18 }} />
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              A few small steps for now
            </Text>
            <View style={{ height: 8 }} />
            {coping.steps.map((step, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <Card>
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepIcon,
                        { backgroundColor: c.primarySoft },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          step.icon as keyof typeof MaterialIcons.glyphMap
                        }
                        size={20}
                        color={c.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.stepTitle, { color: c.foreground }]}
                      >
                        {step.title}
                      </Text>
                      <Text
                        style={[styles.stepBody, { color: c.mutedForeground }]}
                      >
                        {step.detail}
                      </Text>
                      <Text
                        style={[styles.stepMin, { color: c.primary }]}
                      >
                        About {step.minutes} min
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            ))}
            <View style={{ height: 6 }} />
            <PrimaryButton
              label={coping.primary_action.label}
              icon="play-arrow"
              onPress={() => onAction(coping.primary_action.route)}
            />
          </>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  headerRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  question: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 6,
    lineHeight: 25,
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
  saved: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  savedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  stepBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
    lineHeight: 19,
  },
  stepMin: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 6,
  },
});
