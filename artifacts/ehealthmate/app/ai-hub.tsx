import React, { useState } from "react";
import {
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
import { useBottomInset } from "@/hooks/useBottomTabPadding";
import {
  AI_HUB_TOOLS,
  AI_HUB_CATEGORIES,
  type AIHubCategory,
} from "@/constants/ai-hub";

const BADGE_COLORS: Record<string, string> = {
  AI: "#3A7BD5",
  New: "#6FCF97",
  Popular: "#E07A5F",
};

export default function AIHubScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const [activeCategory, setActiveCategory] = useState<AIHubCategory | "all">(
    "all",
  );

  const filtered =
    activeCategory === "all"
      ? AI_HUB_TOOLS
      : AI_HUB_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: c.primary,
            paddingTop: insets.top + 14,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>AI Hub</Text>
          <Text style={styles.heroSub}>
            {AI_HUB_TOOLS.length} AI-powered tools · all free
          </Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <MaterialIcons name="psychology" size={22} color="#FFFFFF" />
        </View>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={[styles.pillScroll, { backgroundColor: c.card, borderBottomColor: c.border }]}
      >
        <Pressable
          onPress={() => setActiveCategory("all")}
          style={[
            styles.pill,
            {
              backgroundColor:
                activeCategory === "all" ? c.primary : c.muted,
              borderColor:
                activeCategory === "all" ? c.primary : c.border,
            },
          ]}
        >
          <MaterialIcons
            name="apps"
            size={15}
            color={activeCategory === "all" ? "#FFFFFF" : c.mutedForeground}
          />
          <Text
            style={[
              styles.pillText,
              {
                color: activeCategory === "all" ? "#FFFFFF" : c.mutedForeground,
              },
            ]}
          >
            All ({AI_HUB_TOOLS.length})
          </Text>
        </Pressable>
        {AI_HUB_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          const count = AI_HUB_TOOLS.filter(
            (t) => t.category === cat.id,
          ).length;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? c.primary : c.muted,
                  borderColor: active ? c.primary : c.border,
                },
              ]}
            >
              <MaterialIcons
                name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                size={15}
                color={active ? "#FFFFFF" : c.mutedForeground}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: active ? "#FFFFFF" : c.mutedForeground },
                ]}
              >
                {cat.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((tool) => (
          <Pressable
            key={tool.id}
            onPress={() =>
              router.push(tool.route as Parameters<typeof router.push>[0])
            }
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: tool.color + "22" },
              ]}
            >
              <MaterialIcons
                name={tool.icon as keyof typeof MaterialIcons.glyphMap}
                size={26}
                color={tool.color}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.cardTitleRow}>
                <Text
                  style={[styles.cardTitle, { color: c.foreground }]}
                  numberOfLines={1}
                >
                  {tool.title}
                </Text>
                {tool.badge ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: BADGE_COLORS[tool.badge] + "28" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: BADGE_COLORS[tool.badge] },
                      ]}
                    >
                      {tool.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[styles.cardSub, { color: c.mutedForeground }]}
                numberOfLines={1}
              >
                {tool.subtitle}
              </Text>
              <Text
                style={[styles.cardDesc, { color: c.mutedForeground }]}
                numberOfLines={2}
              >
                {tool.description}
              </Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={14}
              color={c.border}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 3,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  pillScroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: 56,
  },
  pillRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  grid: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    flex: 1,
  },
  cardSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
