import React, { useEffect, useState } from "react";
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
import { useApp } from "@/contexts/AppContext";
import { useMood } from "@/contexts/MoodContext";
import { Card } from "@/components/Card";
import { generateAffirmation } from "@/lib/aiClient";

export default function AffirmationsScreen() {
  const c = useColors();
  const { profile } = useApp();
  const { todayEntry } = useMood();
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const generate = async () => {
    setLoading(true);
    setErr(null);
    try {
      const text = await generateAffirmation({
        name: profile.name || undefined,
        mood: todayEntry?.moodId ?? undefined,
      });
      setAffirmation(text);
      setHistory((prev) => [text, ...prev].slice(0, 8));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "Daily Affirmation",
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: c.primary }]}>
          <MaterialIcons name="auto-awesome" size={32} color="#FFFFFF" />
          <Text style={styles.heroTitle}>For you today</Text>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ marginTop: 12 }} />
          ) : (
            <Text style={styles.heroText}>{affirmation ?? "—"}</Text>
          )}
        </View>

        {err ? (
          <Text style={[styles.error, { color: c.destructive }]}>{err}</Text>
        ) : null}

        <View style={{ height: 16 }} />

        <Pressable
          onPress={generate}
          disabled={loading}
          style={[
            styles.refreshBtn,
            { backgroundColor: c.card, borderColor: c.border, opacity: loading ? 0.6 : 1 },
          ]}
        >
          <MaterialIcons name="refresh" size={20} color={c.primary} />
          <Text style={[styles.refreshText, { color: c.foreground }]}>
            Give me another
          </Text>
        </Pressable>

        <View style={{ height: 22 }} />

        {history.length > 1 ? (
          <>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Recent affirmations
            </Text>
            {history.slice(1).map((h, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Card>
                  <View style={styles.historyRow}>
                    <MaterialIcons
                      name="format-quote"
                      size={18}
                      color={c.primary}
                    />
                    <Text style={[styles.historyText, { color: c.foreground }]}>
                      {h}
                    </Text>
                  </View>
                </Card>
              </View>
            ))}
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
  heroCard: {
    padding: 22,
    borderRadius: 18,
    alignItems: "center",
    gap: 12,
  },
  heroTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  refreshText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 10,
  },
  historyRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  historyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    flex: 1,
    lineHeight: 21,
  },
  error: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 12 },
});
