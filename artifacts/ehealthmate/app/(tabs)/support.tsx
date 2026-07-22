import React, { useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { SUPPORT_CONTACTS, type SupportContact } from "@/constants/support";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";

const TYPE_LABELS: Record<SupportContact["type"], string> = {
  emergency: "Emergency",
  ngo: "Support organisations",
  clinic: "Hospitals & clinics",
};

export default function SupportScreen() {
  const c = useColors();
  const bottomPad = useBottomTabPadding(12);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<SupportContact["type"], SupportContact[]> = {
      emergency: [],
      ngo: [],
      clinic: [],
    };
    SUPPORT_CONTACTS.forEach((s) => map[s.type].push(s));
    return map;
  }, []);

  const callNumber = async (item: SupportContact) => {
    setPendingId(item.id);
    try {
      const url = `tel:${item.phone.replace(/[^+0-9]/g, "")}`;
      if (Platform.OS === "web") {
        window.location.href = url;
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Header
        title="Support"
        subtitle="Help is closer than you think"
        variant="primary"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.crisisBox,
            { backgroundColor: c.destructiveSoft, borderColor: c.destructive },
          ]}
        >
          <MaterialIcons name="emergency" size={26} color={c.destructive} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.crisisTitle, { color: c.destructive }]}>
              In an emergency
            </Text>
            <Text style={[styles.crisisBody, { color: c.foreground }]}>
              If you or someone is in immediate danger, call 911 or visit the
              nearest hospital. You are not alone.
            </Text>
          </View>
        </View>

        {(["emergency", "ngo", "clinic"] as const).map((type) => (
          <View key={type} style={{ marginTop: 18 }}>
            <SectionHeader title={TYPE_LABELS[type]} />
            <Card padded={false}>
              {grouped[type].map((item, i) => (
                <View key={item.id}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor:
                            type === "emergency"
                              ? c.destructiveSoft
                              : type === "ngo"
                                ? c.secondarySoft
                                : c.primarySoft,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon as keyof typeof MaterialIcons.glyphMap}
                        size={22}
                        color={
                          type === "emergency"
                            ? c.destructive
                            : type === "ngo"
                              ? c.secondaryForeground
                              : c.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.rowName, { color: c.foreground }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.rowMeta, { color: c.mutedForeground }]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                      <Text
                        style={[styles.rowPhone, { color: c.primary }]}
                        numberOfLines={1}
                      >
                        {item.phone}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => callNumber(item)}
                      disabled={pendingId === item.id}
                      style={({ pressed }) => [
                        styles.callBtn,
                        {
                          backgroundColor:
                            type === "emergency" ? c.destructive : c.primary,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <MaterialIcons name="call" size={18} color="#FFFFFF" />
                      <Text style={styles.callBtnText}>Call</Text>
                    </Pressable>
                  </View>
                  {i < grouped[type].length - 1 ? (
                    <View
                      style={[styles.divider, { backgroundColor: c.border }]}
                    />
                  ) : null}
                </View>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: 24 }} />
        <Card>
          <Text style={[styles.disclaimerTitle, { color: c.foreground }]}>
            Privacy & safety
          </Text>
          <Text style={[styles.disclaimerBody, { color: c.mutedForeground }]}>
            MAWIBO stores your conversations only on this device. Nothing
            you write here is shared with anyone else. The AI Mate is a
            companion, not a doctor — please reach out to a professional for
            medical advice.
          </Text>
        </Card>

        <View style={{ height: bottomPad }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  crisisBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  crisisTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  crisisBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
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
  rowName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  rowMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  rowPhone: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 4,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  disclaimerTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  disclaimerBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
});
