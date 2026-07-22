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
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { sleepCoach } from "@/lib/aiClient";

const PRESETS = [
  "I cannot fall asleep at night",
  "I wake up many times during the night",
  "My mind races when I try to sleep",
  "I wake up too early and cannot go back to sleep",
];

export default function SleepCoachScreen() {
  const c = useColors();
  const [issue, setIssue] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (text?: string) => {
    const finalText = (text ?? issue).trim();
    if (!finalText) return;
    setIssue(finalText);
    setLoading(true);
    setErr(null);
    try {
      const res = await sleepCoach(finalText);
      setPlan(res);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "AI Sleep Coach",
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: c.primarySoft }]}>
          <MaterialIcons name="nights-stay" size={28} color={c.primary} />
          <Text style={[styles.heroTitle, { color: c.foreground }]}>
            Tell me what is keeping you awake
          </Text>
          <Text style={[styles.heroSub, { color: c.mutedForeground }]}>
            We will build a small plan for tonight.
          </Text>
        </View>

        <View style={{ height: 16 }} />

        <Text style={[styles.label, { color: c.foreground }]}>Common issues</Text>
        <View style={styles.presetWrap}>
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              onPress={() => submit(p)}
              style={[
                styles.preset,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={[styles.presetText, { color: c.foreground }]}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 16 }} />

        <Text style={[styles.label, { color: c.foreground }]}>
          Or describe in your own words
        </Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <TextInput
            value={issue}
            onChangeText={setIssue}
            placeholder="Describe how you have been sleeping..."
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[styles.textArea, { color: c.foreground }]}
          />
        </View>

        <View style={{ height: 14 }} />

        <PrimaryButton
          label="Build my sleep plan"
          icon="auto-awesome"
          onPress={() => submit()}
          disabled={!issue.trim() || loading}
          loading={loading}
        />

        {err ? (
          <Text style={[styles.error, { color: c.destructive }]}>{err}</Text>
        ) : null}

        {loading && !plan ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={c.primary} />
            <Text style={{ color: c.mutedForeground, marginLeft: 8 }}>
              Crafting tonight's plan...
            </Text>
          </View>
        ) : null}

        {plan ? (
          <>
            <View style={{ height: 18 }} />
            <Card>
              <View style={styles.aiHeader}>
                <MaterialIcons name="auto-awesome" size={18} color={c.primary} />
                <Text style={[styles.aiTitle, { color: c.foreground }]}>
                  Your sleep plan
                </Text>
              </View>
              <Text style={[styles.planText, { color: c.foreground }]}>
                {plan}
              </Text>
            </Card>
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  hero: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    textAlign: "center",
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  presetWrap: { gap: 8 },
  preset: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  presetText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  inputBox: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
  },
  textArea: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 90,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  error: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 12 },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  aiTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  planText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
