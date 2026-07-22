import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useApp } from "@/contexts/AppContext";
import { useMood } from "@/contexts/MoodContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useAIInsights } from "@/contexts/AIInsightsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";
import { Header } from "@/components/Header";
import { MoodSelector } from "@/components/MoodSelector";
import { WellnessCarousel } from "@/components/WellnessCarousel";
import { SearchOverlay } from "@/components/SearchOverlay";
import { greetingKey } from "@/lib/dateUtils";
import { useT } from "@/hooks/useT";
import { getInsightForDay } from "@/constants/insights";
import { MOODS } from "@/constants/moods";
import { getCountyName } from "@/constants/counties";
import { generateAffirmation } from "@/lib/aiClient";
import { formatDateISO } from "@/lib/dateUtils";

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Primary quick action cards
const FEATURED_ACTIONS = [
  {
    label: "AI Mate",
    sub: "Chat with your health companion",
    icon: "psychology",
    bg: "#3A7BD5",
    accent: "#2260B5",
    route: "/(tabs)/ai-mate",
  },
  {
    label: "Book Doctor",
    sub: "Find care in your county",
    icon: "medical-services",
    bg: "#27AE60",
    accent: "#1D8A4A",
    route: "/(tabs)/book-doctor",
  },
] as const;

// Secondary grid actions
const GRID_ACTIONS = [
  { label: "Smart Match", sub: "Describe symptoms", icon: "auto-awesome", color: "#7C5DB8", bg: "#EDE9FE", route: "/smart-match" },
  { label: "Journal", sub: "Reflect & release", icon: "edit-note", color: "#D97706", bg: "#FEF3C7", route: "/journal" },
  { label: "Community", sub: "Connect & share", icon: "people", color: "#E07A5F", bg: "#FEE9E1", route: "/(tabs)/community" },
  { label: "Symptoms", sub: "Quick triage", icon: "health-and-safety", color: "#0891B2", bg: "#E0F7FA", route: "/symptom-check" },
] as const;

// Tool strip pills
const TOOL_PILLS = [
  { label: "Breathing", icon: "air", color: "#059669", route: "/breathing" },
  { label: "Meditate", icon: "self-improvement", color: "#7C5DB8", route: "/meditation" },
  { label: "Sleep", icon: "bedtime", color: "#1E40AF", route: "/sleep-sounds" },
  { label: "Stress Tips", icon: "spa", color: "#BE185D", route: "/stress-tips" },
  { label: "Goals", icon: "flag", color: "#D97706", route: "/goals" },
  { label: "Check-in", icon: "check-circle", color: "#059669", route: "/daily-checkin" },
] as const;

function AnimatedCard({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function FeaturedActionCard({ item, onPress }: { item: typeof FEATURED_ACTIONS[number]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
      <Animated.View style={[styles.featCard, { backgroundColor: item.bg, transform: [{ scale }] }]}>
        <View style={[styles.featAccent, { backgroundColor: item.accent }]} />
        <View style={[styles.featIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={26} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, marginTop: 12 }}>
          <Text style={styles.featLabel}>{item.label}</Text>
          <Text style={styles.featSub} numberOfLines={2}>{item.sub}</Text>
        </View>
        <View style={styles.featArrow}>
          <MaterialIcons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

function GridActionCard({ item, onPress }: { item: typeof GRID_ACTIONS[number]; onPress: () => void }) {
  const c = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.gridCardWrap}>
      <Animated.View style={[styles.gridCard, { backgroundColor: c.card, borderColor: c.border, transform: [{ scale }] }]}>
        <View style={[styles.gridIconWrap, { backgroundColor: item.bg }]}>
          <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={item.color} />
        </View>
        <Text style={[styles.gridLabel, { color: c.foreground }]} numberOfLines={1}>{item.label}</Text>
        <Text style={[styles.gridSub, { color: c.mutedForeground }]} numberOfLines={1}>{item.sub}</Text>
      </Animated.View>
    </Pressable>
  );
}

function ToolPill({ item, onPress }: { item: typeof TOOL_PILLS[number]; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress}
      style={({ pressed }) => [styles.toolPill, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
      <View style={[styles.toolPillIcon, { backgroundColor: item.color + "18" }]}>
        <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={item.color} />
      </View>
      <Text style={[styles.toolPillLabel, { color: c.foreground }]}>{item.label}</Text>
    </Pressable>
  );
}

function WellnessRing({ score }: { score: number }) {
  const pct = Math.min(1, Math.max(0, score / 100));
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * pct;
  const label = score >= 80 ? "Great" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Low";

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <View style={[styles.ringTrack, { width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: "rgba(255,255,255,0.18)" }]} />
        <View style={[styles.ringFill, { width: size - stroke * 2, height: size - stroke * 2, borderRadius: (size - stroke * 2) / 2, backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Text style={styles.ringScore}>{score}</Text>
          <Text style={styles.ringLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const c = useColors();
  const router = useRouter();
  const t = useT();
  const { profile } = useApp();
  const { todayEntry, log, last7, streak } = useMood();
  const { upcoming } = useAppointments();
  const { risk } = useAIInsights();
  const { unreadCount, markAllRead } = useNotifications();
  const bottomPad = useBottomTabPadding(12);

  const insight = getInsightForDay();
  const greeting = t(greetingKey());
  const nextAppt = upcoming[0];
  const greetName = profile.name || "friend";
  const countyName = getCountyName(profile.county);
  const todayMood = MOODS.find((m) => m.id === todayEntry?.moodId);

  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [affLoading, setAffLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Wellness score — composite of streak, mood, appointments
  const moodScore = last7.filter((d) => d.moodId).length / 7;
  const streakScore = Math.min(streak / 7, 1);
  const apptScore = upcoming.length > 0 ? 1 : 0.5;
  const wellnessScore = Math.round((moodScore * 40 + streakScore * 40 + apptScore * 20));

  useEffect(() => {
    let mounted = true;
    setAffLoading(true);
    generateAffirmation({ name: profile.name || undefined, mood: todayEntry?.moodId })
      .then((text) => { if (mounted) setAffirmation(text); })
      .catch(() => { if (mounted) setAffirmation("You are doing better than you think. One small step today is enough."); })
      .finally(() => { if (mounted) setAffLoading(false); });
    return () => { mounted = false; };
  }, [profile.name, todayEntry?.moodId, formatDateISO(new Date())]);

  const showRiskBanner = risk?.suggest_support || risk?.risk_level === "high";

  const onNotifPress = () => { markAllRead(); router.push("/notifications"); };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Header showLogo onSearchPress={() => setSearchVisible(true)} onNotifPress={onNotifPress} notifBadge={unreadCount} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>

        {/* ─── HERO ─── */}
        <AnimatedCard delay={0}>
          <View style={[styles.hero, { backgroundColor: c.heroBg }]}>
            <View style={[styles.heroBubble1, { backgroundColor: c.heroOverlay1 }]} />
            <View style={[styles.heroBubble2, { backgroundColor: c.heroOverlay2 }]} />
            <View style={[styles.heroBubble3, { backgroundColor: c.heroOverlay3 }]} />
            <View style={styles.heroBubble4} />

            <View style={styles.heroInner}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.heroDate}>{dateLabel}</Text>
                {countyName ? <Text style={styles.heroCounty}>{countyName}</Text> : null}
                <Text style={styles.heroGreeting}>{greeting},</Text>
                <Text style={styles.heroName}>{greetName}</Text>

                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <MaterialIcons name="local-fire-department" size={14} color="#FCD34D" />
                    <Text style={styles.heroStatVal}>{streak > 0 ? `${streak}d` : "–"}</Text>
                    <Text style={styles.heroStatLabel}>streak</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <MaterialIcons name="mood" size={14} color="#6EE7B7" />
                    <Text style={styles.heroStatVal}>{todayMood?.label ?? "–"}</Text>
                    <Text style={styles.heroStatLabel}>mood</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <MaterialIcons name="event" size={14} color="#C4B5FD" />
                    <Text style={styles.heroStatVal}>{upcoming.length}</Text>
                    <Text style={styles.heroStatLabel}>appts</Text>
                  </View>
                </View>
              </View>

              {/* Wellness ring */}
              <WellnessRing score={wellnessScore} />
            </View>

            {/* Bottom strip */}
            <View style={styles.heroStrip}>
              <MaterialIcons name="auto-awesome" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.heroStripText}>Wellness score based on your recent activity</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ─── RISK BANNER ─── */}
        {showRiskBanner ? (
          <AnimatedCard delay={60}>
            <Pressable onPress={() => router.push("/(tabs)/tools" as never)}>
              <View style={[styles.riskBanner, { backgroundColor: c.destructiveSoft, borderColor: c.destructive }]}>
                <View style={[styles.riskIconWrap, { backgroundColor: c.destructive + "22" }]}>
                  <MaterialIcons name="emergency" size={20} color={c.destructive} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.riskTitle, { color: c.destructive }]}>We are here for you</Text>
                  <Text style={[styles.riskBody, { color: c.foreground }]} numberOfLines={2}>
                    {risk?.guidance ?? "You may be having a hard week. Tap for support resources."}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={c.destructive} />
              </View>
            </Pressable>
          </AnimatedCard>
        ) : null}

        {/* ─── AI AFFIRMATION ─── */}
        <AnimatedCard delay={80}>
          <Pressable onPress={() => router.push("/affirmations")}>
            <View style={[styles.affCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.affGlow, { backgroundColor: c.primary }]} />
              <View style={styles.affBody}>
                <View style={styles.affTopRow}>
                  <View style={[styles.affIconWrap, { backgroundColor: c.primarySoft }]}>
                    <MaterialIcons name="auto-awesome" size={15} color={c.primary} />
                  </View>
                  <Text style={[styles.affLabel, { color: c.primary }]}>TODAY'S AFFIRMATION</Text>
                  <MaterialIcons name="chevron-right" size={16} color={c.mutedForeground} />
                </View>
                {affLoading && !affirmation ? (
                  <ActivityIndicator color={c.primary} size="small" style={{ marginTop: 10, alignSelf: "flex-start" }} />
                ) : (
                  <Text style={[styles.affText, { color: c.foreground }]}>{affirmation}</Text>
                )}
              </View>
            </View>
          </Pressable>
        </AnimatedCard>

        {/* ─── MOOD SELECTOR ─── */}
        <AnimatedCard delay={100}>
          <View style={[styles.moodCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.moodCardHeader}>
              <View>
                <Text style={[styles.moodCardTitle, { color: c.foreground }]}>How are you feeling?</Text>
                <Text style={[styles.moodCardSub, { color: c.mutedForeground }]}>Tap to log today's mood</Text>
              </View>
              {streak > 0 && (
                <View style={[styles.streakBadge, { backgroundColor: "#FFF7ED" }]}>
                  <MaterialIcons name="local-fire-department" size={14} color="#EA580C" />
                  <Text style={styles.streakBadgeText}>{streak}d</Text>
                </View>
              )}
            </View>
            <View style={{ height: 14 }} />
            <MoodSelector selected={todayEntry?.moodId ?? null} onSelect={log} compact />
          </View>
        </AnimatedCard>

        {/* ─── QUICK ACTIONS ─── */}
        <AnimatedCard delay={130}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>Quick access</Text>
            <Pressable onPress={() => router.push("/(tabs)/tools" as never)}>
              <Text style={[styles.sectionLink, { color: c.primary }]}>All tools</Text>
            </Pressable>
          </View>

          {/* Featured 2-col cards */}
          <View style={styles.featRow}>
            {FEATURED_ACTIONS.map((item) => (
              <FeaturedActionCard key={item.label} item={item} onPress={() => router.push(item.route as never)} />
            ))}
          </View>

          {/* Grid 2x2 */}
          <View style={styles.gridRow}>
            {GRID_ACTIONS.map((item) => (
              <GridActionCard key={item.label} item={item} onPress={() => router.push(item.route as never)} />
            ))}
          </View>

          {/* Horizontal tool strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolStrip}>
            {TOOL_PILLS.map((item) => (
              <ToolPill key={item.label} item={item} onPress={() => router.push(item.route as never)} />
            ))}
          </ScrollView>
        </AnimatedCard>

        {/* ─── NEXT APPOINTMENT ─── */}
        {nextAppt ? (
          <AnimatedCard delay={160}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionHeader, { color: c.foreground }]}>Next appointment</Text>
              <Pressable onPress={() => router.push("/appointments")}>
                <Text style={[styles.sectionLink, { color: c.primary }]}>View all</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push(`/doctor/${nextAppt.doctorId}` as never)}>
              <View style={[styles.apptCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.apptIconWrap, { backgroundColor: "#E2F5EB" }]}>
                  <MaterialIcons name="event" size={24} color="#27AE60" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.apptName, { color: c.foreground }]} numberOfLines={1}>{nextAppt.doctorName}</Text>
                  <Text style={[styles.apptMeta, { color: c.mutedForeground }]} numberOfLines={1}>{nextAppt.specialty} · {nextAppt.facility}</Text>
                  <View style={styles.apptTimeRow}>
                    <MaterialIcons name="access-time" size={12} color="#27AE60" />
                    <Text style={[styles.apptTime, { color: "#27AE60" }]}>{nextAppt.date} at {nextAppt.time}</Text>
                  </View>
                </View>
                <View style={[styles.apptArrow, { backgroundColor: c.muted }]}>
                  <MaterialIcons name="chevron-right" size={20} color={c.mutedForeground} />
                </View>
              </View>
            </Pressable>
          </AnimatedCard>
        ) : (
          <AnimatedCard delay={160}>
            <Pressable onPress={() => router.push("/(tabs)/book-doctor" as never)}>
              <View style={[styles.noApptCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.noApptIcon, { backgroundColor: c.primarySoft }]}>
                  <MaterialIcons name="add-circle-outline" size={22} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.apptName, { color: c.foreground }]}>Book a doctor</Text>
                  <Text style={[styles.apptMeta, { color: c.mutedForeground }]}>No upcoming appointments · Find one now</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
              </View>
            </Pressable>
          </AnimatedCard>
        )}

        {/* ─── MOOD THIS WEEK ─── */}
        <AnimatedCard delay={180}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>Mood this week</Text>
            <Pressable onPress={() => router.push("/mood-insights")}>
              <Text style={[styles.sectionLink, { color: c.primary }]}>See insights</Text>
            </Pressable>
          </View>
          <View style={[styles.weekCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.weekRow}>
              {last7.map((d, i) => {
                const mood = MOODS.find((m) => m.id === d.moodId);
                const day = new Date(d.date).getDay();
                const isToday = i === last7.length - 1;
                return (
                  <View key={i} style={styles.weekCol}>
                    <View style={[styles.weekBar, {
                      backgroundColor: mood ? mood.color : c.muted,
                      height: mood ? ({ calm: 60, okay: 52, stressed: 40, low: 30, overwhelmed: 20 }[mood.id] ?? 40) : 18,
                      opacity: mood ? 1 : 0.4,
                    }]}>
                      {mood ? <MaterialIcons name={mood.icon as keyof typeof MaterialIcons.glyphMap} size={13} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={[styles.weekLabel, { color: isToday ? c.primary : c.mutedForeground, fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular" }]}>
                      {WEEK_LABELS[day]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={[styles.weekLegend, { borderTopColor: c.border }]}>
              <MaterialIcons name="info-outline" size={12} color={c.mutedForeground} />
              <Text style={[styles.weekHint, { color: c.mutedForeground }]}>
                {last7.filter((d) => d.moodId).length}/7 days logged this week
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ─── AI INSIGHT ─── */}
        {risk && risk.risk_level !== "high" ? (
          <AnimatedCard delay={200}>
            <Text style={[styles.sectionHeader, { color: c.foreground }]}>AI insight</Text>
            <View style={[styles.insightCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.insightLeft, { backgroundColor: risk.risk_level === "elevated" ? "#FEF3C7" : c.secondarySoft }]}>
                <MaterialIcons name="psychology" size={22}
                  color={risk.risk_level === "elevated" ? "#D97706" : c.secondary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.insightTitle, { color: c.foreground }]}>
                  {risk.risk_level === "elevated" ? "Heavier week than usual"
                    : risk.risk_level === "moderate" ? "A mixed week"
                      : "Mood looking steady"}
                </Text>
                <Text style={[styles.insightBody, { color: c.mutedForeground }]}>{risk.guidance}</Text>
                {risk.signals.slice(0, 2).map((s, i) => (
                  <View key={i} style={styles.signalRow}>
                    <View style={[styles.signalDot, { backgroundColor: c.mutedForeground }]} />
                    <Text style={[styles.signalText, { color: c.foreground }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedCard>
        ) : null}

        {/* ─── TODAY'S INSIGHT ─── */}
        <AnimatedCard delay={210}>
          <View style={[styles.todayCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.todayIconWrap, { backgroundColor: c.primarySoft }]}>
              <MaterialIcons name={insight.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={c.primary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.todayTitle, { color: c.foreground }]}>{insight.title}</Text>
              <Text style={[styles.todayBody, { color: c.mutedForeground }]}>{insight.body}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* ─── WELLNESS READS ─── */}
        <AnimatedCard delay={230}>
          <Text style={[styles.sectionHeader, { color: c.foreground }]}>Wellness reads</Text>
          <WellnessCarousel />
        </AnimatedCard>

        {/* ─── EMERGENCY CTA ─── */}
        <AnimatedCard delay={250}>
          <Pressable onPress={() => router.push("/(tabs)/support" as never)}
            style={({ pressed }) => [styles.emergencyCta, { backgroundColor: c.destructiveSoft, borderColor: c.destructive, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.emergencyIconWrap, { backgroundColor: c.destructive + "22" }]}>
              <MaterialIcons name="emergency" size={22} color={c.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.emergencyTitle, { color: c.destructive }]}>Need help right now?</Text>
              <Text style={[styles.emergencyBody, { color: c.foreground }]} numberOfLines={2}>
                Emergency lines, NGO helplines, and crisis resources.
              </Text>
            </View>
            <View style={[styles.emergencyArrow, { backgroundColor: c.destructive + "22" }]}>
              <MaterialIcons name="chevron-right" size={20} color={c.destructive} />
            </View>
          </Pressable>
        </AnimatedCard>

      </ScrollView>

      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },

  // Hero
  hero: { borderRadius: 24, overflow: "hidden", padding: 20, paddingBottom: 0 },
  heroBubble1: { position: "absolute", right: -60, top: -60, width: 220, height: 220, borderRadius: 110 },
  heroBubble2: { position: "absolute", left: -50, bottom: -50, width: 180, height: 180, borderRadius: 90 },
  heroBubble3: { position: "absolute", right: 20, bottom: 30, width: 100, height: 100, borderRadius: 50 },
  heroBubble4: { position: "absolute", left: 60, top: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.04)" },
  heroInner: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  heroDate: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 0.3 },
  heroCounty: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  heroGreeting: { fontFamily: "Inter_400Regular", fontSize: 18, color: "rgba(255,255,255,0.88)", marginTop: 8 },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#FFFFFF", letterSpacing: -0.5 },
  heroStats: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 0 },
  heroStat: { flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 12 },
  heroStatVal: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF" },
  heroStatLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.6)" },
  heroStatDivider: { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.2)", marginRight: 12 },
  heroStrip: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.1)" },
  heroStripText: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.5)" },

  // Wellness ring
  ringTrack: { position: "absolute" },
  ringFill: { alignItems: "center", justifyContent: "center" },
  ringScore: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  ringLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.6)" },

  // Risk banner
  riskBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  riskIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  riskTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  riskBody: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2, lineHeight: 17 },

  // Affirmation
  affCard: { flexDirection: "row", borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  affGlow: { width: 4 },
  affBody: { flex: 1, padding: 14, gap: 10 },
  affTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  affIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  affLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1, flex: 1 },
  affText: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 22 },

  // Mood card
  moodCard: { padding: 16, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  moodCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  moodCardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  moodCardSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  streakBadgeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#EA580C" },

  // Section headers
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  sectionHeader: { fontFamily: "Inter_700Bold", fontSize: 17, letterSpacing: -0.2 },
  sectionLink: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  // Featured cards
  featRow: { flexDirection: "row", gap: 10, marginBottom: 10, marginTop: 8 },
  featCard: { flex: 1, borderRadius: 18, padding: 16, minHeight: 130, overflow: "hidden" },
  featAccent: { position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: 40 },
  featIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  featLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF", marginBottom: 3 },
  featSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.78)", lineHeight: 16 },
  featArrow: { position: "absolute", bottom: 14, right: 14, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  // Grid cards
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  gridCardWrap: { width: "47.5%" },
  gridCard: { width: "100%", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 8, minHeight: 100 },
  gridIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  gridLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  gridSub: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 15 },

  // Tool pills
  toolStrip: { gap: 8, paddingVertical: 4 },
  toolPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30, borderWidth: StyleSheet.hairlineWidth },
  toolPillIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  toolPillLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  // Appointment
  apptCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  apptIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  apptName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  apptMeta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  apptTimeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  apptTime: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  apptArrow: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  noApptCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  noApptIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  // Mood week
  weekCard: { padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  weekRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 },
  weekCol: { flex: 1, alignItems: "center", gap: 6, justifyContent: "flex-end" },
  weekBar: { width: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", minHeight: 18 },
  weekLabel: { fontSize: 11 },
  weekLegend: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  weekHint: { fontFamily: "Inter_400Regular", fontSize: 11 },

  // AI insight
  insightCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  insightLeft: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  insightTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  insightBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  signalRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  signalDot: { width: 5, height: 5, borderRadius: 3 },
  signalText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },

  // Today insight
  todayCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  todayIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  todayTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  todayBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },

  // Emergency
  emergencyCta: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1.5 },
  emergencyIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emergencyTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  emergencyBody: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2, lineHeight: 17 },
  emergencyArrow: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
