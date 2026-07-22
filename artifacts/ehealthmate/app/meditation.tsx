import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { MEDITATIONS } from "@/constants/insights";

export default function MeditationScreen() {
  const c = useColors();
  const [openId, setOpenId] = useState<string | null>(MEDITATIONS[0]?.id ?? null);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Meditation" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: c.mutedForeground }]}>
          Find a quiet spot. Read each guide slowly, then close your eyes and
          follow it at your own pace.
        </Text>
        <View style={{ height: 14 }} />
        <View style={{ gap: 12 }}>
          {MEDITATIONS.map((m) => {
            const open = openId === m.id;
            return (
              <Card key={m.id} padded={false}>
                <Pressable
                  onPress={() => setOpenId(open ? null : m.id)}
                  style={styles.row}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: c.primarySoft },
                    ]}
                  >
                    <MaterialIcons
                      name="self-improvement"
                      size={22}
                      color={c.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: c.foreground }]}>
                      {m.title}
                    </Text>
                    <Text style={[styles.duration, { color: c.mutedForeground }]}>
                      {m.duration}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={open ? "expand-less" : "expand-more"}
                    size={24}
                    color={c.mutedForeground}
                  />
                </Pressable>
                {open ? (
                  <View style={[styles.body, { borderTopColor: c.border }]}>
                    <Text style={[styles.bodyText, { color: c.foreground }]}>
                      {m.description}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  intro: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  duration: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
