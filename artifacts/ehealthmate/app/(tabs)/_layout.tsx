import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { communityUnreadCount } = useNotifications();

  const tabBarHeight = isWeb ? 84 : 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginBottom: Platform.OS === "android" ? 4 : 0,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === "android" ? 2 : 0,
        },
        tabBarBackground: () =>
          isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-mate"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="forum" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="book-doctor"
        options={{
          title: "Book",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="medical-services"
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarBadge: communityUnreadCount > 0 ? communityUnreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="spa" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
