import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { Header } from "@/components/Header";
import { DoctorCard } from "@/components/DoctorCard";
import { Pill } from "@/components/Pill";
import { EmptyState } from "@/components/EmptyState";
import { COUNTIES } from "@/constants/counties";
import { SPECIALTIES } from "@/constants/specialties";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useDoctors } from "@/contexts/DoctorsContext";

type ModalKind = "county" | "specialty" | null;

export default function BookDoctorScreen() {
  const c = useColors();
  const router = useRouter();
  const { profile } = useApp();
  const { upcoming } = useAppointments();
  const { allDoctors } = useDoctors();
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState<string | null>(profile.county);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);

  const filtered = useMemo(() => {
    return allDoctors.filter((d) => {
      if (county && d.county !== county) return false;
      if (specialty && d.specialty !== specialty) return false;
      if (telehealthOnly && !d.telehealth) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${d.name} ${d.facility} ${d.specialty}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [county, specialty, telehealthOnly, search]);

  const countyName = county
    ? COUNTIES.find((c2) => c2.id === county)?.name ?? "All counties"
    : "All counties";
  const specialtyName = specialty
    ? SPECIALTIES.find((s) => s.id === specialty)?.name ?? "All specialties"
    : "All specialties";

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Header
        title="Book a doctor"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "result" : "results"} in Liberia`}
        variant="primary"
        right={
          upcoming.length > 0 ? (
            <Pressable
              onPress={() => router.push("/appointments")}
              hitSlop={8}
              style={styles.iconBtnPrimary}
            >
              <MaterialIcons name="event" size={20} color="#FFFFFF" />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.searchWrap}>
        <View
          style={[
            styles.search,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={c.mutedForeground}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search doctor, clinic, condition"
            placeholderTextColor={c.mutedForeground}
            style={[styles.searchInput, { color: c.foreground }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={c.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/smart-match")}
        style={[styles.smartMatch, { backgroundColor: c.primarySoft }]}
      >
        <MaterialIcons name="auto-awesome" size={20} color={c.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.smartTitle, { color: c.primary }]}>
            Not sure who to see?
          </Text>
          <Text style={[styles.smartBody, { color: c.foreground }]}>
            Smart Match suggests the right specialist based on your symptoms.
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={c.primary} />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <Pill
          label={countyName}
          active={Boolean(county)}
          onPress={() => setModal("county")}
        />
        <Pill
          label={specialtyName}
          active={Boolean(specialty)}
          onPress={() => setModal("specialty")}
        />
        <Pill
          label="Telehealth"
          active={telehealthOnly}
          onPress={() => setTelehealthOnly((v) => !v)}
        />
        {(county || specialty || telehealthOnly) && (
          <Pill
            label="Clear filters"
            onPress={() => {
              setCounty(null);
              setSpecialty(null);
              setTelehealthOnly(false);
            }}
          />
        )}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/doctor/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-off"
            title="No matching doctors"
            message="Try clearing filters or searching by clinic name."
          />
        }
      />

      <Modal
        visible={modal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: c.overlay }]}
          onPress={() => setModal(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalSheet,
              { backgroundColor: c.background },
            ]}
          >
            <View style={styles.modalHandle}>
              <View
                style={[styles.handleBar, { backgroundColor: c.border }]}
              />
            </View>
            <Text style={[styles.modalTitle, { color: c.foreground }]}>
              {modal === "county" ? "Choose county" : "Choose specialty"}
            </Text>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Pressable
                onPress={() => {
                  if (modal === "county") setCounty(null);
                  else setSpecialty(null);
                  setModal(null);
                }}
                style={[styles.modalRow, { borderBottomColor: c.border }]}
              >
                <Text style={[styles.modalRowText, { color: c.foreground }]}>
                  {modal === "county" ? "All counties" : "All specialties"}
                </Text>
                {!(modal === "county" ? county : specialty) ? (
                  <MaterialIcons name="check" size={20} color={c.primary} />
                ) : null}
              </Pressable>
              {(modal === "county" ? COUNTIES : SPECIALTIES).map((item) => {
                const active =
                  modal === "county" ? county === item.id : specialty === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      if (modal === "county") setCounty(item.id);
                      else setSpecialty(item.id);
                      setModal(null);
                    }}
                    style={[styles.modalRow, { borderBottomColor: c.border }]}
                  >
                    <Text
                      style={[styles.modalRowText, { color: c.foreground }]}
                    >
                      {item.name}
                    </Text>
                    {active ? (
                      <MaterialIcons name="check" size={20} color={c.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnPrimary: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  filtersRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  modalHandle: { alignItems: "center", marginBottom: 8 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowText: { fontFamily: "Inter_500Medium", fontSize: 15 },
  smartMatch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
  },
  smartTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  smartBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
