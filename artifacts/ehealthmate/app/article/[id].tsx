import React from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { WELLNESS_ARTICLES } from "@/constants/articles";

const CATEGORY_ICONS: Record<string, string> = {
  Anxiety: "self-improvement",
  Sleep: "bedtime",
  Connection: "people",
  Grief: "favorite",
  Breathing: "air",
  Journaling: "edit-note",
  Exercise: "directions-walk",
};

export default function ArticleScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const article = WELLNESS_ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <MaterialIcons name="article" size={40} color={c.mutedForeground} />
          <Text style={[styles.notFoundText, { color: c.mutedForeground }]}>Article not found</Text>
          <Pressable onPress={() => router.back()} style={[styles.backLink, { backgroundColor: c.primarySoft }]}>
            <Text style={[styles.backLinkText, { color: c.primary }]}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `"${article.title}" — Read on MAWIBO`,
      });
    } catch {}
  };

  const progressColor = article.color;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero banner */}
      <View style={[styles.hero, { backgroundColor: article.color, paddingTop: insets.top + 10 }]}>
        <View style={styles.heroTop}>
          <Pressable onPress={() => router.back()} style={styles.heroBack}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={onShare} style={styles.heroShare}>
            <MaterialIcons name="share" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.heroContent}>
          <View style={[styles.categoryBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <MaterialIcons
              name={(CATEGORY_ICONS[article.category] ?? "article") as keyof typeof MaterialIcons.glyphMap}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <View style={styles.hereMeta}>
            <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroMetaText}>{article.readMinutes} min read</Text>
            <View style={styles.heroDot} />
            <MaterialIcons name="auto-awesome" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroMetaText}>Wellness guide</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: progressColor + "15", borderColor: progressColor + "40" }]}>
          <MaterialIcons name="format-quote" size={20} color={progressColor} />
          <Text style={[styles.summaryText, { color: c.foreground }]}>{article.summary}</Text>
        </View>

        {/* Article body */}
        {article.body.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.heading ? (
              <View style={styles.headingRow}>
                <View style={[styles.headingBar, { backgroundColor: progressColor }]} />
                <Text style={[styles.heading, { color: c.foreground }]}>{section.heading}</Text>
              </View>
            ) : null}
            <Text style={[styles.paragraph, { color: section.heading ? c.foreground : c.mutedForeground }]}>
              {section.text}
            </Text>
          </View>
        ))}

        {/* Footer CTA */}
        <View style={[styles.footerCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.footerIcon, { backgroundColor: progressColor + "22" }]}>
            <MaterialIcons
              name={article.icon as keyof typeof MaterialIcons.glyphMap}
              size={24}
              color={progressColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerTitle, { color: c.foreground }]}>Ready to practise?</Text>
            <Text style={[styles.footerSub, { color: c.mutedForeground }]}>
              Open the {article.category} tools in your app to put this into action.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/tools")}
          style={[styles.ctaBtn, { backgroundColor: progressColor }]}
        >
          <MaterialIcons name="open-in-new" size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>Open wellness tools</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  heroBack: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  heroShare: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  heroContent: { gap: 10 },
  categoryBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    alignSelf: "flex-start",
  },
  categoryText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#FFFFFF", letterSpacing: 0.8 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF", lineHeight: 29 },
  hereMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetaText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)" },
  heroDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.6)" },
  content: { padding: 20 },
  summaryCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20,
  },
  summaryText: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 21, flex: 1 },
  section: { marginBottom: 20 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  headingBar: { width: 4, height: 18, borderRadius: 2 },
  heading: { fontFamily: "Inter_700Bold", fontSize: 16, flex: 1 },
  paragraph: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  footerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 14,
  },
  footerIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  footerTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  footerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 3, lineHeight: 17 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    justifyContent: "center", paddingVertical: 16,
    borderRadius: 14,
  },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  backLink: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  backLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
