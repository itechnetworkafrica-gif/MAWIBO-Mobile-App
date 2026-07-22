import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Doctor } from "@/constants/doctors";
import { getCountyName } from "@/constants/counties";

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: `${c.primary}1F` }]}>
          <MaterialIcons name="medical-services" size={26} color={c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text
            style={[styles.specialty, { color: c.mutedForeground }]}
            numberOfLines={1}
          >
            {doctor.title} · {doctor.specialty.replace("-", " ")}
          </Text>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={c.mutedForeground}
            />
            <Text
              style={[styles.meta, { color: c.mutedForeground }]}
              numberOfLines={1}
            >
              {doctor.facility} · {getCountyName(doctor.county)}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
      </View>

      <View style={styles.badgesRow}>
        <View style={[styles.badge, { backgroundColor: c.muted }]}>
          <MaterialIcons name="star" size={12} color="#F2C94C" />
          <Text style={[styles.badgeText, { color: c.foreground }]}>
            {doctor.rating.toFixed(1)} ({doctor.reviews})
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: c.muted }]}>
          <MaterialIcons
            name="work-history"
            size={12}
            color={c.mutedForeground}
          />
          <Text style={[styles.badgeText, { color: c.foreground }]}>
            {doctor.yearsExperience} yrs
          </Text>
        </View>
        {doctor.telehealth ? (
          <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
            <MaterialIcons name="videocam" size={12} color={c.primary} />
            <Text style={[styles.badgeText, { color: c.primary }]}>
              Telehealth
            </Text>
          </View>
        ) : null}
        {doctor.acceptsInsurance ? (
          <View style={[styles.badge, { backgroundColor: c.secondarySoft }]}>
            <MaterialIcons
              name="verified-user"
              size={12}
              color={c.secondaryForeground}
            />
            <Text
              style={[styles.badgeText, { color: c.secondaryForeground }]}
            >
              Insurance
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.langs, { color: c.mutedForeground }]} numberOfLines={1}>
          Speaks {doctor.languages.join(", ")}
        </Text>
        <Text style={[styles.fee, { color: c.primary }]}>
          {doctor.consultationFee === 0
            ? "Free clinic"
            : `USD ${doctor.consultationFee}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  specialty: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  meta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  langs: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 },
  fee: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
