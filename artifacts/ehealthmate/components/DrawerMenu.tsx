import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useDrawer } from "@/contexts/DrawerContext";
import { useApp } from "@/contexts/AppContext";
import type { ThemeMode } from "@/contexts/AppContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

type IconName = keyof typeof MaterialIcons.glyphMap;

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
  matchSegment?: string;
  badge?: string;
  color?: string;
}

interface SectionDef {
  title: string;
  items: NavItem[];
}

const SECTIONS: SectionDef[] = [
  {
    title: "Main",
    items: [
      { label: "Home", icon: "home", route: "/(tabs)", matchSegment: "index" },
      { label: "Profile", icon: "person", route: "/profile", matchSegment: "profile" },
      { label: "AI Mate", icon: "forum", route: "/(tabs)/ai-mate", matchSegment: "ai-mate" },
      { label: "AI Hub", icon: "psychology", route: "/ai-hub", matchSegment: "ai-hub", badge: "25 tools", color: "#7C5DB8" },
      { label: "Community", icon: "people", route: "/community", matchSegment: "community", badge: "New" },
    ],
  },
  {
    title: "Health",
    items: [
      { label: "Mood Insights", icon: "insert-chart", route: "/mood-insights", matchSegment: "mood-insights" },
      { label: "Journal", icon: "edit-note", route: "/journal", matchSegment: "journal" },
      { label: "Goal Tracker", icon: "flag", route: "/goals", matchSegment: "goals" },
      { label: "Daily Check-in", icon: "check-circle", route: "/daily-checkin", matchSegment: "daily-checkin" },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "CBT Assistant", icon: "psychology", route: "/cbt", matchSegment: "cbt" },
      { label: "Gratitude AI", icon: "volunteer-activism", route: "/gratitude", matchSegment: "gratitude" },
      { label: "Anxiety Relief", icon: "favorite", route: "/anxiety", matchSegment: "anxiety" },
      { label: "Productivity Coach", icon: "rocket-launch", route: "/productivity", matchSegment: "productivity" },
      { label: "Breathing", icon: "air", route: "/breathing", matchSegment: "breathing" },
      { label: "Sleep Coach", icon: "nights-stay", route: "/sleep-coach", matchSegment: "sleep-coach" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Book Doctor", icon: "medical-services", route: "/(tabs)/book-doctor", matchSegment: "book-doctor" },
      { label: "Smart Match", icon: "auto-awesome", route: "/smart-match", matchSegment: "smart-match" },
      { label: "My Appointments", icon: "event", route: "/appointments", matchSegment: "appointments" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", icon: "settings", route: "/settings", matchSegment: "settings" },
      { label: "Notifications", icon: "notifications", route: "/notifications", matchSegment: "notifications" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & Support", icon: "support-agent", route: "/(tabs)/support", matchSegment: "support" },
      { label: "Emergency Contacts", icon: "emergency", route: "/(tabs)/support", color: "#E03E3E" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Admin Dashboard", icon: "admin-panel-settings", route: "/admin", matchSegment: "admin", badge: "Admin", color: "#F59E0B" },
    ],
  },
];

const THEME_CYCLE: ThemeMode[] = ["dark", "light", "system"];
const THEME_ICONS: Record<ThemeMode, IconName> = {
  dark: "dark-mode",
  light: "light-mode",
  system: "settings-brightness",
};
const THEME_LABELS: Record<ThemeMode, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

export function DrawerMenu() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { open, closeDrawer } = useDrawer();
  const { profile, updateProfile } = useApp();
  const router = useRouter();
  const segments = useSegments();
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, slide, fade]);

  const isDark = c.background === "#0E1420";
  const activeSegment = (segments[segments.length - 1] as string) ?? "";

  const onItemPress = (item: NavItem) => {
    closeDrawer();
    setTimeout(() => {
      router.push(item.route as never);
    }, 180);
  };

  const cycleTheme = () => {
    const cur = THEME_CYCLE.indexOf(profile.themeMode);
    const next = THEME_CYCLE[(cur + 1) % THEME_CYCLE.length]!;
    updateProfile({ themeMode: next });
  };

  const initials = (profile.name || "G")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "G";

  const drawerBg = isDark ? "#121825" : c.card;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, { backgroundColor: c.overlay, opacity: fade }]}
          pointerEvents={open ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: drawerBg,
              transform: [{ translateX: slide }],
              paddingTop: insets.top + 14,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {/* User header */}
          <View style={styles.userArea}>
            <Pressable
              onPress={() => { closeDrawer(); setTimeout(() => router.push("/profile"), 180); }}
              style={[styles.avatarWrap, { backgroundColor: c.primary + "22", borderColor: c.primary + "44" }]}
            >
              <Text style={[styles.avatarTxt, { color: c.primary }]}>{initials}</Text>
            </Pressable>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => { closeDrawer(); setTimeout(() => router.push("/profile"), 180); }}
            >
              <Text style={[styles.appName, { color: c.foreground }]} numberOfLines={1}>
                {profile.name || "eHealthMate"}
              </Text>
              <Text style={[styles.userName, { color: c.mutedForeground }]} numberOfLines={1}>
                {profile.bio || "Tap to view profile"}
              </Text>
            </Pressable>
            <Pressable
              onPress={closeDrawer}
              hitSlop={10}
              style={[styles.closeBtn, { backgroundColor: c.muted }]}
              accessibilityLabel="Close menu"
            >
              <MaterialIcons name="close" size={20} color={c.foreground} />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 6 }}
            showsVerticalScrollIndicator={false}
          >
            {SECTIONS.map((section, sIdx) => (
              <View key={section.title}>
                <Text style={[styles.sectionTitle, { color: c.mutedForeground }]}>
                  {section.title.toUpperCase()}
                </Text>
                {section.items.map((item) => {
                  const active =
                    item.matchSegment !== undefined &&
                    activeSegment === item.matchSegment;
                  const itemColor = item.color ?? (active ? c.primary : c.foreground);
                  return (
                    <Pressable
                      key={`${section.title}-${item.label}`}
                      onPress={() => onItemPress(item)}
                      android_ripple={{ color: c.primarySoft }}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: active
                            ? c.primarySoft
                            : pressed
                              ? c.muted
                              : "transparent",
                          borderLeftWidth: active ? 3 : 0,
                          borderLeftColor: c.primary,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={itemColor}
                      />
                      <Text
                        style={[
                          styles.rowLabel,
                          {
                            color: itemColor,
                            fontFamily: active
                              ? "Inter_600SemiBold"
                              : "Inter_500Medium",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.badge ? (
                        <View
                          style={[
                            styles.navBadge,
                            {
                              backgroundColor: active
                                ? c.primary
                                : item.color
                                  ? item.color + "22"
                                  : c.primarySoft,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.navBadgeText,
                              {
                                color: active
                                  ? "#FFFFFF"
                                  : item.color ?? c.primary,
                              },
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
                {sIdx < SECTIONS.length - 1 ? (
                  <View style={[styles.sectionDivider, { backgroundColor: c.border }]} />
                ) : null}
              </View>
            ))}

            {/* Theme toggle */}
            <Text style={[styles.sectionTitle, { color: c.mutedForeground }]}>
              APPEARANCE
            </Text>
            <Pressable
              onPress={cycleTheme}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? c.muted : "transparent" },
              ]}
            >
              <MaterialIcons
                name={THEME_ICONS[profile.themeMode]}
                size={20}
                color={c.foreground}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: c.foreground, fontFamily: "Inter_500Medium" },
                ]}
              >
                Theme: {THEME_LABELS[profile.themeMode]}
              </Text>
              <View style={[styles.themeChip, { backgroundColor: c.muted, borderColor: c.border }]}>
                <Text style={[styles.themeChipText, { color: c.mutedForeground }]}>
                  Tap to cycle
                </Text>
              </View>
            </Pressable>

            <View style={{ height: 20 }} />
            <View style={[styles.versionRow, { borderTopColor: c.border }]}>
              <MaterialIcons name="favorite" size={12} color={c.mutedForeground} />
              <Text style={[styles.footer, { color: c.mutedForeground }]}>
                eHealthMate LBR · v1.0 · Free & offline-first
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 6, height: 0 },
    elevation: 16,
  },
  userArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexShrink: 0,
  },
  avatarTxt: { fontFamily: "Inter_700Bold", fontSize: 17 },
  appName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  userName: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingLeft: 13,
    minHeight: 46,
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 14, flex: 1 },
  navBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  navBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10 },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginTop: 6,
  },
  themeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  themeChipText: { fontFamily: "Inter_400Regular", fontSize: 10 },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    paddingTop: 16,
    marginHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footer: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
