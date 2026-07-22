import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SEED_MEMBERS } from "@/contexts/CommunityContext";

type CallState = "connecting" | "connected" | "ended";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function VideoCallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const member = SEED_MEMBERS.find((m) => m.id === userId);

  const [callState, setCallState] = useState<CallState>("connecting");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setCallState("connected");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }, 2000);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => router.back(), 900);
  };

  const duration = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  const color = member?.color ?? "#3A7BD5";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Remote video placeholder */}
      <View style={styles.remoteVideo}>
        {callState === "connecting" ? (
          <View style={styles.connectingCenter}>
            <View style={[styles.remoteAvatar, { backgroundColor: color + "33", borderColor: color }]}>
              <Text style={[styles.remoteAvatarText, { color }]}>{member?.initials ?? "??"}</Text>
            </View>
            <Text style={styles.connectingText}>Connecting…</Text>
          </View>
        ) : callState === "ended" ? (
          <View style={styles.connectingCenter}>
            <MaterialIcons name="call-end" size={48} color="#E03E3E" />
            <Text style={styles.connectingText}>Call ended</Text>
          </View>
        ) : (
          <View style={styles.connectingCenter}>
            <View style={[styles.remoteAvatar, { backgroundColor: color + "22", borderColor: color + "55" }]}>
              <Text style={[styles.remoteAvatarText, { color }]}>{member?.initials ?? "??"}</Text>
            </View>
            <Text style={styles.remoteName}>{member?.name ?? "Unknown"}</Text>
          </View>
        )}
      </View>

      {/* Self preview */}
      <View style={[styles.selfView, { bottom: insets.bottom + 116 }]}>
        {cameraOff ? (
          <View style={styles.cameraOffView}>
            <MaterialIcons name="videocam-off" size={20} color="rgba(255,255,255,0.5)" />
          </View>
        ) : (
          <View style={styles.selfPlaceholder}>
            <MaterialIcons name="person" size={28} color="rgba(255,255,255,0.4)" />
          </View>
        )}
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.topBtn}>
          <MaterialIcons name="keyboard-arrow-down" size={26} color="rgba(255,255,255,0.75)" />
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topName} numberOfLines={1}>{member?.name ?? "Video Call"}</Text>
          {callState === "connected" && (
            <View style={styles.durationRow}>
              <View style={styles.liveIndicator} />
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={() => setMuted((v) => !v)}
          style={[styles.ctrlBtn, { backgroundColor: muted ? "#E03E3E55" : "rgba(255,255,255,0.18)" }]}
        >
          <MaterialIcons name={muted ? "mic-off" : "mic"} size={24} color={muted ? "#E03E3E" : "#FFFFFF"} />
          <Text style={styles.ctrlLabel}>{muted ? "Unmute" : "Mute"}</Text>
        </Pressable>

        <Pressable onPress={onEndCall} style={styles.endBtn}>
          <MaterialIcons name="call-end" size={28} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={() => setCameraOff((v) => !v)}
          style={[styles.ctrlBtn, { backgroundColor: cameraOff ? "#E03E3E55" : "rgba(255,255,255,0.18)" }]}
        >
          <MaterialIcons name={cameraOff ? "videocam-off" : "videocam"} size={24} color={cameraOff ? "#E03E3E" : "#FFFFFF"} />
          <Text style={styles.ctrlLabel}>{cameraOff ? "Camera on" : "Camera off"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A14",
  },
  remoteVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  connectingCenter: {
    alignItems: "center",
    gap: 16,
  },
  remoteAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  remoteAvatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
  },
  remoteName: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  connectingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
  },
  selfView: {
    position: "absolute",
    right: 16,
    width: 90,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  selfPlaceholder: {
    flex: 1,
    backgroundColor: "#1A2A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraOffView: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    gap: 4,
  },
  topName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#6FCF97",
  },
  durationText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#6FCF97",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  ctrlBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  ctrlLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
  },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E03E3E",
    alignItems: "center",
    justifyContent: "center",
  },
});
