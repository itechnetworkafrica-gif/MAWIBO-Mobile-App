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

const GROUNDING_STEPS = [
  { number: 5, sense: "see", icon: "visibility", prompt: "Name 5 things you can see right now" },
  { number: 4, sense: "touch", icon: "touch-app", prompt: "Name 4 things you can physically feel" },
  { number: 3, sense: "hear", icon: "hearing", prompt: "Name 3 things you can hear" },
  { number: 2, sense: "smell", icon: "air", prompt: "Name 2 things you can smell" },
  { number: 1, sense: "taste", icon: "restaurant", prompt: "Name 1 thing you can taste" },
];

interface CopingResult {
  validation: string;
  immediate: string[];
  longer: string[];
  reminder: string;
}

export default function AnxietyScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"grounding" | "support">("grounding");
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<CopingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingDone, setGroundingDone] = useState(false);

  const onGetSupport = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `A person in Liberia is experiencing anxiety. They describe it as: "${situation}"\n\nRespond with JSON: {"validation": "one warm, non-dismissive sentence acknowledging how hard this is", "immediate": ["2-3 steps they can do right now, in the next few minutes"], "longer": ["2-3 strategies for managing this type of anxiety over time"], "reminder": "one kind reminder they can hold onto today"}\n\nBe culturally sensitive, practical, and warm. Under 200 words total.`;
      const res = await postJson<{ content: string }>("/api/ai/chat", { message: prompt });
      const jsonMatch = res.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]) as CopingResult);
      } else {
        throw new Error("parse");
      }
    } catch {
      setResult({
        validation: "What you are feeling is real, and it makes sense that this is hard.",
        immediate: [
          "Stop and take three slow breaths — in for 4 counts, out for 6.",
          "Ground yourself: name 5 things you can see around you.",
          "Place one hand on your chest and feel your heartbeat slow.",
        ],
        longer: [
          "Practice box breathing daily — even when you are not anxious.",
          "Keep a brief journal of what triggers your anxiety.",
          "Consider speaking to a doctor or counsellor about what you are experiencing.",
        ],
        reminder: "Anxiety is a wave — it will peak and pass. You have survived every anxious moment so far.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: "#E07A5F", paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Anxiety Relief</Text>
          <Text style={styles.headerSub}>Grounding · AI support · coping tools</Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <MaterialIcons name="favorite" size={22} color="#FFFFFF" />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {([
          { id: "grounding", label: "5-4-3-2-1 Grounding", icon: "anchor" },
          { id: "support", label: "AI Support", icon: "psychology" },
        ] as const).map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[
              styles.tab,
              { borderBottomColor: tab === t.id ? "#E07A5F" : "transparent" },
            ]}
          >
            <MaterialIcons
              name={t.icon as keyof typeof MaterialIcons.glyphMap}
              size={18}
              color={tab === t.id ? "#E07A5F" : c.mutedForeground}
            />
            <Text style={[styles.tabText, { color: tab === t.id ? "#E07A5F" : c.mutedForeground }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "grounding" ? (
          !groundingDone ? (
            <>
              <View style={styles.groundingHero}>
                <View style={[styles.groundingStep, { backgroundColor: "#E07A5F" + "22" }]}>
                  <Text style={[styles.groundingNum, { color: "#E07A5F" }]}>
                    {GROUNDING_STEPS[groundingStep]!.number}
                  </Text>
                </View>
                <Text style={[styles.groundingTitle, { color: c.foreground }]}>
                  {GROUNDING_STEPS[groundingStep]!.prompt}
                </Text>
                <Text style={[styles.groundingSub, { color: c.mutedForeground }]}>
                  Take your time. There is no rush.
                </Text>
              </View>

              <View style={styles.progressRow}>
                {GROUNDING_STEPS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      { backgroundColor: i <= groundingStep ? "#E07A5F" : c.border },
                    ]}
                  />
                ))}
              </View>

              <View style={{ height: 24 }} />
              <PrimaryButton
                label={
                  groundingStep < GROUNDING_STEPS.length - 1
                    ? `Next — ${GROUNDING_STEPS[groundingStep + 1]?.number} things to ${GROUNDING_STEPS[groundingStep + 1]?.sense}`
                    : "I have finished grounding"
                }
                icon={groundingStep < GROUNDING_STEPS.length - 1 ? "arrow-forward" : "check"}
                onPress={() => {
                  if (groundingStep < GROUNDING_STEPS.length - 1) {
                    setGroundingStep((s) => s + 1);
                  } else {
                    setGroundingDone(true);
                  }
                }}
                style={{ backgroundColor: "#E07A5F" }}
              />
              {groundingStep > 0 ? (
                <View style={{ height: 12 }} />
              ) : null}
              {groundingStep > 0 ? (
                <PrimaryButton
                  label="Back"
                  icon="arrow-back"
                  variant="outline"
                  onPress={() => setGroundingStep((s) => s - 1)}
                />
              ) : null}
            </>
          ) : (
            <>
              <View style={styles.doneWrap}>
                <View style={[styles.doneIcon, { backgroundColor: "#E07A5F" + "22" }]}>
                  <MaterialIcons name="self-improvement" size={36} color="#E07A5F" />
                </View>
                <Text style={[styles.doneTitle, { color: c.foreground }]}>
                  You are here
                </Text>
                <Text style={[styles.doneSub, { color: c.mutedForeground }]}>
                  You just completed a grounding exercise. Your nervous system is calming. Well done.
                </Text>
              </View>
              <PrimaryButton
                label="Do it again"
                icon="refresh"
                variant="outline"
                onPress={() => { setGroundingStep(0); setGroundingDone(false); }}
              />
              <View style={{ height: 12 }} />
              <PrimaryButton
                label="Try box breathing too"
                icon="air"
                onPress={() => router.push("/breathing")}
                style={{ backgroundColor: "#3A7BD5" }}
              />
            </>
          )
        ) : (
          <>
            <Card>
              <Text style={[styles.cardTitle, { color: c.foreground }]}>
                Tell me about your anxiety
              </Text>
              <Text style={[styles.cardSub, { color: c.mutedForeground }]}>
                Describe what is happening — what you feel, what triggered it.
              </Text>
              <View style={{ height: 12 }} />
              <TextInput
                value={situation}
                onChangeText={setSituation}
                placeholder="I am feeling anxious because..."
                placeholderTextColor={c.mutedForeground}
                multiline
                style={[
                  styles.input,
                  { backgroundColor: c.muted, color: c.foreground, borderColor: c.border },
                ]}
              />
              <View style={{ height: 12 }} />
              <PrimaryButton
                label="Get personalised support"
                icon="favorite"
                onPress={onGetSupport}
                disabled={!situation.trim() || loading}
                style={{ backgroundColor: "#E07A5F" }}
              />
            </Card>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#E07A5F" />
                <Text style={[styles.loadingText, { color: c.mutedForeground }]}>
                  Preparing support...
                </Text>
              </View>
            ) : null}

            {result && !loading ? (
              <>
                <View style={{ height: 14 }} />
                <View style={[styles.validationCard, { backgroundColor: "#E07A5F" + "18", borderColor: "#E07A5F" + "44" }]}>
                  <MaterialIcons name="favorite" size={18} color="#E07A5F" />
                  <Text style={[styles.validationText, { color: c.foreground }]}>{result.validation}</Text>
                </View>
                <View style={{ height: 14 }} />
                <Card>
                  <Text style={[styles.sectionHead, { color: c.foreground }]}>Do this right now</Text>
                  {result.immediate.map((step, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: "#E07A5F" }]} />
                      <Text style={[styles.bulletText, { color: c.foreground }]}>{step}</Text>
                    </View>
                  ))}
                </Card>
                <View style={{ height: 10 }} />
                <Card>
                  <Text style={[styles.sectionHead, { color: c.foreground }]}>Longer-term strategies</Text>
                  {result.longer.map((step, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: c.primary }]} />
                      <Text style={[styles.bulletText, { color: c.foreground }]}>{step}</Text>
                    </View>
                  ))}
                </Card>
                <View style={{ height: 10 }} />
                <View style={[styles.reminderCard, { backgroundColor: c.secondarySoft, borderColor: c.secondary + "55" }]}>
                  <MaterialIcons name="bookmark" size={18} color={c.secondary} />
                  <Text style={[styles.reminderText, { color: c.foreground }]}>{result.reminder}</Text>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  heroBadge: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderBottomWidth: 2 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  content: { padding: 20 },
  groundingHero: { alignItems: "center", paddingVertical: 16, gap: 12 },
  groundingStep: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  groundingNum: { fontFamily: "Inter_700Bold", fontSize: 42, letterSpacing: -2 },
  groundingTitle: { fontFamily: "Inter_700Bold", fontSize: 20, textAlign: "center", lineHeight: 27 },
  groundingSub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  progressRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  doneWrap: { alignItems: "center", paddingVertical: 20, gap: 12, marginBottom: 20 },
  doneIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontFamily: "Inter_700Bold", fontSize: 24 },
  doneSub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  input: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 14, fontFamily: "Inter_400Regular", fontSize: 14, minHeight: 100, textAlignVertical: "top" },
  loadingWrap: { alignItems: "center", paddingVertical: 32, gap: 12 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  validationCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  validationText: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 20, flex: 1 },
  sectionHead: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 12 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7, flexShrink: 0 },
  bulletText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, flex: 1 },
  reminderCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  reminderText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, flex: 1 },
});
