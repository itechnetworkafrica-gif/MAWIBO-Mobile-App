import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotifType = "like" | "comment" | "community" | "system" | "appointment";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  icon: string;
  color: string;
  ts: number;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  communityUnreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "ts" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "mawibo_notifications_v1";

const SEED_NOTIFS: AppNotification[] = [
  {
    id: "seed_like_1",
    type: "like",
    title: "Fatu K. liked your post",
    body: "Your post about managing anxiety got 3 likes from community members.",
    icon: "favorite",
    color: "#E07A5F",
    ts: Date.now() - 1800000,
    read: false,
  },
  {
    id: "seed_comment_1",
    type: "comment",
    title: "Moses replied to your post",
    body: '"That breathing technique really helped me too — thank you for sharing!"',
    icon: "chat-bubble",
    color: "#3A7BD5",
    ts: Date.now() - 3600000,
    read: false,
  },
  {
    id: "seed_like_2",
    type: "like",
    title: "Comfort W. liked your reply",
    body: "Your reply in the Sleep thread is getting noticed.",
    icon: "favorite",
    color: "#E07A5F",
    ts: Date.now() - 7200000,
    read: false,
  },
  {
    id: "seed_community_1",
    type: "community",
    title: "New post in your feed",
    body: "Amara shared a new recovery tip in the community.",
    icon: "people",
    color: "#27AE60",
    ts: Date.now() - 86400000,
    read: true,
  },
  {
    id: "seed_system_1",
    type: "system",
    title: "Welcome to MAWIBO",
    body: "Your wellness journey starts here. Check in daily for insights.",
    icon: "favorite",
    color: "#7C5DB8",
    ts: Date.now() - 172800000,
    read: true,
  },
];

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppNotification[];
          setNotifications(parsed);
        } else {
          setNotifications(SEED_NOTIFS);
        }
      })
      .catch(() => setNotifications(SEED_NOTIFS))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)).catch(() => {});
  }, [notifications, loaded]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "ts" | "read">) => {
      const notif: AppNotification = {
        ...n,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        ts: Date.now(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const communityUnreadCount = notifications.filter(
    (n) => !n.read && (n.type === "like" || n.type === "comment" || n.type === "community"),
  ).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        communityUnreadCount,
        addNotification,
        markAllRead,
        markRead,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
