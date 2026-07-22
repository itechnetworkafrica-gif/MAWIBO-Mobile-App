import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DOCTORS } from "@/constants/doctors";
import { getCountyName } from "@/constants/counties";
import { getSpecialtyName } from "@/constants/specialties";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { formatDateISO, formatDateShort, timeFromString } from "@/lib/dateUtils";

export default function DoctorScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { book } = useAppointments();
  const doctor = useMemo(() => DOCTORS.find((d) => d.id === id), [id]);

  const dayDates = useMemo(() => {
    const out: { date: Date; label: string; iso: string; weekday: string }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]!;
      out.push({
        date: d,
        label: formatDateShort(d),
        iso: formatDateISO(d),
        weekday: wd,
      });
    }
    return out;
  }, []);

  const availableDates = useMemo(() => {
    if (!doctor) return [];
    return dayDates.filter((d) => doctor.availableDays.includes(d.weekday));
  }, [doctor, dayDates]);

  const [selectedDate, setSelectedDate] = useState<string | null>(
    availableDates[0]?.iso ?? null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!doctor) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <Stack.Screen options={{ title: "Doctor" }} />
        <View style={styles.notFound}>
          <Text style={{ color: c.foreground }}>Doctor not found.</Text>
        </View>
      </View>
    );
  }

  const onConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    setConfirming(true);
    const appointment = book({
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: getSpecialtyName(doctor.specialty),
      facility: doctor.facility,
      county: getCountyName(doctor.county),
      date: selectedDate,
      time: selectedTime,
    });
    setConfirming(false);
    Alert.alert(
      "Appointment booked",
      `Your appointment with ${doctor.name} is set for ${appointment.date} at ${timeFromString(appointment.time)}.`,
      [
        {
          text: "View appointments",
          onPress: () => router.replace("/appointments"),
        },
        { text: "Done", style: "cancel", onPress: () => router.back() },
      ],
    );
  };

  const callDoctor = () => {
    Linking.openURL(`tel:${doctor.phone.replace(/\s/g, "")}`).catch(() => {});
  };
  const emailDoctor = () => {
    Linking.openURL(`mailto:${doctor.email}`).catch(() => {});
  };
  const openMaps = () => {
    const q = encodeURIComponent(
      `${doctor.facility}, ${doctor.hospitalAddress}`,
    );
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: doctor.name,
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: "#FFFFFF",
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: c.primary }]}>
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <MaterialIcons name="medical-services" size={32} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: "#FFFFFF" }]}>
                {doctor.name}
              </Text>
              <Text style={[styles.title, { color: "rgba(255,255,255,0.85)" }]}>
                {doctor.title} · {getSpecialtyName(doctor.specialty)}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFE082" />
                <Text style={[styles.ratingText, { color: "#FFFFFF" }]}>
                  {doctor.rating.toFixed(1)}
                </Text>
                <Text
                  style={[styles.metaText, { color: "rgba(255,255,255,0.85)" }]}
                >
                  {`  · ${doctor.reviews} reviews · ${doctor.yearsExperience} yrs`}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {doctor.patientsServed.toLocaleString()}
              </Text>
              <Text style={styles.heroStatLabel}>Patients served</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {doctor.consultationFee === 0
                  ? "Free"
                  : `USD ${doctor.consultationFee}`}
              </Text>
              <Text style={styles.heroStatLabel}>Consultation</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {doctor.languages.length}
              </Text>
              <Text style={styles.heroStatLabel}>Languages</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.quickActionsRow}>
          <Pressable
            onPress={callDoctor}
            style={[
              styles.quickAction,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <MaterialIcons name="call" size={22} color={c.primary} />
            <Text style={[styles.quickActionLabel, { color: c.foreground }]}>
              Call
            </Text>
          </Pressable>
          <Pressable
            onPress={emailDoctor}
            style={[
              styles.quickAction,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <MaterialIcons name="email" size={22} color={c.primary} />
            <Text style={[styles.quickActionLabel, { color: c.foreground }]}>
              Email
            </Text>
          </Pressable>
          <Pressable
            onPress={openMaps}
            style={[
              styles.quickAction,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <MaterialIcons name="directions" size={22} color={c.primary} />
            <Text style={[styles.quickActionLabel, { color: c.foreground }]}>
              Directions
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.badgesRow}>
          {doctor.telehealth ? (
            <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
              <MaterialIcons name="videocam" size={14} color={c.primary} />
              <Text style={[styles.badgeText, { color: c.primary }]}>
                Telehealth available
              </Text>
            </View>
          ) : null}
          {doctor.acceptsInsurance ? (
            <View style={[styles.badge, { backgroundColor: c.secondarySoft }]}>
              <MaterialIcons
                name="verified-user"
                size={14}
                color={c.secondaryForeground}
              />
              <Text
                style={[styles.badgeText, { color: c.secondaryForeground }]}
              >
                Insurance accepted
              </Text>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: c.muted }]}>
            <MaterialIcons name="person" size={14} color={c.mutedForeground} />
            <Text style={[styles.badgeText, { color: c.foreground }]}>
              {doctor.gender === "F" ? "Female" : "Male"}
            </Text>
          </View>
        </View>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={[styles.sectionLabel, { color: c.foreground }]}>
            About
          </Text>
          <Text style={[styles.bio, { color: c.mutedForeground }]}>
            {doctor.bio}
          </Text>
        </Card>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={[styles.sectionLabel, { color: c.foreground }]}>
            Contact & location
          </Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="local-hospital" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>
                Hospital
              </Text>
              <Text style={[styles.detailValue, { color: c.foreground }]}>
                {doctor.facility}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>
                Address
              </Text>
              <Text style={[styles.detailValue, { color: c.foreground }]}>
                {doctor.hospitalAddress}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="call" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>
                Phone
              </Text>
              <Text style={[styles.detailValue, { color: c.foreground }]}>
                {doctor.phone}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>
                Email
              </Text>
              <Text style={[styles.detailValue, { color: c.foreground }]}>
                {doctor.email}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="translate" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: c.mutedForeground }]}>
                Languages
              </Text>
              <Text style={[styles.detailValue, { color: c.foreground }]}>
                {doctor.languages.join(", ")}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={[styles.sectionLabel, { color: c.foreground }]}>
            Education
          </Text>
          {doctor.education.map((e, i) => (
            <View key={i} style={styles.bulletRow}>
              <MaterialIcons name="school" size={16} color={c.primary} />
              <Text style={[styles.bulletText, { color: c.foreground }]}>
                {e}
              </Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 14 }} />

        <Card>
          <Text style={[styles.sectionLabel, { color: c.foreground }]}>
            Certifications
          </Text>
          {doctor.certifications.map((cert, i) => (
            <View key={i} style={styles.bulletRow}>
              <MaterialIcons name="workspace-premium" size={16} color={c.primary} />
              <Text style={[styles.bulletText, { color: c.foreground }]}>
                {cert}
              </Text>
            </View>
          ))}
        </Card>

        {doctor.awards && doctor.awards.length > 0 ? (
          <>
            <View style={{ height: 14 }} />
            <Card>
              <Text style={[styles.sectionLabel, { color: c.foreground }]}>
                Awards & recognition
              </Text>
              {doctor.awards.map((a, i) => (
                <View key={i} style={styles.bulletRow}>
                  <MaterialIcons
                    name="emoji-events"
                    size={16}
                    color="#F2C94C"
                  />
                  <Text style={[styles.bulletText, { color: c.foreground }]}>
                    {a}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <View style={{ height: 18 }} />

        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          Pick a date
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {availableDates.map((d) => {
            const active = selectedDate === d.iso;
            return (
              <Pressable
                key={d.iso}
                onPress={() => setSelectedDate(d.iso)}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: active ? c.primary : c.card,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dateWeekday,
                    {
                      color: active ? c.primaryForeground : c.mutedForeground,
                    },
                  ]}
                >
                  {d.weekday}
                </Text>
                <Text
                  style={[
                    styles.dateDay,
                    { color: active ? c.primaryForeground : c.foreground },
                  ]}
                >
                  {d.date.getDate()}
                </Text>
              </Pressable>
            );
          })}
          {availableDates.length === 0 ? (
            <Text style={{ color: c.mutedForeground, padding: 12 }}>
              No upcoming availability.
            </Text>
          ) : null}
        </ScrollView>

        <View style={{ height: 18 }} />

        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          Pick a time
        </Text>
        <View style={styles.slotsGrid}>
          {doctor.availableSlots.map((slot) => {
            const active = selectedTime === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[
                  styles.slot,
                  {
                    backgroundColor: active ? c.primary : c.card,
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    { color: active ? c.primaryForeground : c.foreground },
                  ]}
                >
                  {timeFromString(slot)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
        <PrimaryButton
          label="Confirm appointment"
          icon="check"
          onPress={onConfirm}
          disabled={!selectedDate || !selectedTime}
          loading={confirming}
        />
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  headerRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 3,
  },
  ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  heroStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  quickActionsRow: { flexDirection: "row", gap: 8 },
  quickAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 4,
  },
  quickActionLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 10,
  },
  bio: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  detailRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  detailValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
    alignItems: "flex-start",
  },
  bulletText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  dateRow: { gap: 8, paddingVertical: 4 },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 56,
  },
  dateWeekday: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginBottom: 2,
  },
  dateDay: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  slotText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
