import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppointments, type Appointment } from "@/contexts/AppointmentsContext";
import { timeFromString } from "@/lib/dateUtils";

export default function AppointmentsScreen() {
  const c = useColors();
  const router = useRouter();
  const { upcoming, past, cancel } = useAppointments();

  const onCancel = (a: Appointment) => {
    Alert.alert(
      "Cancel appointment?",
      `Cancel your appointment with ${a.doctorName}?`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel it",
          style: "destructive",
          onPress: () => cancel(a.id),
        },
      ],
    );
  };

  const renderItem = (a: Appointment, allowCancel: boolean) => {
    const cancelled = a.status === "cancelled";
    return (
      <Card key={a.id}>
        <View style={styles.row}>
          <View style={[styles.dateBox, { backgroundColor: c.primarySoft }]}>
            <Text style={[styles.dateMonth, { color: c.primary }]}>
              {new Date(a.date).toLocaleString("en", { month: "short" })}
            </Text>
            <Text style={[styles.dateDay, { color: c.primary }]}>
              {new Date(a.date).getDate()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
              {a.doctorName}
            </Text>
            <Text style={[styles.meta, { color: c.mutedForeground }]} numberOfLines={1}>
              {a.specialty} · {a.facility}
            </Text>
            <Text style={[styles.meta, { color: c.mutedForeground }]} numberOfLines={1}>
              {a.county}
            </Text>
            <View style={styles.statusRow}>
              <MaterialIcons
                name={cancelled ? "cancel" : "schedule"}
                size={14}
                color={cancelled ? c.destructive : c.primary}
              />
              <Text
                style={{
                  color: cancelled ? c.destructive : c.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                {cancelled
                  ? "Cancelled"
                  : `${timeFromString(a.time)} on ${a.date}`}
              </Text>
            </View>
          </View>
        </View>
        {allowCancel && !cancelled ? (
          <View style={{ height: 12 }} />
        ) : null}
        {allowCancel && !cancelled ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="View doctor"
                variant="outline"
                icon="person"
                onPress={() => router.push(`/doctor/${a.doctorId}`)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Cancel"
                variant="ghost"
                icon="close"
                onPress={() => onCancel(a)}
              />
            </View>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Your appointments" }} />
      <ScrollView contentContainerStyle={styles.content}>
        {upcoming.length === 0 && past.length === 0 ? (
          <EmptyState
            icon="event-available"
            title="No appointments yet"
            message="Book your first appointment with a doctor in your county."
            action={
              <PrimaryButton
                label="Find a doctor"
                icon="medical-services"
                onPress={() => router.replace("/(tabs)/book-doctor")}
              />
            }
          />
        ) : (
          <>
            {upcoming.length > 0 ? (
              <View>
                <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                  Upcoming
                </Text>
                <View style={{ gap: 12 }}>
                  {upcoming.map((a) => renderItem(a, true))}
                </View>
              </View>
            ) : null}
            {past.length > 0 ? (
              <View style={{ marginTop: 22 }}>
                <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                  Past & cancelled
                </Text>
                <View style={{ gap: 12 }}>
                  {past.map((a) => renderItem(a, false))}
                </View>
              </View>
            ) : null}
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  dateBox: {
    width: 56,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
  },
  dateDay: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
});
