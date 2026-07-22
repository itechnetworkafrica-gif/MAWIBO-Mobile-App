import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { useApp } from "@/contexts/AppContext";
import { useMood } from "@/contexts/MoodContext";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DoctorCard } from "@/components/DoctorCard";
import { getDoctorMatch } from "@/lib/ai";
import { DOCTORS } from "@/constants/doctors";
import { SPECIALTIES, getSpecialtyName } from "@/constants/specialties";
import type { DoctorMatch } from "@/lib/ai/types";

export default function SmartMatchScreen() {
  const c = useColors();
  const router = useRouter();
  const { profile } = useApp();
  const { todayEntry } = useMood();
  const [symptoms, setSymptoms] = useState("");
  const [match, setMatch] = useState<DoctorMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onMatch = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    setMatch(null);
    try {
      const m = await getDoctorMatch({
        symptoms: symptoms.trim(),
        mood: todayEntry?.moodId,
        county: profile.county ?? undefined,
        specialties: SPECIALTIES.map((s) => s.id),
      });
      setMatch(m);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not match a doctor right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const matchedDoctors = match
    ? DOCTORS.filter((d) => {
        if (d.specialty !== match.specialty) return false;
        if (profile.county && d.county === profile.county) return true;
        return !profile.county;
      }).slice(0, 5)
    : [];

  const fallbackDoctors =
    match && matchedDoctors.length === 0
      ? DOCTORS.filter((d) => d.specialty === match.specialty).slice(0, 5)
      : [];

  const urgencyColor =
    match?.urgency === "urgent"
      ? c.destructive
      : match?.urgency === "soon"
        ? c.warning
        : c.secondary;

  const urgencyLabel =
    match?.urgency === "urgent"
      ? "Seek care today"
      : match?.urgency === "soon"
        ? "See a doctor soon"
        : "Routine appointment";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Smart Doctor Match" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <View style={styles.heroRow}>
            <View
              style={[styles.heroIcon, { backgroundColor: c.primarySoft }]}
            >
              <MaterialIcons name="auto-awesome" size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: c.foreground }]}>
                Find the right kind of doctor
              </Text>
              <Text
                style={[styles.heroBody, { color: c.mutedForeground }]}
              >
                Tell me what is going on. I will suggest the best specialty and
                doctors near you.
              </Text>
            </View>
          </View>
          <View style={{ height: 12 }} />
          <TextInput
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="e.g. I feel anxious all the time and cannot sleep"
            placeholderTextColor={c.mutedForeground}
            multiline
            style={[
              styles.input,
              { color: c.foreground, backgroundColor: c.muted },
            ]}
          />
          <View style={{ height: 12 }} />
          <PrimaryButton
            label={loading ? "Matching..." : "Find a doctor"}
            icon="search"
            onPress={onMatch}
            disabled={!symptoms.trim() || loading}
            loading={loading}
          />
          {error ? (
            <Text style={[styles.error, { color: c.destructive }]}>{error}</Text>
          ) : null}
        </Card>

        {loading && !match ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <ActivityIndicator color={c.primary} />
          </View>
        ) : null}

        {match ? (
          <>
            <View style={{ height: 18 }} />
            <Card>
              <Text style={[styles.matchLabel, { color: c.mutedForeground }]}>
                RECOMMENDED SPECIALTY
              </Text>
              <Text style={[styles.matchTitle, { color: c.foreground }]}>
                {getSpecialtyName(match.specialty)}
              </Text>
              <Text style={[styles.matchReason, { color: c.foreground }]}>
                {match.reason}
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[styles.badge, { backgroundColor: urgencyColor + "22" }]}
                >
                  <MaterialIcons
                    name={
                      match.urgency === "urgent"
                        ? "warning"
                        : match.urgency === "soon"
                          ? "schedule"
                          : "check-circle"
                    }
                    size={14}
                    color={urgencyColor}
                  />
                  <Text style={[styles.badgeText, { color: urgencyColor }]}>
                    {urgencyLabel}
                  </Text>
                </View>
                <View
                  style={[styles.badge, { backgroundColor: c.muted }]}
                >
                  <MaterialIcons
                    name="psychology"
                    size={14}
                    color={c.mutedForeground}
                  />
                  <Text
                    style={[styles.badgeText, { color: c.mutedForeground }]}
                  >
                    {match.confidence} confidence
                  </Text>
                </View>
              </View>
              {match.alt_specialty ? (
                <Text
                  style={[styles.alt, { color: c.mutedForeground }]}
                >
                  Or consider: {getSpecialtyName(match.alt_specialty)}
                </Text>
              ) : null}
            </Card>

            <View style={{ height: 18 }} />
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              {profile.county
                ? "Doctors near you"
                : "Suggested doctors"}
            </Text>

            {(matchedDoctors.length > 0
              ? matchedDoctors
              : fallbackDoctors
            ).length === 0 ? (
              <Text style={[styles.empty, { color: c.mutedForeground }]}>
                No matching doctors available yet. Try Browse all in the Book a
                Doctor tab.
              </Text>
            ) : (
              <View style={{ gap: 10, marginTop: 8 }}>
                {(matchedDoctors.length > 0
                  ? matchedDoctors
                  : fallbackDoctors
                ).map((d) => (
                  <DoctorCard
                    key={d.id}
                    doctor={d}
                    onPress={() => router.push(`/doctor/${d.id}`)}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 14 }} />
            <Pressable
              onPress={() => router.push("/(tabs)/book-doctor")}
              style={[styles.browseRow, { backgroundColor: c.muted }]}
            >
              <MaterialIcons name="search" size={18} color={c.primary} />
              <Text style={[styles.browseText, { color: c.foreground }]}>
                Browse all doctors
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={c.mutedForeground}
              />
            </Pressable>
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
  heroRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  heroBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  input: {
    minHeight: 100,
    textAlignVertical: "top",
    padding: 14,
    borderRadius: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 10,
  },
  matchLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  matchTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 4,
  },
  matchReason: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  alt: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  empty: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 8,
  },
  browseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
