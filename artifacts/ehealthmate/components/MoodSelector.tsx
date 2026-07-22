import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { MOODS, type Mood } from "@/constants/moods";
import { useColors } from "@/hooks/useColors";

interface MoodSelectorProps {
  selected: Mood["id"] | null;
  onSelect: (id: Mood["id"]) => void;
  compact?: boolean;
}

export function MoodSelector({
  selected,
  onSelect,
  compact = false,
}: MoodSelectorProps) {
  const c = useColors();
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const active = selected === mood.id;
        return (
          <Pressable
            key={mood.id}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.selectionAsync().catch(() => {});
              }
              onSelect(mood.id);
            }}
            style={({ pressed }) => [
              styles.pill,
              compact && styles.pillCompact,
              {
                backgroundColor: active ? mood.color : c.card,
                borderColor: active ? mood.color : c.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <MaterialIcons
              name={mood.icon as keyof typeof MaterialIcons.glyphMap}
              size={compact ? 22 : 26}
              color={active ? "#FFFFFF" : c.foreground}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: active ? "#FFFFFF" : c.foreground,
                  fontSize: compact ? 11 : 12,
                },
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  pill: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pillCompact: {
    paddingVertical: 10,
  },
  label: {
    fontFamily: "Inter_500Medium",
  },
});
