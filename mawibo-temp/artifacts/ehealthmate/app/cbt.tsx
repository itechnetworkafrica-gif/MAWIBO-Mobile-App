import React, { useState } from "react";
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
import { postJson } from "@/lib/aiClient";

type Step = "situation" | "thought" | "evidence_for" | "evidence_against" | "balanced" | "done";

interface ThoughtRecord {
  situation: string;
  automaticThought: string;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
}

const STEP_INFO: Record<Step, { label: string; question: string; icon: string; hint: string }> = {
  situation: {
    label: "Step 1 of 5 — Situation",
    question: "What happened? Describe the situation briefly.",
    icon: "description",
    hint: "Just the facts — what, when, where.",
  },
  thought: {
    label: "Step 2 of 5 — Automatic Thought",
    question: "What thought or image went through your mind?",
    icon: "psychology",
    hint: "This is usually fast and automatic. Write exactly what you thought.",
  },
  evidence_for: {
    label: "Step 3 of 5 — Evidence For",
    question: "What evidence supports this thought being true?",
    icon: "check-circle",
    hint: "Be objective — what facts support it?",
  },
  evidence_against: {
    label: "Step 4 of 5 — Evidence Against",
    question: "What evidence suggests this thought may not be fully true?",
    icon: "cancel",
    hint: "Think of facts, past experiences, what others would say.",
  },
  balanced: {
    label: "Step 5 of 5 — Balanced Thought",
    question: "Based on the evidence, what is a more balanced way to see this?",
    icon: "balance",
    hint: "Not toxic positivity — just a fairer, more complete picture.",
  },
  done: {
    label: "Complete",
    question: "",
    icon: "check-circle",
    hint: "",
  },
};

const STEP_ORDER: Step[] = ["situation", "thought", "evidence_for", "evidence_against", "balanced"];

export default function CBTScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("situation");
  const [inputs, setInputs] = useState<Partial<ThoughtRecord>>({});
  const [currentText, setCurrentText] = useState("");
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentIdx = STEP_ORDER.indexOf(step);
  const info = STEP_INFO[step];

  const onNext = async () => {
    const updated = { ...inputs, [step]: currentText.trim() } as Partial<ThoughtRecord>;
    setInputs(updated);

    if (step === "balanced") {
      setStep("done");
      setLoading(true);
      try {
        const prompt = `A user just completed a CBT thought record:\n\nSituation: ${updated.situation}\nAutomatic thought: ${updated.automaticThought}\nEvidence for: ${updated.evidenceFor}\nEvidence against: ${updated.evidenceAgainst}\nBalanced thought: ${updated.balancedThought}\n\nGive a warm, 2-3 sentence reflection that affirms their effort, validates the balanced thought, and offers one small actionable next step. Keep it under 80 words.`;
        const result = await postJson<{ content: string }>("/api/ai/chat", { message: prompt });
        setAiReflection(result.content);
      } catch {
        setAiReflection(
          "You did something brave today — you examined your own thinking. That balanced thought is worth holding on to.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      const nextIdx = currentIdx + 1;
      setStep(STEP_ORDER[nextIdx]!);
      setCurrentText("");
    }
  };

  const onBack = () => {
    if (currentIdx <= 0) return;
    setStep(STEP_ORDER[currentIdx - 1]!);
    const prevStep = STEP_ORDER[currentIdx - 1]! as keyof ThoughtRecord;
    setCurrentText(inputs[prevStep] ?? "");
  };

  const onRestart = () => {
    setStep("situation");
    setInputs({});
    setCurrentText("");
    setAiReflection(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          { backgroundColor: "#7C5DB8", paddingTop: insets.top + 14 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>CBT Assistant</Text>
          <Text style={styles.headerSub}>Thought record · Challenge unhelpful thinking</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step !== "done" ? (
          <>
            {/* Progress */}
            <View style={styles.progressRow}>
              {STEP_ORDER.map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.progressStep,
                    {
                      backgroundColor:
                        i <= currentIdx ? "#7C5DB8" : c.border,
                      flex: 1,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={{ height: 20 }} />

            <Text style={[styles.stepLabel, { color: c.mutedForeground }]}>
              {info.label}
            </Text>
            <Text style={[styles.question, { color: c.foreground }]}>
              {info.question}
            </Text>
            <Text style={[styles.hint, { color: c.mutedForeground }]}>
              {info.hint}
            </Text>

            <View style={{ height: 16 }} />

            <TextInput
              value={currentText}
              onChangeText={setCurrentText}
              placeholder="Type here..."
              placeholderTextColor={c.mutedForeground}
              multiline
              style={[
                styles.input,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  color: c.foreground,
                },
              ]}
              autoFocus
            />

            {/* Previous answers */}
            {currentIdx > 0 ? (
              <>
                <View style={{ height: 20 }} />
                <Text style={[styles.prevLabel, { color: c.mutedForeground }]}>
                  Your previous answers
                </Text>
                {STEP_ORDER.slice(0, currentIdx).map((s) => (
                  <Card key={s} style={{ marginBottom: 8 }}>
                    <Text style={[styles.prevStepLabel, { color: c.mutedForeground }]}>
                      {STEP_INFO[s].label.split("—")[1]?.trim()}
                    </Text>
                    <Text style={[styles.prevStepText, { color: c.foreground }]}>
                      {inputs[s as keyof ThoughtRecord]}
                    </Text>
                  </Card>
                ))}
              </>
            ) : null}

            <View style={{ height: 24 }} />
            <View style={styles.navRow}>
              {currentIdx > 0 ? (
                <Pressable onPress={onBack} style={styles.backTextBtn}>
                  <MaterialIcons name="arrow-back" size={18} color={c.mutedForeground} />
                  <Text style={[styles.backTextLabel, { color: c.mutedForeground }]}>
                    Back
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label={step === "balanced" ? "Get reflection" : "Next"}
                  icon={step === "balanced" ? "auto-awesome" : "arrow-forward"}
                  onPress={onNext}
                  disabled={!currentText.trim()}
                  style={{ backgroundColor: "#7C5DB8" }}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.doneHero}>
              <View style={[styles.doneIcon, { backgroundColor: "#7C5DB8" + "22" }]}>
                <MaterialIcons name="psychology" size={36} color="#7C5DB8" />
              </View>
              <Text style={[styles.doneTitle, { color: c.foreground }]}>
                Thought record complete
              </Text>
              <Text style={[styles.doneSub, { color: c.mutedForeground }]}>
                You challenged an unhelpful thought today. That takes courage.
              </Text>
            </View>

            {aiReflection ? (
              <Card>
                <View style={styles.reflectionHeader}>
                  <MaterialIcons name="auto-awesome" size={18} color="#7C5DB8" />
                  <Text style={[styles.reflectionLabel, { color: "#7C5DB8" }]}>
                    AI reflection
                  </Text>
                </View>
                <Text style={[styles.reflectionText, { color: c.foreground }]}>
                  {aiReflection}
                </Text>
              </Card>
            ) : loading ? (
              <Card>
                <Text style={[styles.reflectionText, { color: c.mutedForeground }]}>
                  Generating your reflection...
                </Text>
              </Card>
            ) : null}

            <View style={{ height: 16 }} />

            <Card>
              <Text style={[styles.prevLabel, { color: c.mutedForeground }]}>
                Your thought record
              </Text>
              {STEP_ORDER.map((s) => (
                <View key={s} style={styles.summaryRow}>
                  <Text style={[styles.prevStepLabel, { color: c.mutedForeground }]}>
                    {STEP_INFO[s].label.split("—")[1]?.trim()}
                  </Text>
                  <Text style={[styles.prevStepText, { color: c.foreground }]}>
                    {inputs[s as keyof ThoughtRecord]}
                  </Text>
                </View>
              ))}
            </Card>

            <View style={{ height: 24 }} />
            <PrimaryButton
              label="New thought record"
              icon="refresh"
              variant="outline"
              onPress={onRestart}
            />
            <View style={{ height: 12 }} />
            <PrimaryButton
              label="Talk to AI Mate"
              icon="forum"
              onPress={() => router.push("/(tabs)/ai-mate")}
            />
          </>
        )}
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
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  content: { padding: 20 },
  progressRow: { flexDirection: "row", gap: 5 },
  progressStep: { height: 5, borderRadius: 3 },
  stepLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.5, marginBottom: 6 },
  question: { fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 27, marginBottom: 6 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    minHeight: 130,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  navRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backTextBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10, minWidth: 60 },
  backTextLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  prevLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  prevStepLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.3, marginBottom: 4 },
  prevStepText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  summaryRow: { marginBottom: 12 },
  doneHero: { alignItems: "center", paddingVertical: 20, gap: 10, marginBottom: 20 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  doneSub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  reflectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  reflectionLabel: { fontFamily: "Inter_700Bold", fontSize: 13 },
  reflectionText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
});
