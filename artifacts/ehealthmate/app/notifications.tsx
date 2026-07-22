import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useNotifications, type AppNotification } from "@/contexts/NotificationsContext";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function NotifCard({ notif, onPress }: { notif: AppNotification; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: notif.read ? c.card : c.primarySoft,
          borderColor: notif.read ? c.border : c.primary + "40",
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: notif.color + "22" }]}>
        <MaterialIcons
          name={notif.icon as keyof typeof MaterialIcons.glyphMap}
          size={22}
          color={notif.color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: c.foreground }]} numberOfLines={1}>
            {notif.title}
          </Text>
          {!notif.read ? <View style={[styles.unreadDot, { backgroundColor: c.primary }]} /> : null}
        </View>
        <Text style={[styles.body, { color: c.mutedForeground }]} numberOfLines={2}>
          {notif.body}
        </Text>
        <Text style={[styles.time, { color: c.mutedForeground }]}>{timeAgo(notif.ts)}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markRead, markAllRead, clearAll } = useNotifications();

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  React.useEffect(() => {
    markAllRead();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerRight: () => (
            <Pressable onPress={clearAll} hitSlop={10} style={{ marginRight: 4 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: c.mutedForeground }}>
                Clear all
              </Text>
            </Pressable>
          ),
        }}
      />

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}>
            <MaterialIcons name="notifications-none" size={36} color={c.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.foreground }]}>All caught up</Text>
          <Text style={[styles.emptyBody, { color: c.mutedForeground }]}>
            New likes, comments, and updates will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {unread.length > 0 ? (
            <>
              <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>New</Text>
              {unread.map((n) => (
                <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />
              ))}
            </>
          ) : null}

          {read.length > 0 ? (
            <>
              <Text style={[styles.groupLabel, { color: c.mutedForeground, marginTop: unread.length > 0 ? 8 : 0 }]}>Earlier</Text>
              {read.map((n) => (
                <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />
              ))}
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 8 },
  groupLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  title: { fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 },
  body: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  time: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  emptyBody: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
