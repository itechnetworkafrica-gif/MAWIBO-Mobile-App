import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { SLEEP_SOUNDS } from "@/constants/insights";

const TIMER_OPTIONS = [10, 20, 30, 60];

export default function SleepSoundsScreen() {
  const c = useColors();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(20);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Sleep sounds" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: c.mutedForeground }]}>
          Pick a gentle sound to help your body settle. Set a timer so it stops
          on its own.
        </Text>

        <View style={{ height: 18 }} />
        <Text style={[styles.label, { color: c.foreground }]}>Timer</Text>
        <View style={styles.timerRow}>
          {TIMER_OPTIONS.map((t) => {
            const active = timer === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTimer(t)}
                style={[
                  styles.timerChip,
                  {
                    backgroundColor: active ? c.primary : c.card,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? c.primaryForeground : c.foreground,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {t} min
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 18 }} />
        <Text style={[styles.label, { color: c.foreground }]}>Sounds</Text>
        <View style={styles.grid}>
          {SLEEP_SOUNDS.map((s) => {
            const active = activeId === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setActiveId(active ? null : s.id)}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    backgroundColor: active ? c.primarySoft : c.card,
                    borderColor: active ? c.primary : c.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tileIcon,
                    {
                      backgroundColor: active ? c.primary : c.muted,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={s.icon as keyof typeof MaterialIcons.glyphMap}
                    size={22}
                    color={active ? "#FFFFFF" : c.foreground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: c.foreground }]}>
                    {s.title}
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: c.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {active ? `Playing · ${timer} min` : s.subtitle}
                  </Text>
                </View>
                <MaterialIcons
                  name={active ? "pause-circle" : "play-circle"}
                  size={28}
                  color={c.primary}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 22 }} />
        <Card>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <MaterialIcons name="info" size={18} color={c.primary} />
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                flex: 1,
                lineHeight: 18,
              }}
            >
              Audio playback is offline-friendly. Sounds are simulated for
              preview; on device, real audio loops will play.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  intro: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginBottom: 8,
  },
  timerRow: { flexDirection: "row", gap: 8 },
  timerChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  grid: { gap: 10 },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
