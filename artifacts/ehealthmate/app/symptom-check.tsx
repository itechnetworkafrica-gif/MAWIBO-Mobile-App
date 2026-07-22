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

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { checkSymptoms } from "@/lib/aiClient";

const DURATIONS = ["A few hours", "1-2 days", "About a week", "Longer"];

export default function SymptomCheckScreen() {
  const c = useColors();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState<string>("1-2 days");
  const [result, setResult] = useState<string | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const res = await checkSymptoms({
        symptoms,
        age: age ? Number(age) : undefined,
        duration,
      });
      setResult(res.content);
      setCrisis(res.crisis);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const urgency = result?.match(/URGENCY:\s*(.+)/i)?.[1]?.trim() ?? null;
  const urgencyColor =
    urgency?.toUpperCase() === "URGENT"
      ? c.destructive
      : urgency?.toUpperCase().includes("DOCTOR")
        ? c.warning
        : c.secondary;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "AI Symptom Check",
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.disclaimer, { backgroundColor: c.warningSoft }]}>
          <MaterialIcons name="info" size={18} color={c.warning} />
          <Text style={[styles.disclaimerText, { color: c.foreground }]}>
            This is not a diagnosis. It helps you decide if you should see a
            doctor.
          </Text>
        </View>

        <View style={{ height: 16 }} />

        <Text style={[styles.label, { color: c.foreground }]}>
          What are you feeling?
        </Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <TextInput
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="e.g. headache for two days, also feeling tired"
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[styles.textArea, { color: c.foreground }]}
          />
        </View>

        <View style={{ height: 14 }} />

        <Text style={[styles.label, { color: c.foreground }]}>How long?</Text>
        <View style={styles.chipsRow}>
          {DURATIONS.map((d) => {
            const active = duration === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDuration(d)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.primary : c.card,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? c.primaryForeground : c.foreground },
                  ]}
                >
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 14 }} />

        <Text style={[styles.label, { color: c.foreground }]}>
          Age (optional)
        </Text>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 24"
            placeholderTextColor={c.mutedForeground}
            keyboardType="number-pad"
            style={[styles.input, { color: c.foreground }]}
          />
        </View>

        <View style={{ height: 18 }} />

        <PrimaryButton
          label="Check my symptoms"
          icon="health-and-safety"
          onPress={submit}
          disabled={!symptoms.trim() || loading}
          loading={loading}
        />

        {err ? (
          <Text style={[styles.error, { color: c.destructive }]}>{err}</Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={c.primary} />
            <Text style={{ color: c.mutedForeground, marginLeft: 8 }}>
              Thinking with care...
            </Text>
          </View>
        ) : null}

        {result ? (
          <>
            <View style={{ height: 18 }} />
            {crisis ? (
              <View
                style={[
                  styles.crisis,
                  {
                    backgroundColor: c.destructiveSoft,
                    borderColor: c.destructive,
                  },
                ]}
              >
                <MaterialIcons name="emergency" size={20} color={c.destructive} />
                <Text style={[styles.crisisText, { color: c.foreground }]}>
                  Please reach out for support now. Tap to see emergency
                  contacts.
                </Text>
                <Pressable
                  onPress={() => router.push("/(tabs)/support")}
                  style={[styles.crisisBtn, { backgroundColor: c.destructive }]}
                >
                  <Text style={[styles.crisisBtnText]}>Open</Text>
                </Pressable>
              </View>
            ) : null}
            {urgency ? (
              <View style={[styles.urgencyRow, { backgroundColor: urgencyColor }]}>
                <MaterialIcons
                  name={
                    urgency.toUpperCase() === "URGENT"
                      ? "warning"
                      : urgency.toUpperCase().includes("DOCTOR")
                        ? "medical-services"
                        : "spa"
                  }
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.urgencyText}>{urgency}</Text>
              </View>
            ) : null}
            <View style={{ height: 12 }} />
            <Card>
              <Text style={[styles.resultText, { color: c.foreground }]}>
                {result}
              </Text>
            </Card>
            <View style={{ height: 14 }} />
            <Pressable
              onPress={() => router.push("/(tabs)/book-doctor")}
              style={[
                styles.secondaryBtn,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <MaterialIcons name="medical-services" size={18} color={c.primary} />
              <Text style={[styles.secondaryBtnText, { color: c.foreground }]}>
                Book a doctor
              </Text>
            </Pressable>
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
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  disclaimerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
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
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 12,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  error: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 12 },
  urgencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  urgencyText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  crisis: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  crisisText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  crisisBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  crisisBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
