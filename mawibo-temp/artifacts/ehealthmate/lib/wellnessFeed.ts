import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WellnessArticle } from "@/constants/articles";

const FEED_QUERY = "Liberia mental health OR Liberia wellbeing OR West Africa mental health";
const RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(FEED_QUERY)}&hl=en-US&gl=US&ceid=US:en`;
const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

const CACHE_KEY = "mawibo_live_wellness_feed_v1";
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

const CATEGORY_ROTATION: { icon: string; color: string }[] = [
  { icon: "public", color: "#3A7BD5" },
  { icon: "favorite", color: "#E07A5F" },
  { icon: "self-improvement", color: "#7C5DB8" },
  { icon: "groups", color: "#27AE60" },
  { icon: "health-and-safety", color: "#0891B2" },
];

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  categories?: string[];
}

interface RssResponse {
  status?: string;
  items?: RssItem[];
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function toArticle(item: RssItem, index: number): WellnessArticle | null {
  if (!item.title) return null;
  const summary = stripHtml(item.description ?? "").slice(0, 220);
  const rotation = CATEGORY_ROTATION[index % CATEGORY_ROTATION.length];
  return {
    id: `live_${index}_${(item.link ?? item.title).slice(0, 40).replace(/[^a-zA-Z0-9]/g, "")}`,
    title: stripHtml(item.title),
    category: "Liberia news",
    summary: summary || "Tap to read the full story from the source.",
    icon: rotation.icon,
    color: rotation.color,
    readMinutes: estimateReadMinutes(summary),
    body: [],
    source: "live",
    link: item.link,
    publishedAt: item.pubDate,
  };
}

interface CachedFeed {
  ts: number;
  articles: WellnessArticle[];
}

/**
 * Fetches Liberia-relevant mental health news via a public RSS-to-JSON proxy
 * (Google News search RSS). Falls back to a short-lived AsyncStorage cache,
 * and returns an empty array (never throws) if the network is unavailable —
 * callers should merge this with curated static content.
 */
export async function fetchLiveWellnessArticles(): Promise<WellnessArticle[]> {
  try {
    const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as CachedFeed;
      if (Date.now() - cached.ts < CACHE_TTL_MS && cached.articles.length > 0) {
        return cached.articles;
      }
    }
  } catch {
    // ignore cache errors, fall through to network
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(PROXY_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const json = (await res.json()) as RssResponse;
    if (json.status !== "ok" || !json.items) return [];

    const articles = json.items
      .slice(0, 8)
      .map((item, i) => toArticle(item, i))
      .filter((a): a is WellnessArticle => a !== null);

    if (articles.length > 0) {
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), articles } satisfies CachedFeed)).catch(() => {});
    }
    return articles;
  } catch {
    return [];
  }
}
