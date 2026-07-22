import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { WELLNESS_ARTICLES, type WellnessArticle } from "@/constants/articles";
import { fetchLiveWellnessArticles } from "@/lib/wellnessFeed";

const AUTO_SCROLL_MS = 4200;

export function WellnessCarousel() {
  const c = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 64, 300);
  const ref = useRef<FlatList<WellnessArticle>>(null);
  const [index, setIndex] = useState(0);
  const [liveArticles, setLiveArticles] = useState<WellnessArticle[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchLiveWellnessArticles()
      .then((articles) => { if (mounted) setLiveArticles(articles); })
      .finally(() => { if (mounted) setLiveLoading(false); });
    return () => { mounted = false; };
  }, []);

  const data = useMemo(() => [...liveArticles, ...WELLNESS_ARTICLES], [liveArticles]);

  const startTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % data.length;
        ref.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_MS);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [data.length]);

  const onOpen = (item: WellnessArticle) => {
    if (item.source === "live" && item.link) {
      Linking.openURL(item.link).catch(() => {});
    } else {
      router.push(`/article/${item.id}` as never);
    }
  };

  return (
    <View>
      {liveLoading && liveArticles.length === 0 ? (
        <View style={styles.liveRow}>
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={[styles.liveRowText, { color: c.mutedForeground }]}>Fetching latest Liberia health news…</Text>
        </View>
      ) : liveArticles.length > 0 ? (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveRowText, { color: c.mutedForeground }]}>Live from Liberia &amp; regional health news</Text>
        </View>
      ) : null}
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(a) => a.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        onScrollBeginDrag={() => { if (timer.current) clearInterval(timer.current); }}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 12));
          setIndex(newIndex);
          startTimer();
        }}
        getItemLayout={(_, i) => ({ length: cardWidth + 12, offset: (cardWidth + 12) * i, index: i })}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpen(item)}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth, backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            {/* Colored top strip with icon */}
            <View style={[styles.strip, { backgroundColor: item.color }]}>
              <MaterialIcons
                name={item.icon as keyof typeof MaterialIcons.glyphMap}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.stripCategory}>{item.category.toUpperCase()}</Text>
              <View style={{ flex: 1 }} />
              {item.source === "live" ? (
                <View style={styles.stripBadge}>
                  <MaterialIcons name="podcasts" size={11} color="#FFFFFF" />
                  <Text style={styles.stripBadgeText}>Live</Text>
                </View>
              ) : (
                <View style={styles.stripBadge}>
                  <MaterialIcons name="schedule" size={11} color="#FFFFFF" />
                  <Text style={styles.stripBadgeText}>{item.readMinutes} min</Text>
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.title, { color: c.foreground }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.summary, { color: c.mutedForeground }]} numberOfLines={3}>{item.summary}</Text>
            </View>
            <View style={[styles.readBtn, { backgroundColor: item.color + "18" }]}>
              <Text style={[styles.readBtnText, { color: item.color }]}>
                {item.source === "live" ? "Read full story" : "Read article"}
              </Text>
              <MaterialIcons name={item.source === "live" ? "open-in-new" : "arrow-forward"} size={14} color={item.color} />
            </View>
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {data.map((_, i) => (
          <Pressable key={i} onPress={() => { ref.current?.scrollToIndex({ index: i, animated: true }); setIndex(i); }}>
            <View style={[styles.dot, { backgroundColor: i === index ? c.primary : c.border, width: i === index ? 18 : 6 }]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#27AE60" },
  liveRowText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  card: {
    borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  strip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  stripCategory: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#FFFFFF", letterSpacing: 0.8 },
  stripBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stripBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#FFFFFF" },
  cardBody: { padding: 14, gap: 6 },
  title: { fontFamily: "Inter_700Bold", fontSize: 14, lineHeight: 19 },
  summary: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  readBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 11, marginHorizontal: 14, marginBottom: 12, borderRadius: 10,
  },
  readBtnText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
});
