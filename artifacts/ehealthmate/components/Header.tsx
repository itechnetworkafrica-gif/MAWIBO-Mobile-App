import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useDrawer } from "@/contexts/DrawerContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  showLogo?: boolean;
  showMenu?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onNotifPress?: () => void;
  notifBadge?: number;
  /** @deprecated use showLogo for home, title for others */
  variant?: "default" | "primary";
}

export function Header({
  title,
  subtitle,
  right,
  showLogo = false,
  showMenu = true,
  showBack = false,
  onBackPress,
  onSearchPress,
  onNotifPress,
  notifBadge = 0,
}: HeaderProps) {
  const c = useColors();
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top + 6;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.card,
          paddingTop: topPad,
          borderBottomColor: c.border,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Left — menu or back */}
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={[styles.iconBtn, { backgroundColor: c.muted }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={c.foreground} />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            onPress={openDrawer}
            hitSlop={10}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            style={[styles.iconBtn, { backgroundColor: c.muted }]}
          >
            <MaterialIcons name="menu" size={22} color={c.foreground} />
          </Pressable>
        ) : null}

        {/* Center — logo or title */}
        {showLogo ? (
          <View style={styles.logoWrap}>
            <View style={[styles.logoIcon, { backgroundColor: c.primary }]}>
              <MaterialIcons name="favorite" size={14} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, { color: c.foreground }]}>MAWIBO</Text>
          </View>
        ) : (
          <View style={styles.titleWrap}>
            {title ? (
              <Text style={[styles.title, { color: c.foreground }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={[styles.subtitle, { color: c.mutedForeground }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}

        {/* Right — actions */}
        <View style={styles.actions}>
          {onSearchPress ? (
            <Pressable
              onPress={onSearchPress}
              hitSlop={8}
              accessibilityLabel="Search"
              style={[styles.iconBtn, { backgroundColor: c.muted }]}
            >
              <MaterialIcons name="search" size={20} color={c.foreground} />
            </Pressable>
          ) : null}

          {onNotifPress ? (
            <Pressable
              onPress={onNotifPress}
              hitSlop={8}
              accessibilityLabel="Notifications"
              style={[styles.iconBtn, { backgroundColor: c.muted }]}
            >
              <MaterialIcons
                name={notifBadge > 0 ? "notifications" : "notifications-none"}
                size={20}
                color={notifBadge > 0 ? c.primary : c.foreground}
              />
              {notifBadge > 0 ? (
                <View style={[styles.badge, { backgroundColor: c.destructive }]}>
                  <Text style={styles.badgeText}>{notifBadge > 9 ? "9+" : String(notifBadge)}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}

          {right ? <View style={styles.rightSlot}>{right}</View> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
  },
  logoWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: 2.5,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#FFFFFF",
    lineHeight: 11,
  },
  rightSlot: { marginLeft: 2 },
});
