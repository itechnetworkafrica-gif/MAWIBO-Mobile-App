import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { useMood } from "@/contexts/MoodContext";
import { useJournal } from "@/contexts/JournalContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { MOODS } from "@/constants/moods";
import { getCountyName } from "@/constants/counties";
import { GOALS } from "@/constants/goals";

export default function ProfileScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const { streak, last7 } = useMood();
  const { entries: journalEntries } = useJournal();
  const { upcoming, past } = useAppointments();
  const { user, logout } = useAuth();

  const initials = (profile.name || "ME")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "ME";

  const userGoals = GOALS.filter((g) => profile.goals.includes(g.id));

  const stats = [
    { value: streak, label: "Day streak", icon: "local-fire-department", color: "#E07A5F" },
    { value: journalEntries.length, label: "Journal entries", icon: "edit-note", color: "#E0A800" },
    { value: upcoming.length + past.length, label: "Appointments", icon: "event", color: "#6FCF97" },
  ];

  const onLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero header */}
      <View style={[styles.hero, { backgroundColor: c.primary, paddingTop: insets.top + 14 }]}>
        <View style={styles.heroNav}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.iconBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.heroNavTitle}>Profile</Text>
          <Pressable onPress={() => router.push("/settings")} hitSlop={10} style={[styles.iconBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <MaterialIcons name="settings" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: user ? user.avatarColor + "44" : "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarText}>{user ? user.username.charAt(0).toUpperCase() : initials}</Text>
          </View>
          <Text style={styles.heroName}>{user ? user.username : (profile.name || "Anonymous")}</Text>
          {user ? (
            <View style={[styles.accountBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <MaterialIcons name="verified-user" size={13} color="#FFFFFF" />
              <Text style={styles.accountBadgeText}>Registered member</Text>
            </View>
          ) : (
            <View style={[styles.accountBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <MaterialIcons name="person-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.accountBadgeText, { color: "rgba(255,255,255,0.8)" }]}>Guest account</Text>
            </View>
          )}
          {profile.bio ? <Text style={styles.heroBio}>{profile.bio}</Text> : null}
          <View style={styles.heroPills}>
            {getCountyName(profile.county) !== "Not set" ? (
              <View style={styles.heroPill}>
                <MaterialIcons name="location-on" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroPillText}>{getCountyName(profile.county)}</Text>
              </View>
            ) : null}
            <View style={styles.heroPill}>
              <MaterialIcons name="translate" size={13} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroPillText}>
                {profile.language === "en" ? "English" : profile.language === "en-simple" ? "Simple English" : profile.language}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Auth CTA — shown when not registered */}
        {!user ? (
          <View style={[styles.authCard, { backgroundColor: c.card, borderColor: c.primary + "40" }]}>
            <View style={[styles.authIcon, { backgroundColor: c.primarySoft }]}>
              <MaterialIcons name="account-circle" size={28} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.authTitle, { color: c.foreground }]}>Create a free account</Text>
              <Text style={[styles.authSub, { color: c.mutedForeground }]}>
                Register to join the community, message members, and save your progress.
              </Text>
            </View>
            <View style={styles.authBtns}>
              <Pressable
                onPress={() => router.push("/auth")}
                style={[styles.authPrimaryBtn, { backgroundColor: c.primary }]}
              >
                <Text style={styles.authPrimaryBtnText}>Register</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/auth")}
                style={[styles.authSecondaryBtn, { borderColor: c.primary }]}
              >
                <Text style={[styles.authSecondaryBtnText, { color: c.primary }]}>Login</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.accountCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.accountIconWrap, { backgroundColor: user.avatarColor + "22" }]}>
              <Text style={[styles.accountInitial, { color: user.avatarColor }]}>{user.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountName, { color: c.foreground }]}>{user.username}</Text>
              <Text style={[styles.accountEmail, { color: c.mutedForeground }]}>{user.email}</Text>
              <Text style={[styles.accountJoined, { color: c.mutedForeground }]}>
                Joined {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
            </View>
            <Pressable onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: c.destructiveSoft }]}>
              <MaterialIcons name="logout" size={16} color={c.destructive} />
            </Pressable>
          </View>
        )}

        <View style={{ height: 18 }} />

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "22" }]}>
                <MaterialIcons name={s.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: c.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: c.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 18 }} />

        {/* Goals */}
        {userGoals.length > 0 ? (
          <>
            <SectionHeader title="Your goals" />
            <Card>
              <View style={styles.goalsList}>
                {userGoals.map((g) => (
                  <View key={g.id} style={styles.goalRow}>
                    <View style={[styles.goalIcon, { backgroundColor: c.primarySoft }]}>
                      <MaterialIcons name={g.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={c.primary} />
                    </View>
                    <Text style={[styles.goalLabel, { color: c.foreground }]}>{g.label}</Text>
                  </View>
                ))}
              </View>
            </Card>
            <View style={{ height: 18 }} />
          </>
        ) : null}

        {/* Recent moods */}
        <SectionHeader title="Mood this week" actionLabel="See insights" onAction={() => router.push("/mood-insights")} />
        <Card>
          <View style={styles.weekRow}>
            {last7.map((d, i) => {
              const mood = MOODS.find((m) => m.id === d.moodId);
              const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
              const day = new Date(d.date).getDay();
              return (
                <View key={i} style={styles.weekDay}>
                  <View style={[styles.weekDot, { backgroundColor: mood ? mood.color : c.muted, borderColor: mood ? mood.color : c.border }]}>
                    {mood ? <MaterialIcons name={mood.icon as keyof typeof MaterialIcons.glyphMap} size={14} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={[styles.weekLabel, { color: c.mutedForeground }]}>{dayLabels[day]}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 18 }} />

        {/* Account links */}
        <SectionHeader title="Account" />
        <Card padded={false}>
          {[
            { icon: "edit", label: "Edit profile", route: "/settings" },
            { icon: "people", label: "Community", route: "/community" },
            { icon: "chat", label: "Messages", route: "/community" },
            { icon: "event", label: "My appointments", route: "/appointments" },
            { icon: "psychology", label: "AI Hub (25 tools)", route: "/ai-hub" },
            { icon: "notifications", label: "Notifications", route: "/notifications" },
            { icon: "support-agent", label: "Emergency support", route: "/(tabs)/support" },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
              style={({ pressed }) => [
                styles.linkRow,
                { borderBottomColor: c.border, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, backgroundColor: pressed ? c.muted : "transparent" },
              ]}
            >
              <View style={[styles.linkIcon, { backgroundColor: c.primarySoft }]}>
                <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={c.primary} />
              </View>
              <Text style={[styles.linkLabel, { color: c.foreground }]}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={c.mutedForeground} />
            </Pressable>
          ))}
        </Card>

        {!user && (
          <>
            <View style={{ height: 18 }} />
            <Pressable
              onPress={() => router.push("/auth")}
              style={[styles.bigAuthBtn, { backgroundColor: c.primary }]}
            >
              <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.bigAuthBtnText}>Register or Login</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  heroNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  heroNavTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarWrap: { alignItems: "center", gap: 6 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 4, borderWidth: 3, borderColor: "rgba(255,255,255,0.35)" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 30, color: "#FFFFFF" },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  accountBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  accountBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFFFFF" },
  heroBio: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", maxWidth: 280 },
  heroPills: { flexDirection: "row", gap: 8, marginTop: 4 },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroPillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.9)" },
  content: { padding: 16 },
  authCard: { flexDirection: "column", borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  authIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  authTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 4 },
  authSub: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  authBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  authPrimaryBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  authPrimaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  authSecondaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1.5 },
  authSecondaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  accountCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  accountIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  accountInitial: { fontFamily: "Inter_700Bold", fontSize: 22 },
  accountName: { fontFamily: "Inter_700Bold", fontSize: 16 },
  accountEmail: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  accountJoined: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  logoutBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  goalsList: { gap: 10 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  goalIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekDay: { alignItems: "center", gap: 5 },
  weekDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  weekLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, minHeight: 56 },
  linkIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  bigAuthBtn: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", paddingVertical: 16, borderRadius: 14 },
  bigAuthBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
});
