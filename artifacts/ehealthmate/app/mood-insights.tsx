import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useMood } from "@/contexts/MoodContext";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmptyState } from "@/components/EmptyState";
import { getMoodInsights } from "@/lib/aiClient";
import { MOODS } from "@/constants/moods";

export default function MoodInsightsScreen() {
  const c = useColors();
  const { entries } = useMood();
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setErr(null);
    try {
      const text = await getMoodInsights(
        entries.map((e) => ({ date: e.date, mood: e.moodId })),
      );
      setInsights(text);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const moodCounts = entries.reduce(
    (acc, e) => {
      acc[e.moodId] = (acc[e.moodId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const total = entries.length;

  if (total === 0) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <Stack.Screen
          options={{
            title: "Mood Insights",
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: "#FFFFFF",
          }}
        />
        <EmptyState
          icon="insights"
          title="Log a few moods first"
          message="Once you log moods for a few days, your AI insights will unlock here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "Mood Insights",
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[styles.title, { color: c.foreground }]}>
            Your mood breakdown
          </Text>
          <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
            Across {total} {total === 1 ? "entry" : "entries"}
          </Text>
          <View style={{ height: 14 }} />
          {MOODS.map((m) => {
            const count = moodCounts[m.id] ?? 0;
            const pct = total === 0 ? 0 : (count / total) * 100;
            return (
              <View key={m.id} style={styles.barRow}>
                <View
                  style={[styles.barIcon, { backgroundColor: `${m.color}1F` }]}
                >
                  <MaterialIcons
                    name={m.icon as any}
                    size={16}
                    color={m.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.barHeader}>
                    <Text style={[styles.barLabel, { color: c.foreground }]}>
                      {m.label}
                    </Text>
                    <Text style={[styles.barCount, { color: c.mutedForeground }]}>
                      {count} · {Math.round(pct)}%
                    </Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: c.muted }]}>
                    <View
                      style={[
                        styles.barFill,
                        { backgroundColor: m.color, width: `${pct}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        <View style={{ height: 18 }} />

        <PrimaryButton
          label={insights ? "Refresh insights" : "Get AI insights"}
          icon="auto-awesome"
          onPress={generate}
          loading={loading}
          disabled={loading}
        />

        {err ? (
          <Text style={[styles.error, { color: c.destructive }]}>{err}</Text>
        ) : null}

        {loading && !insights ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={c.primary} />
            <Text style={{ color: c.mutedForeground, marginLeft: 8 }}>
              Reading your patterns...
            </Text>
          </View>
        ) : null}

        {insights ? (
          <>
            <View style={{ height: 16 }} />
            <Card>
              <View style={styles.aiHeader}>
                <MaterialIcons name="auto-awesome" size={18} color={c.primary} />
                <Text style={[styles.aiTitle, { color: c.foreground }]}>
                  What your moods say
                </Text>
              </View>
              <Text style={[styles.insightText, { color: c.foreground }]}>
                {insights}
              </Text>
            </Card>
          </>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  title: { fontFamily: "Inter_700Bold", fontSize: 16 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  barIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  barCount: { fontFamily: "Inter_400Regular", fontSize: 12 },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
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
  insightText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
