import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { STRESS_TIPS } from "@/constants/insights";

export default function StressTipsScreen() {
  const c = useColors();
  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Stress tips" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: c.mutedForeground }]}>
          Quick coping ideas you can use anywhere. Try one when stress feels
          heavy.
        </Text>
        <View style={{ height: 14 }} />
        <View style={{ gap: 12 }}>
          {STRESS_TIPS.map((t, i) => (
            <Card key={i}>
              <View style={styles.row}>
                <View
                  style={[styles.numWrap, { backgroundColor: c.primarySoft }]}
                >
                  <Text style={[styles.num, { color: c.primary }]}>
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: c.foreground }]}>
                    {t.title}
                  </Text>
                  <Text style={[styles.body, { color: c.mutedForeground }]}>
                    {t.body}
                  </Text>
                </View>
                <MaterialIcons
                  name="tips-and-updates"
                  size={20}
                  color={c.secondaryForeground}
                />
              </View>
            </Card>
          ))}
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
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  numWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { fontFamily: "Inter_700Bold", fontSize: 14 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
