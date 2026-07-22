import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SEED_MEMBERS } from "@/contexts/CommunityContext";

type CallState = "connecting" | "ringing" | "connected" | "ended";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function AudioCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const member = SEED_MEMBERS.find((m) => m.id === userId);

  const [callState, setCallState] = useState<CallState>("connecting");
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    connectRef.current = setTimeout(() => {
      setCallState("ringing");
      Vibration.vibrate([0, 400, 200, 400]);
      setTimeout(() => {
        setCallState("connected");
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      }, 2200);
    }, 1200);
    return () => {
      if (connectRef.current) clearTimeout(connectRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => router.back(), 1000);
  };

  const duration = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  const stateLabel =
    callState === "connecting" ? "Connecting…"
    : callState === "ringing" ? "Ringing…"
    : callState === "connected" ? duration
    : "Call ended";

  const color = member?.color ?? "#3A7BD5";

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 12 }]}>
        <MaterialIcons name="keyboard-arrow-down" size={28} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <View style={styles.topSection}>
        <Text style={styles.callLabel}>MAWIBO Voice Call</Text>

        <View style={[styles.avatar, { backgroundColor: color + "33", borderColor: color + "66" }]}>
          <Text style={[styles.avatarText, { color }]}>{member?.initials ?? "??"}</Text>
          {callState === "connected" && <View style={styles.pulse} />}
        </View>

        <Text style={styles.name}>{member?.name ?? "Unknown"}</Text>
        <Text style={styles.county}>{member?.county ?? ""}</Text>

        <View style={styles.stateRow}>
          {callState === "connected" && (
            <MaterialIcons name="graphic-eq" size={16} color="#6FCF97" style={{ marginRight: 6 }} />
          )}
          <Text style={[styles.stateText, { color: callState === "connected" ? "#6FCF97" : "rgba(255,255,255,0.65)" }]}>
            {stateLabel}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => setMuted((v) => !v)}
            style={[styles.ctrlBtn, { backgroundColor: muted ? "#E03E3E33" : "rgba(255,255,255,0.12)" }]}
          >
            <MaterialIcons name={muted ? "mic-off" : "mic"} size={26} color={muted ? "#E03E3E" : "#FFFFFF"} />
            <Text style={[styles.ctrlLabel, { color: muted ? "#E03E3E" : "rgba(255,255,255,0.7)" }]}>
              {muted ? "Unmute" : "Mute"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onEndCall}
            style={[styles.endBtn]}
          >
            <MaterialIcons name="call-end" size={30} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => setSpeaker((v) => !v)}
            style={[styles.ctrlBtn, { backgroundColor: speaker ? "#3A7BD533" : "rgba(255,255,255,0.12)" }]}
          >
            <MaterialIcons name={speaker ? "volume-up" : "volume-down"} size={26} color={speaker ? "#3A7BD5" : "#FFFFFF"} />
            <Text style={[styles.ctrlLabel, { color: speaker ? "#3A7BD5" : "rgba(255,255,255,0.7)" }]}>
              Speaker
            </Text>
          </Pressable>
        </View>

        {callState === "ended" && (
          <Text style={styles.endedLabel}>Call ended</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1B3E",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  callLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 6,
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
  },
  pulse: {
    position: "absolute",
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1.5,
    borderColor: "#6FCF97",
    opacity: 0.4,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  county: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  stateText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  controls: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: "center",
    gap: 16,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  ctrlBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  ctrlLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E03E3E",
    alignItems: "center",
    justifyContent: "center",
  },
  endedLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
  },
});
