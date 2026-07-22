import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { postJson } from "@/lib/aiClient";

interface CoachingResult {
  plan: string[];
  principle: string;
  tip: string;
}

const CHALLENGES = [
  "I feel overwhelmed and don't know where to start",
  "I procrastinate on important tasks",
  "I feel exhausted and have no energy",
  "I can't focus for long periods",
  "I take on too much and struggle to say no",
  "I feel unmotivated about my work",
];

export default function ProductivityScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [challenge, setChallenge] = useState("");
  const [result, setResult] = useState<CoachingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onCoach = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    setChallenge(q);
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are a compassionate productivity coach for someone dealing with mental health challenges in Liberia. They say: "${q}"\n\nRespond with JSON: {"plan": ["3-5 concise actionable steps"], "principle": "one key mindset shift in one sentence", "tip": "one small thing they can do in the next 5 minutes"}. Be warm and realistic, not demanding.`;
      const res = await postJson<{ content: string }>("/api/ai/chat", { message: prompt });
      const jsonMatch = res.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as CoachingResult;
        setResult(parsed);
      } else {
        setResult({
          plan: [
            "Write down the three most important things you need to do today — only three.",
            "Start with the smallest one to build momentum.",
            "Take a 5-minute break after each task.",
            "Be kind to yourself when plans change.",
          ],
          principle: "Progress over perfection. One step done is better than ten planned.",
          tip: "Right now: put your phone down, take three deep breaths, and write one thing you want to finish today.",
        });
      }
    } catch {
      setResult({
        plan: [
          "Identify your single most important task for today.",
          "Break it into the smallest possible steps.",
          "Set a 25-minute timer and work on only that.",
          "Rest for 5 minutes, then reassess.",
        ],
        principle: "You do not need to be productive all day — just productive enough.",
        tip: "Write one sentence about what you want to accomplish today.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: "#5C97E0", paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Productivity Coach</Text>
          <Text style={styles.headerSub}>Do more · stress less</Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <MaterialIcons name="rocket-launch" size={22} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={[styles.cardTitle, { color: c.foreground }]}>
            What's getting in your way?
          </Text>
          <Text style={[styles.cardSub, { color: c.mutedForeground }]}>
            Describe your challenge or pick one below.
          </Text>
          <View style={{ height: 12 }} />
          <TextInput
            value={challenge}
            onChangeText={setChallenge}
            placeholder="Tell me what's feeling hard right now..."
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[
              styles.input,
              { backgroundColor: c.muted, color: c.foreground, borderColor: c.border },
            ]}
          />
          <View style={{ height: 12 }} />
          <PrimaryButton
            label="Get coaching plan"
            icon="psychology"
            onPress={() => onCoach(challenge)}
            disabled={!challenge.trim() || loading}
            style={{ backgroundColor: "#5C97E0" }}
          />
        </Card>

        <View style={{ height: 16 }} />
        <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
          COMMON CHALLENGES
        </Text>
        {CHALLENGES.map((ch) => (
          <Pressable
            key={ch}
            onPress={() => onCoach(ch)}
            style={({ pressed }) => [
              styles.challengePill,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialIcons name="tips-and-updates" size={18} color="#5C97E0" />
            <Text style={[styles.challengeText, { color: c.foreground }]}>{ch}</Text>
            <MaterialIcons name="arrow-forward-ios" size={13} color={c.border} />
          </Pressable>
        ))}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#5C97E0" />
            <Text style={[styles.loadingText, { color: c.mutedForeground }]}>
              Building your plan...
            </Text>
          </View>
        ) : null}

        {result && !loading ? (
          <>
            <View style={{ height: 20 }} />
            <View style={[styles.principleCard, { backgroundColor: "#5C97E0" + "18", borderColor: "#5C97E0" + "44" }]}>
              <MaterialIcons name="lightbulb" size={20} color="#5C97E0" />
              <Text style={[styles.principleText, { color: c.foreground }]}>
                {result.principle}
              </Text>
            </View>
            <View style={{ height: 14 }} />
            <Card>
              <Text style={[styles.planLabel, { color: c.foreground }]}>Your action plan</Text>
              {result.plan.map((step, i) => (
                <View key={i} style={styles.planStep}>
                  <View style={[styles.planNum, { backgroundColor: "#5C97E0" + "22" }]}>
                    <Text style={[styles.planNumText, { color: "#5C97E0" }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.planStepText, { color: c.foreground }]}>{step}</Text>
                </View>
              ))}
            </Card>
            <View style={{ height: 14 }} />
            <View style={[styles.tipCard, { backgroundColor: c.secondarySoft, borderColor: c.secondary + "55" }]}>
              <MaterialIcons name="flash-on" size={18} color={c.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipLabel, { color: c.secondary }]}>Do this right now</Text>
                <Text style={[styles.tipText, { color: c.foreground }]}>{result.tip}</Text>
              </View>
            </View>
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
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  heroBadge: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  content: { padding: 16 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
  },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  challengePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  challengeText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1, lineHeight: 18 },
  loadingWrap: { alignItems: "center", paddingVertical: 32, gap: 12 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  principleCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  principleText: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 20, flex: 1 },
  planLabel: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 14 },
  planStep: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  planNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  planNumText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  planStepText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, flex: 1 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  tipLabel: { fontFamily: "Inter_700Bold", fontSize: 12, marginBottom: 4 },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
});
