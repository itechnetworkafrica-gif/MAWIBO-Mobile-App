import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { DOCTORS } from "@/constants/doctors";
import { TOOLS } from "@/constants/tools";
import { WELLNESS_ARTICLES } from "@/constants/articles";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

const QUICK_LINKS: SearchResult[] = [
  {
    id: "ql-ai",
    title: "AI Mate",
    subtitle: "Chat with your wellness companion",
    icon: "forum",
    color: "#3A7BD5",
    route: "/(tabs)/ai-mate",
  },
  {
    id: "ql-breathing",
    title: "Box breathing",
    subtitle: "Calm your nervous system",
    icon: "air",
    color: "#5C97E0",
    route: "/breathing",
  },
  {
    id: "ql-journal",
    title: "Journal",
    subtitle: "Write and reflect",
    icon: "edit-note",
    color: "#E0A800",
    route: "/journal",
  },
  {
    id: "ql-smart-match",
    title: "Smart match",
    subtitle: "Find the right doctor for your symptoms",
    icon: "auto-awesome",
    color: "#7C5DB8",
    route: "/smart-match",
  },
  {
    id: "ql-mood",
    title: "Mood insights",
    subtitle: "View your mood patterns",
    icon: "insights",
    color: "#6FCF97",
    route: "/mood-insights",
  },
  {
    id: "ql-support",
    title: "Emergency support",
    subtitle: "Helplines and emergency contacts",
    icon: "support-agent",
    color: "#E03E3E",
    route: "/(tabs)/support",
  },
  {
    id: "ql-checkin",
    title: "Daily check-in",
    subtitle: "A short reflection",
    icon: "check-circle",
    color: "#3A7BD5",
    route: "/daily-checkin",
  },
  {
    id: "ql-symptom",
    title: "Symptom check",
    subtitle: "Understand what you may be feeling",
    icon: "health-and-safety",
    color: "#5C97E0",
    route: "/symptom-check",
  },
];

function buildSearchIndex(): SearchResult[] {
  const doctorResults: SearchResult[] = DOCTORS.slice(0, 28).map((d) => ({
    id: `doc-${d.id}`,
    title: `Dr. ${d.name}`,
    subtitle: `${d.specialty} · ${d.county}`,
    icon: "medical-services",
    color: "#6FCF97",
    route: `/doctor/${d.id}`,
  }));

  const toolResults: SearchResult[] = TOOLS.map((t) => ({
    id: `tool-${t.id}`,
    title: t.title,
    subtitle: t.subtitle,
    icon: t.icon,
    color: t.color,
    route: t.route,
  }));

  const articleResults: SearchResult[] = WELLNESS_ARTICLES.map((a) => ({
    id: `art-${a.id}`,
    title: a.title,
    subtitle: `${a.category} · ${a.readMinutes} min read`,
    icon: a.icon,
    color: a.color,
    route: "/(tabs)/index",
  }));

  return [...QUICK_LINKS, ...toolResults, ...doctorResults, ...articleResults];
}

const ALL_RESULTS = buildSearchIndex();

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ visible, onClose }: Props) {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_LINKS;
    return ALL_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [query]);

  const handleSelect = (route: string) => {
    onClose();
    setQuery("");
    setTimeout(() => router.push(route as Parameters<typeof router.push>[0]), 80);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: c.overlay }]}
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: c.card,
              marginTop: insets.top + 12,
            },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              { backgroundColor: c.muted, borderColor: c.border },
            ]}
          >
            <MaterialIcons name="search" size={20} color={c.mutedForeground} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search doctors, tools, articles..."
              placeholderTextColor={c.mutedForeground}
              style={[styles.searchInput, { color: c.foreground }]}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={c.mutedForeground}
                />
              </Pressable>
            ) : null}
          </View>

          <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
            {query.length === 0
              ? "Quick links"
              : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {results.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => handleSelect(r.route)}
                style={({ pressed }) => [
                  styles.resultRow,
                  { borderBottomColor: c.border, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: r.color + "22" },
                  ]}
                >
                  <MaterialIcons
                    name={r.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={r.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.resultTitle, { color: c.foreground }]}
                    numberOfLines={1}
                  >
                    {r.title}
                  </Text>
                  <Text
                    style={[styles.resultSub, { color: c.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {r.subtitle}
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={14}
                  color={c.border}
                />
              </Pressable>
            ))}
            {results.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons
                  name="search-off"
                  size={32}
                  color={c.mutedForeground}
                />
                <Text style={[styles.emptyText, { color: c.mutedForeground }]}>
                  No results for "{query}"
                </Text>
              </View>
            ) : null}
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    marginHorizontal: 12,
    borderRadius: 20,
    maxHeight: "82%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    padding: 0,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 58,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  resultSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
