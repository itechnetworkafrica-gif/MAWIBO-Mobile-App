import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { PrimaryButton } from "@/components/PrimaryButton";

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe out", seconds: 4 },
  { label: "Hold", seconds: 4 },
];

export default function BreathingScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0]!.seconds);
  const [cycles, setCycles] = useState(0);
  const scale = useRef(new Animated.Value(0.6)).current;

  // Responsive: max 280px, min 200px, with 48px side padding
  const circleSize = Math.min(Math.max(width - 96, 200), 280);
  const innerSize = Math.round(circleSize * 0.857); // 240/280

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIndex((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) setCycles((c2) => c2 + 1);
          return next;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length]!.seconds;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phaseIndex]);

  useEffect(() => {
    if (!running) return;
    const phase = PHASES[phaseIndex]!;
    const target =
      phase.label === "Breathe in"
        ? 1
        : phase.label === "Breathe out"
          ? 0.6
          : phase.label === "Hold" && phaseIndex === 1
            ? 1
            : 0.6;
    Animated.timing(scale, {
      toValue: target,
      duration: phase.seconds * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [phaseIndex, running, scale]);

  const start = () => {
    setRunning(true);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0]!.seconds);
  };

  const stop = () => {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0]!.seconds);
    Animated.timing(scale, {
      toValue: 0.6,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const phase = PHASES[phaseIndex]!;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Box breathing" }} />
      <View style={styles.content}>
        <Text style={[styles.intro, { color: c.mutedForeground }]}>
          Box breathing calms your body in just a few minutes. Follow the
          circle and breathe gently.
        </Text>

        <View
          style={[
            styles.circleWrap,
            { width: circleSize, height: circleSize },
          ]}
        >
          <Animated.View
            style={[
              styles.outerRing,
              {
                borderColor: c.primarySoft,
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: c.primary,
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                transform: [{ scale }],
              },
            ]}
          />
          <View style={styles.circleText}>
            <Text style={[styles.phaseLabel, { color: "#FFFFFF" }]}>
              {running ? phase.label : "Ready?"}
            </Text>
            <Text
              style={[
                styles.phaseCount,
                { color: "#FFFFFF", fontSize: Math.min(56, circleSize * 0.2) },
              ]}
            >
              {running ? secondsLeft : "—"}
            </Text>
          </View>
        </View>

        <Text style={[styles.cycles, { color: c.mutedForeground }]}>
          {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
        </Text>

        <View style={{ height: 22 }} />
        {running ? (
          <PrimaryButton
            label="Stop"
            icon="stop"
            variant="outline"
            onPress={stop}
          />
        ) : (
          <PrimaryButton label="Start" icon="play-arrow" onPress={start} />
        )}

        <View style={styles.tips}>
          <View style={styles.tipRow}>
            <MaterialIcons name="info" size={16} color={c.primary} />
            <Text style={[styles.tipText, { color: c.mutedForeground }]}>
              Try 4 cycles for a quick reset, 8 for deeper calm.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 320,
  },
  circleWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  outerRing: {
    position: "absolute",
    borderWidth: 6,
  },
  circle: {
    position: "absolute",
  },
  circleText: { alignItems: "center" },
  phaseLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  phaseCount: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
    marginTop: 6,
  },
  cycles: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  tips: {
    marginTop: 22,
    width: "100%",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
