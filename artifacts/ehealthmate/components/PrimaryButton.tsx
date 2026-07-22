import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useColors } from "@/hooks/useColors";

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconRight?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "md" | "lg";
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth = true,
  size = "md",
  style,
}: PrimaryButtonProps) {
  const c = useColors();

  const palette: Record<
    NonNullable<PrimaryButtonProps["variant"]>,
    { bg: string; fg: string; border?: string }
  > = {
    primary: { bg: c.primary, fg: c.primaryForeground },
    secondary: { bg: c.secondary, fg: c.secondaryForeground },
    ghost: { bg: "transparent", fg: c.primary },
    outline: { bg: "transparent", fg: c.primary, border: c.primary },
    destructive: { bg: c.destructive, fg: c.destructiveForeground },
  };
  const colors = palette[variant];

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === "lg" ? styles.large : styles.medium,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border ?? "transparent",
          borderWidth: colors.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={colors.fg} />
        ) : (
          <>
            {icon ? (
              <MaterialIcons
                name={icon}
                size={size === "lg" ? 22 : 20}
                color={colors.fg}
                style={styles.iconLeft}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                size === "lg" ? styles.labelLg : styles.labelMd,
                { color: colors.fg },
              ]}
            >
              {label}
            </Text>
            {iconRight ? (
              <MaterialIcons
                name={iconRight}
                size={size === "lg" ? 22 : 20}
                color={colors.fg}
                style={styles.iconRight}
              />
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  medium: { paddingVertical: 14, paddingHorizontal: 18 },
  large: { paddingVertical: 18, paddingHorizontal: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  labelMd: { fontSize: 15 },
  labelLg: { fontSize: 17 },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
