import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Header } from "@/components/Header";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";
import { greetingKey } from "@/lib/dateUtils";
import { useT } from "@/hooks/useT";

const AI_TOOLS = [
  { id: "symptom-check", title: "Symptom Check", sub: "AI triage", icon: "health-and-safety", color: "#3A7BD5", bg: "#E8F0FD", badge: "AI", route: "/symptom-check" },
  { id: "affirmations", title: "Affirmation", sub: "Words for today", icon: "auto-awesome", color: "#27AE60", bg: "#E2F5EB", badge: "AI", route: "/affirmations" },
  { id: "mood-insights", title: "Mood Insights", sub: "Pattern analysis", icon: "insights", color: "#7C5DB8", bg: "#EDE9FE", badge: "AI", route: "/mood-insights" },
  { id: "sleep-coach", title: "Sleep Coach", sub: "Better rest plan", icon: "nights-stay", color: "#5C6BC0", bg: "#E8EAF6", badge: "AI", route: "/sleep-coach" },
  { id: "cbt", title: "CBT Assistant", sub: "Challenge thoughts", icon: "psychology", color: "#9333EA", bg: "#F5F3FF", badge: "AI", route: "/cbt" },
  { id: "anxiety", title: "Anxiety Relief", sub: "Calm + support", icon: "favorite", color: "#E07A5F", bg: "#FEE9E1", badge: "AI", route: "/anxiety" },
  { id: "gratitude", title: "Gratitude AI", sub: "Daily 3 items", icon: "volunteer-activism", color: "#059669", bg: "#D1FAE5", badge: "AI", route: "/gratitude" },
  { id: "productivity", title: "Productivity", sub: "Do more, stress less", icon: "rocket-launch", color: "#0284C7", bg: "#E0F2FE", badge: "AI", route: "/productivity" },
];

const WELLNESS_TOOLS = [
  { id: "breathing", title: "Box Breathing", sub: "4-min calm", icon: "air", color: "#059669", bg: "#D1FAE5", route: "/breathing" },
  { id: "meditation", title: "Meditation", sub: "Guided sessions", icon: "self-improvement", color: "#7C5DB8", bg: "#EDE9FE", route: "/meditation" },
  { id: "journal", title: "AI Journal", sub: "Write and reflect", icon: "edit-note", color: "#D97706", bg: "#FEF3C7", route: "/journal" },
  { id: "sleep-sounds", title: "Sleep Sounds", sub: "Ambient rest", icon: "bedtime", color: "#1E40AF", bg: "#DBEAFE", route: "/sleep-sounds" },
  { id: "stress-tips", title: "Stress Tips", sub: "Quick coping", icon: "tips-and-updates", color: "#BE185D", bg: "#FCE7F3", route: "/stress-tips" },
  { id: "goals", title: "Goal Tracker", sub: "Wellness goals", icon: "flag", color: "#D97706", bg: "#FEF3C7", route: "/goals" },
];

const FEATURED = [
  {
    title: "Daily Check-in",
    sub: "A short AI reflection to start your day right",
    icon: "check-circle",
    bg: "#3A7BD5",
    accent: "#2260B5",
    route: "/daily-checkin",
  },
  {
    title: "Smart Match",
    sub: "Describe your symptoms and find the right doctor",
    icon: "auto-awesome",
    bg: "#7C5DB8",
    accent: "#5B3F9A",
    route: "/smart-match",
  },
  {
    title: "Pre-Consultation",
    sub: "Build a patient summary before your appointment",
    icon: "summarize",
    bg: "#059669",
    accent: "#037A52",
    route: "/symptom-check",
  },
] as const;

function PressableTile({ item, onPress }: {
  item: { id: string; title: string; sub: string; icon: string; color: string; bg: string; badge?: string };
  onPress: () => void;
}) {
  const c = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
      style={{ width: "47.5%" }}
    >
      <Animated.View style={[styles.tile, { backgroundColor: c.card, borderColor: c.border, transform: [{ scale }] }]}>
        {item.badge ? (
          <View style={[styles.badge, { backgroundColor: item.bg }]}>
            <Text style={[styles.badgeText, { color: item.color }]}>{item.badge}</Text>
          </View>
        ) : null}
        <View style={[styles.tileIcon, { backgroundColor: item.bg }]}>
          <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={24} color={item.color} />
        </View>
        <Text style={[styles.tileTitle, { color: c.foreground }]}>{item.title}</Text>
        <Text style={[styles.tileSub, { color: c.mutedForeground }]} numberOfLines={2}>{item.sub}</Text>
      </Animated.View>
    </Pressable>
  );
}

function FeaturedCard({ item, onPress }: { item: typeof FEATURED[number]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
    >
      <Animated.View style={[styles.featCard, { backgroundColor: item.bg, transform: [{ scale }] }]}>
        <View style={[styles.featBubble, { backgroundColor: item.accent }]} />
        <View style={[styles.featIconWrap, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
          <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.featText}>
          <Text style={styles.featTitle}>{item.title}</Text>
          <Text style={styles.featSub} numberOfLines={2}>{item.sub}</Text>
        </View>
        <View style={styles.featArrow}>
          <MaterialIcons name="arrow-forward" size={18} color="rgba(255,255,255,0.85)" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function ToolsScreen() {
  const c = useColors();
  const router = useRouter();
  const t = useT();
  const greeting = t(greetingKey());
  const bottomPad = useBottomTabPadding(12);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Header title="Tools" subtitle="AI helpers and daily practices" variant="primary" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>

        {/* AI Hub hero */}
        <Pressable
          onPress={() => router.push("/ai-hub")}
          style={({ pressed }) => [styles.hubBanner, { opacity: pressed ? 0.93 : 1 }]}
        >
          <View style={styles.hubBubble} />
          <View style={styles.hubBubble2} />
          <View style={styles.hubLeft}>
            <View style={styles.hubIconWrap}>
              <MaterialIcons name="psychology" size={30} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.hubTitleRow}>
                <Text style={styles.hubTitle}>AI Hub</Text>
                <View style={styles.hubPill}>
                  <Text style={styles.hubPillText}>25 tools</Text>
                </View>
              </View>
              <Text style={styles.hubSub}>All AI-powered tools in one place</Text>
            </View>
          </View>
          <View style={styles.hubArrow}>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Featured cards horizontal scroll */}
        <View style={{ marginBottom: 4 }}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>Featured</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featScroll}>
            {FEATURED.map((item) => (
              <View key={item.title} style={{ width: 260 }}>
                <FeaturedCard item={item} onPress={() => router.push(item.route as never)} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Community shortcut */}
        <Pressable
          onPress={() => router.push("/(tabs)/community" as never)}
          style={({ pressed }) => [styles.communityBanner, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={[styles.communityIcon, { backgroundColor: "#27AE60" + "22" }]}>
            <MaterialIcons name="people" size={22} color="#27AE60" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.communityTitle, { color: c.foreground }]}>Community</Text>
            <Text style={[styles.communitySub, { color: c.mutedForeground }]}>
              Join the Liberia health circle · Chat &amp; share
            </Text>
          </View>
          <View style={[styles.liveDot, { backgroundColor: "#27AE60" }]} />
          <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
        </Pressable>

        {/* AI tools grid */}
        <View>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>AI-powered tools</Text>
            <View style={[styles.aiPill, { backgroundColor: c.primarySoft }]}>
              <MaterialIcons name="auto-awesome" size={12} color={c.primary} />
              <Text style={[styles.aiPillText, { color: c.primary }]}>Powered by GPT</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {AI_TOOLS.map((tool) => (
              <PressableTile key={tool.id} item={tool} onPress={() => router.push(tool.route as never)} />
            ))}
          </View>
        </View>

        {/* Wellness tools grid */}
        <View>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>Wellness practices</Text>
          </View>
          <View style={styles.grid}>
            {WELLNESS_TOOLS.map((tool) => (
              <PressableTile key={tool.id} item={tool} onPress={() => router.push(tool.route as never)} />
            ))}
          </View>
        </View>

        {/* Encouragement */}
        <View style={[styles.encourageCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.encourageIconWrap, { backgroundColor: "#FEE9E1" }]}>
            <MaterialIcons name="favorite" size={22} color="#E07A5F" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.encourageTitle, { color: c.foreground }]}>You are doing your best</Text>
            <Text style={[styles.encourageSub, { color: c.mutedForeground }]}>
              {greeting} — use these tools as often as you need. They are always here for you.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  // Hub
  hubBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#1E4FA0",
    overflow: "hidden",
  },
  hubBubble: { position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.07)" },
  hubBubble2: { position: "absolute", left: -20, bottom: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)" },
  hubLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  hubIconWrap: { width: 54, height: 54, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  hubTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  hubTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF" },
  hubPill: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  hubPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.9)" },
  hubSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.78)" },
  hubArrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  // Section
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionHeader: { fontFamily: "Inter_700Bold", fontSize: 17, letterSpacing: -0.2 },
  aiPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  aiPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },

  // Featured
  featScroll: { gap: 10, paddingRight: 4, paddingBottom: 4 },
  featCard: { borderRadius: 20, padding: 18, overflow: "hidden", minHeight: 120, justifyContent: "space-between" },
  featBubble: { position: "absolute", right: -20, top: -20, width: 90, height: 90, borderRadius: 45 },
  featIconWrap: { width: 52, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featText: { flex: 1, gap: 4 },
  featTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
  featSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 17 },
  featArrow: { position: "absolute", bottom: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  // Community
  communityBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  communityIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  communityTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  communitySub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 16, minHeight: 128, gap: 8, position: "relative" },
  tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tileTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  tileSub: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  badge: { position: "absolute", top: 10, right: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.3 },

  // Encouragement
  encourageCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  encourageIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  encourageTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  encourageSub: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
});
