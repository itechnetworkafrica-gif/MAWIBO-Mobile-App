import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useMood } from "@/contexts/MoodContext";
import { useJournal } from "@/contexts/JournalContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useDoctors } from "@/contexts/DoctorsContext";
import { readJson, writeJson } from "@/lib/storage";
import { DOCTORS } from "@/constants/doctors";
import { COUNTIES } from "@/constants/counties";
import { SPECIALTIES } from "@/constants/specialties";
import type { Doctor } from "@/constants/doctors";

type AdminTab = "overview" | "doctors" | "community" | "appointments" | "users" | "settings";

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "doctors", label: "Doctors", icon: "medical-services" },
  { id: "community", label: "Community", icon: "people" },
  { id: "appointments", label: "Bookings", icon: "event" },
  { id: "users", label: "Users", icon: "manage-accounts" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const PIN_KEY = "admin_pin_v1";
const DEFAULT_PIN = "1234";
const PIN_DIGITS = 4;

function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string | number; color: string; sub?: string }) {
  const c = useColors();
  return (
    <View style={[statS.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[statS.icon, { backgroundColor: color + "22" }]}>
        <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={22} color={color} />
      </View>
      <Text style={[statS.value, { color: c.foreground }]}>{value}</Text>
      <Text style={[statS.label, { color: c.mutedForeground }]}>{label}</Text>
      {sub ? <Text style={[statS.sub, { color }]}>{sub}</Text> : null}
    </View>
  );
}
const statS = StyleSheet.create({
  card: { flex: 1, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 6, minWidth: "47%" },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  value: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  label: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sub: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});

// ─── PIN Gate ────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [storedPin, setStoredPin] = useState(DEFAULT_PIN);

  useEffect(() => {
    readJson<string>(PIN_KEY, DEFAULT_PIN).then((p) => setStoredPin(p ?? DEFAULT_PIN));
  }, []);

  const onDigit = (d: string) => {
    if (pin.length >= PIN_DIGITS) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === PIN_DIGITS) {
      setTimeout(() => {
        if (next === storedPin) {
          onUnlock();
        } else {
          setError("Incorrect PIN. Try again.");
          setPin("");
        }
      }, 150);
    }
  };

  const onDelete = () => setPin((p) => p.slice(0, -1));

  return (
    <View style={[pinS.root, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={[pinS.backBtn, { backgroundColor: c.card }]}>
        <MaterialIcons name="arrow-back" size={20} color={c.foreground} />
      </Pressable>
      <View style={pinS.content}>
        <View style={[pinS.shield, { backgroundColor: "#F59E0B22" }]}>
          <MaterialIcons name="admin-panel-settings" size={36} color="#F59E0B" />
        </View>
        <Text style={[pinS.title, { color: c.foreground }]}>Admin Access</Text>
        <Text style={[pinS.sub, { color: c.mutedForeground }]}>Enter the 4-digit PIN to continue</Text>
        <Text style={[pinS.hint, { color: c.mutedForeground }]}>Default PIN: 1234</Text>
        <View style={pinS.dots}>
          {Array.from({ length: PIN_DIGITS }).map((_, i) => (
            <View key={i} style={[pinS.dot, { backgroundColor: i < pin.length ? "#F59E0B" : c.muted, borderColor: i < pin.length ? "#F59E0B" : c.border }]} />
          ))}
        </View>
        {error ? <Text style={[pinS.error, { color: c.destructive }]}>{error}</Text> : <View style={{ height: 20 }} />}
        <View style={pinS.keypad}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((key) => (
            <Pressable
              key={key || "empty"}
              onPress={() => key === "del" ? onDelete() : key ? onDigit(key) : undefined}
              style={({ pressed }) => [
                pinS.key,
                { backgroundColor: key ? (pressed ? c.primary : c.card) : "transparent", borderColor: key && key !== "del" ? c.border : "transparent" },
              ]}
              disabled={!key}
            >
              {key === "del" ? (
                <MaterialIcons name="backspace" size={22} color={c.foreground} />
              ) : key ? (
                <Text style={[pinS.keyText, { color: c.foreground }]}>{key}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
const pinS = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { position: "absolute", top: 56, left: 16, width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", zIndex: 10 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  shield: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 14 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 12 },
  dots: { flexDirection: "row", gap: 16, marginTop: 16, marginBottom: 4 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  error: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  keypad: { flexDirection: "row", flexWrap: "wrap", width: 260, gap: 14, marginTop: 12, justifyContent: "center" },
  key: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  keyText: { fontFamily: "Inter_700Bold", fontSize: 24 },
});

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");

  const { upcoming, past } = useAppointments();
  const { last7, streak } = useMood();
  const { entries: journalEntries } = useJournal();
  const { posts, toggleLike } = useCommunity();
  const { allUsers } = useAuth();
  const { profile, updateProfile } = useApp();
  const { allDoctors, customDoctors, addDoctor, removeDoctor } = useDoctors();

  // Admin settings state
  const [pinInput, setPinInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [appName, setAppName] = useState("MAWIBO");

  // Doctor management state
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [docTitle, setDocTitle] = useState("MD");
  const [docGender, setDocGender] = useState<"M" | "F">("F");
  const [docSpecialty, setDocSpecialty] = useState("mental-health");
  const [docCounty, setDocCounty] = useState("montserrado");
  const [docFacility, setDocFacility] = useState("");
  const [docPhone, setDocPhone] = useState("+231 ");
  const [docEmail, setDocEmail] = useState("");
  const [docFee, setDocFee] = useState("1500");
  const [docTelehealth, setDocTelehealth] = useState(false);
  const [docBio, setDocBio] = useState("");

  const resetDoctorForm = () => {
    setDocName(""); setDocTitle("MD"); setDocGender("F");
    setDocSpecialty("mental-health"); setDocCounty("montserrado");
    setDocFacility(""); setDocPhone("+231 "); setDocEmail("");
    setDocFee("1500"); setDocTelehealth(false); setDocBio("");
  };

  const onSaveDoctor = async () => {
    if (!docName.trim() || !docFacility.trim()) {
      Alert.alert("Required", "Doctor name and facility are required.");
      return;
    }
    const newDoc: Doctor = {
      id: `custom-${Date.now()}`,
      name: docName.trim(),
      title: docTitle.trim(),
      gender: docGender,
      specialty: docSpecialty,
      county: docCounty,
      facility: docFacility.trim(),
      hospitalAddress: docFacility.trim(),
      phone: docPhone.trim(),
      email: docEmail.trim(),
      yearsExperience: 0,
      patientsServed: 0,
      languages: ["English"],
      education: [],
      certifications: [],
      bio: docBio.trim() || `Healthcare provider at ${docFacility.trim()}.`,
      rating: 4.5,
      reviews: 0,
      consultationFee: parseInt(docFee) || 1500,
      telehealth: docTelehealth,
      acceptsInsurance: false,
      availableDays: ["Monday", "Wednesday", "Friday"],
      availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    };
    await addDoctor(newDoc);
    resetDoctorForm();
    setShowDoctorForm(false);
    Alert.alert("Doctor Added", `${newDoc.name} has been added to the registry.`);
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  const totalAppointments = upcoming.length + past.length;
  const moodLogs = last7.filter((d) => d.moodId).length;
  const communityPosts = posts.length;
  const totalDoctors = allDoctors.length;

  const specialtyMap: Record<string, number> = {};
  allDoctors.forEach((d) => { specialtyMap[d.specialty] = (specialtyMap[d.specialty] ?? 0) + 1; });
  const specialties = Object.entries(specialtyMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const countyMap: Record<string, number> = {};
  allDoctors.forEach((d) => { countyMap[d.county] = (countyMap[d.county] ?? 0) + 1; });
  const topCounties = Object.entries(countyMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const onChangePin = () => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) { Alert.alert("Invalid PIN", "PIN must be exactly 4 digits."); return; }
    if (newPin !== confirmPin) { Alert.alert("Mismatch", "New PINs do not match."); return; }
    writeJson(PIN_KEY, newPin);
    Alert.alert("PIN Updated", "Admin PIN has been changed successfully.");
    setPinInput(""); setNewPin(""); setConfirmPin("");
  };

  const onBroadcast = () => {
    if (!announcement.trim()) { Alert.alert("Empty", "Please enter a message to broadcast."); return; }
    Alert.alert("Broadcast Sent", `"${announcement.trim()}" has been broadcast to the community.`);
    setAnnouncement("");
  };

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>APP STATS</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="medical-services" label="Doctors" value={totalDoctors} color="#3A7BD5" sub="All 15 counties" />
        <StatCard icon="event" label="Total bookings" value={totalAppointments} color="#6FCF97" sub={`${upcoming.length} upcoming`} />
        <StatCard icon="mood" label="Mood logs (7d)" value={moodLogs} color="#7C5DB8" sub={`${streak} day streak`} />
        <StatCard icon="people" label="Community posts" value={communityPosts} color="#E07A5F" sub="User generated" />
        <StatCard icon="edit-note" label="Journal entries" value={journalEntries.length} color="#E0A800" />
        <StatCard icon="manage-accounts" label="Registered users" value={allUsers.length} color="#27AE60" sub="Local accounts" />
      </View>
      <View style={{ height: 22 }} />
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>DOCTORS BY SPECIALTY</Text>
      {specialties.map(([spec, count]) => (
        <View key={spec} style={[styles.barRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.barLabel, { color: c.foreground }]} numberOfLines={1}>{spec}</Text>
          <View style={[styles.barTrack, { backgroundColor: c.muted }]}>
            <View style={[styles.barFill, { backgroundColor: c.primary, width: `${Math.min(100, (count / totalDoctors) * 280)}%` }]} />
          </View>
          <Text style={[styles.barCount, { color: c.primary }]}>{count}</Text>
        </View>
      ))}
      <View style={{ height: 22 }} />
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>TOP COUNTIES BY DOCTORS</Text>
      <View style={styles.countyGrid}>
        {topCounties.map(([county, count]) => (
          <View key={county} style={[styles.countyCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <MaterialIcons name="location-on" size={14} color={c.primary} />
            <Text style={[styles.countyName, { color: c.foreground }]} numberOfLines={1}>{county}</Text>
            <Text style={[styles.countyCount, { color: c.mutedForeground }]}>{count}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 22 }} />
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>QUICK ACTIONS</Text>
      {([
        { icon: "medical-services", label: "Manage doctor registry", sub: `${totalDoctors} doctors registered`, color: "#3A7BD5", t: "doctors" as AdminTab },
        { icon: "people", label: "Moderate community", sub: `${communityPosts} posts`, color: "#6FCF97", t: "community" as AdminTab },
        { icon: "event", label: "View all bookings", sub: `${totalAppointments} total`, color: "#7C5DB8", t: "appointments" as AdminTab },
        { icon: "manage-accounts", label: "User accounts", sub: `${allUsers.length} registered`, color: "#27AE60", t: "users" as AdminTab },
        { icon: "settings", label: "App configuration", sub: "PIN, theme, broadcast", color: "#E07A5F", t: "settings" as AdminTab },
      ] as const).map((action) => (
        <Pressable key={action.label} onPress={() => setTab(action.t)}
          style={({ pressed }) => [styles.actionCard, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
          <View style={[styles.actionIcon, { backgroundColor: action.color + "22" }]}>
            <MaterialIcons name={action.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={action.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionLabel, { color: c.foreground }]}>{action.label}</Text>
            <Text style={[styles.actionSub, { color: c.mutedForeground }]}>{action.sub}</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={14} color={c.border} />
        </Pressable>
      ))}
      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );

  const renderDoctors = () => (
    <>
      <FlatList
        data={allDoctors}
        keyExtractor={(d) => d.id}
        contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 24 }]}
        ListHeaderComponent={
          <View>
            <Pressable onPress={() => setShowDoctorForm(true)}
              style={[styles.addDoctorBtn, { backgroundColor: c.primary }]}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addDoctorText}>Add New Doctor</Text>
            </Pressable>
            {customDoctors.length > 0 && (
              <View style={[styles.customBadge, { backgroundColor: "#6FCF9722" }]}>
                <MaterialIcons name="info-outline" size={14} color="#27AE60" />
                <Text style={[styles.customBadgeText, { color: "#27AE60" }]}>
                  {customDoctors.length} custom doctor{customDoctors.length !== 1 ? "s" : ""} added · Showing {allDoctors.length} total
                </Text>
              </View>
            )}
            <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 12 }]}>{allDoctors.length} REGISTERED DOCTORS</Text>
          </View>
        }
        renderItem={({ item: doc }) => {
          const isCustom = customDoctors.some((d) => d.id === doc.id);
          return (
            <Pressable onPress={() => !isCustom ? router.push(`/doctor/${doc.id}` as never) : undefined}
              style={({ pressed }) => [styles.doctorCard, { backgroundColor: c.card, borderColor: isCustom ? c.primary + "55" : c.border, opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.doctorAvatar, { backgroundColor: (isCustom ? "#6FCF97" : c.primary) + "22" }]}>
                <Text style={[styles.doctorAvatarText, { color: isCustom ? "#27AE60" : c.primary }]}>{doc.name.split(" ").slice(-1)[0]?.[0] ?? "D"}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.doctorName, { color: c.foreground }]} numberOfLines={1}>{doc.name}</Text>
                  {isCustom && (
                    <View style={[styles.miniPill, { backgroundColor: "#6FCF9722" }]}>
                      <Text style={[styles.miniPillText, { color: "#27AE60" }]}>Custom</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.doctorSpec, { color: c.mutedForeground }]} numberOfLines={1}>{doc.specialty} · {doc.county}</Text>
                <View style={styles.doctorMeta}>
                  <View style={[styles.miniPill, { backgroundColor: doc.telehealth ? "#6FCF97" + "22" : c.muted }]}>
                    <Text style={[styles.miniPillText, { color: doc.telehealth ? "#27AE60" : c.mutedForeground }]}>{doc.telehealth ? "Telehealth" : "In-person"}</Text>
                  </View>
                  <Text style={[styles.doctorFee, { color: c.primary }]}>L${doc.consultationFee}</Text>
                </View>
              </View>
              {isCustom ? (
                <Pressable onPress={() => Alert.alert("Remove Doctor", `Remove ${doc.name} from the registry?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => removeDoctor(doc.id) },
                ])} style={[styles.ratingChip, { backgroundColor: "#E03E3E22" }]}>
                  <MaterialIcons name="delete" size={16} color="#E03E3E" />
                </Pressable>
              ) : (
                <View style={styles.ratingChip}>
                  <MaterialIcons name="star" size={12} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: c.foreground }]}>{doc.rating.toFixed(1)}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {/* Add Doctor Modal */}
      <Modal visible={showDoctorForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setShowDoctorForm(false); resetDoctorForm(); }}>
        <View style={[styles.formModal, { backgroundColor: c.background }]}>
          <View style={[styles.formModalHeader, { backgroundColor: c.card, borderBottomColor: c.border, paddingTop: insets.top + 14 }]}>
            <Pressable onPress={() => { setShowDoctorForm(false); resetDoctorForm(); }} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={c.foreground} />
            </Pressable>
            <Text style={[styles.formModalTitle, { color: c.foreground }]}>Add New Doctor</Text>
            <Pressable onPress={onSaveDoctor} style={[styles.formSaveBtn, { backgroundColor: c.primary }]}>
              <Text style={styles.formSaveBtnText}>Save</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={[styles.formBody, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">

            <Text style={[styles.formSectionLabel, { color: c.mutedForeground }]}>PERSONAL INFO</Text>
            <TextInput value={docName} onChangeText={setDocName} placeholder="Full name *" placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
            <View style={styles.formRow}>
              <TextInput value={docTitle} onChangeText={setDocTitle} placeholder="Title (MD, RN...)" placeholderTextColor={c.mutedForeground}
                style={[styles.formInput, { flex: 1, backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
              <View style={[styles.formToggleRow, { flex: 1 }]}>
                {(["F", "M"] as const).map((g) => (
                  <Pressable key={g} onPress={() => setDocGender(g)}
                    style={[styles.formToggleBtn, { backgroundColor: docGender === g ? c.primary : c.muted, borderColor: docGender === g ? c.primary : c.border }]}>
                    <Text style={[styles.formToggleBtnText, { color: docGender === g ? "#FFFFFF" : c.mutedForeground }]}>{g === "F" ? "Female" : "Male"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={[styles.formSectionLabel, { color: c.mutedForeground }]}>PROFESSIONAL DETAILS</Text>
            <Text style={[styles.formFieldLabel, { color: c.mutedForeground }]}>Specialty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formChipRow}>
              {SPECIALTIES.slice(0, 8).map((s) => (
                <Pressable key={s.id} onPress={() => setDocSpecialty(s.id)}
                  style={[styles.formChip, { backgroundColor: docSpecialty === s.id ? c.primary : c.muted, borderColor: docSpecialty === s.id ? c.primary : c.border }]}>
                  <Text style={[styles.formChipText, { color: docSpecialty === s.id ? "#FFFFFF" : c.mutedForeground }]}>{s.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={[styles.formFieldLabel, { color: c.mutedForeground }]}>County</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formChipRow}>
              {COUNTIES.slice(0, 10).map((co) => (
                <Pressable key={co.id} onPress={() => setDocCounty(co.id)}
                  style={[styles.formChip, { backgroundColor: docCounty === co.id ? c.primary : c.muted, borderColor: docCounty === co.id ? c.primary : c.border }]}>
                  <Text style={[styles.formChipText, { color: docCounty === co.id ? "#FFFFFF" : c.mutedForeground }]}>{co.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput value={docFacility} onChangeText={setDocFacility} placeholder="Hospital / Clinic name *" placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />

            <Text style={[styles.formSectionLabel, { color: c.mutedForeground }]}>CONTACT</Text>
            <TextInput value={docPhone} onChangeText={setDocPhone} placeholder="+231 ..." keyboardType="phone-pad" placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
            <TextInput value={docEmail} onChangeText={setDocEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />

            <Text style={[styles.formSectionLabel, { color: c.mutedForeground }]}>BOOKING</Text>
            <TextInput value={docFee} onChangeText={setDocFee} placeholder="Consultation fee (LRD)" keyboardType="numeric" placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
            <View style={[styles.formSwitchRow, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialIcons name="wifi" size={20} color={docTelehealth ? c.primary : c.mutedForeground} />
              <Text style={[styles.formSwitchLabel, { color: c.foreground }]}>Telehealth available</Text>
              <Switch value={docTelehealth} onValueChange={setDocTelehealth}
                trackColor={{ false: c.muted, true: c.primary + "88" }} thumbColor={docTelehealth ? c.primary : c.mutedForeground} />
            </View>

            <Text style={[styles.formSectionLabel, { color: c.mutedForeground }]}>SHORT BIO (optional)</Text>
            <TextInput value={docBio} onChangeText={setDocBio} placeholder="Briefly describe the doctor's focus area..." placeholderTextColor={c.mutedForeground}
              style={[styles.formInput, { backgroundColor: c.card, borderColor: c.border, color: c.foreground, height: 90, textAlignVertical: "top" }]}
              multiline maxLength={300} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );

  const renderCommunity = () => (
    <FlatList
      data={posts}
      keyExtractor={(p) => p.id}
      contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 24 }]}
      ListHeaderComponent={<Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>{posts.length} COMMUNITY POSTS</Text>}
      renderItem={({ item: post }) => (
        <View style={[styles.modCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.modHeader}>
            <View style={[styles.modAvatar, { backgroundColor: post.authorColor + "22" }]}>
              <Text style={[styles.modAvatarText, { color: post.authorColor }]}>{post.authorInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modAuthor, { color: c.foreground }]}>{post.authorName}</Text>
              <Text style={[styles.modTime, { color: c.mutedForeground }]}>{post.timestamp}</Text>
            </View>
            <View style={[styles.miniPill, { backgroundColor: c.primarySoft }]}>
              <Text style={[styles.miniPillText, { color: c.primary }]}>{post.category}</Text>
            </View>
          </View>
          <Text style={[styles.modContent, { color: c.foreground }]} numberOfLines={3}>{post.content}</Text>
          <View style={styles.modFooter}>
            <View style={styles.modStats}>
              <MaterialIcons name="favorite-border" size={14} color={c.mutedForeground} />
              <Text style={[styles.modStatText, { color: c.mutedForeground }]}>{post.likes}</Text>
              <MaterialIcons name="chat-bubble-outline" size={14} color={c.mutedForeground} />
              <Text style={[styles.modStatText, { color: c.mutedForeground }]}>{post.replyCount}</Text>
            </View>
            {post.isOwn ? (
              <View style={[styles.miniPill, { backgroundColor: c.secondarySoft }]}>
                <Text style={[styles.miniPillText, { color: c.secondary }]}>Your post</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => Alert.alert("Remove post?", `Remove "${post.authorName}'s" post from the feed?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => toggleLike(post.id) },
                ])}
                style={[styles.miniPill, { backgroundColor: c.destructiveSoft }]}
              >
                <Text style={[styles.miniPillText, { color: c.destructive }]}>Flag / Remove</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    />
  );

  const renderAppointments = () => {
    const all = [...upcoming, ...past].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return (
      <FlatList
        data={all}
        keyExtractor={(a) => a.id}
        contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 24 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              {[{ v: upcoming.length, l: "Upcoming", c2: c.primary }, { v: past.length, l: "Past", c2: c.secondary }, { v: all.length, l: "Total", c2: c.foreground }].map((s) => (
                <View key={s.l} style={[styles.miniStat, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={[styles.miniStatVal, { color: s.c2 }]}>{s.v}</Text>
                  <Text style={[styles.miniStatLabel, { color: c.mutedForeground }]}>{s.l}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 16 }]}>ALL BOOKINGS</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="event" size={36} color={c.mutedForeground} />
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>No appointments yet.</Text>
          </View>
        }
        renderItem={({ item: appt }) => (
          <View style={[styles.apptCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.apptStatus, { backgroundColor: appt.status === "upcoming" ? c.secondarySoft : c.muted }]}>
              <MaterialIcons name={appt.status === "upcoming" ? "schedule" : appt.status === "completed" ? "check-circle" : "cancel"} size={18}
                color={appt.status === "upcoming" ? c.secondary : c.mutedForeground} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.apptDoctor, { color: c.foreground }]} numberOfLines={1}>{appt.doctorName}</Text>
              <Text style={[styles.apptSpec, { color: c.mutedForeground }]} numberOfLines={1}>{appt.specialty} · {appt.county}</Text>
              <Text style={[styles.apptDate, { color: c.primary }]}>{appt.date} at {appt.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: appt.status === "upcoming" ? c.secondarySoft : appt.status === "cancelled" ? c.destructiveSoft : c.muted }]}>
              <Text style={[styles.statusText, { color: appt.status === "upcoming" ? c.secondary : appt.status === "cancelled" ? c.destructive : c.mutedForeground }]}>
                {appt.status}
              </Text>
            </View>
          </View>
        )}
      />
    );
  };

  const renderUsers = () => (
    <FlatList
      data={allUsers}
      keyExtractor={(u) => u.id}
      contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 24 }]}
      ListHeaderComponent={
        <View>
          <View style={[styles.miniStat, { backgroundColor: c.card, borderColor: c.border, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }]}>
            <MaterialIcons name="manage-accounts" size={28} color={c.primary} />
            <View>
              <Text style={[styles.miniStatVal, { color: c.primary }]}>{allUsers.length}</Text>
              <Text style={[styles.miniStatLabel, { color: c.mutedForeground }]}>Registered accounts</Text>
            </View>
          </View>
          <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>REGISTERED USERS</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <MaterialIcons name="person-outline" size={36} color={c.mutedForeground} />
          <Text style={[styles.emptyText, { color: c.mutedForeground }]}>No registered users yet.</Text>
          <Text style={[styles.emptyText, { color: c.mutedForeground, fontSize: 12, marginTop: 4 }]}>
            Users register via Profile → Register / Login.
          </Text>
        </View>
      }
      renderItem={({ item: u }) => (
        <View style={[styles.userCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.userAvatar, { backgroundColor: u.avatarColor + "22" }]}>
            <Text style={[styles.userAvatarText, { color: u.avatarColor }]}>{u.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.userName, { color: c.foreground }]}>{u.username}</Text>
            <Text style={[styles.userEmail, { color: c.mutedForeground }]} numberOfLines={1}>{u.email}</Text>
            {u.county ? <Text style={[styles.userCounty, { color: c.primary }]}>{u.county}</Text> : null}
          </View>
          <View>
            <Text style={[styles.userJoined, { color: c.mutedForeground }]}>
              {new Date(u.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
    />
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
      {/* Change PIN */}
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>CHANGE ADMIN PIN</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.settingsLabel, { color: c.foreground }]}>New PIN (4 digits)</Text>
        <TextInput
          value={newPin}
          onChangeText={setNewPin}
          placeholder="Enter new 4-digit PIN"
          placeholderTextColor={c.mutedForeground}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          style={[styles.settingsInput, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
        />
        <Text style={[styles.settingsLabel, { color: c.foreground, marginTop: 12 }]}>Confirm new PIN</Text>
        <TextInput
          value={confirmPin}
          onChangeText={setConfirmPin}
          placeholder="Re-enter new PIN"
          placeholderTextColor={c.mutedForeground}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          style={[styles.settingsInput, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
        />
        <Pressable onPress={onChangePin} style={[styles.settingsBtn, { backgroundColor: "#F59E0B" }]}>
          <MaterialIcons name="lock" size={18} color="#FFFFFF" />
          <Text style={styles.settingsBtnText}>Update PIN</Text>
        </Pressable>
      </View>

      <View style={{ height: 22 }} />

      {/* Broadcast */}
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>BROADCAST ANNOUNCEMENT</Text>
      <View style={[styles.settingsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.settingsLabel, { color: c.foreground }]}>Message to community</Text>
        <TextInput
          value={announcement}
          onChangeText={setAnnouncement}
          placeholder="Type your announcement here..."
          placeholderTextColor={c.mutedForeground}
          multiline
          style={[styles.settingsInput, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border, minHeight: 80, textAlignVertical: "top" }]}
        />
        <Pressable onPress={onBroadcast} style={[styles.settingsBtn, { backgroundColor: c.primary }]}>
          <MaterialIcons name="campaign" size={18} color="#FFFFFF" />
          <Text style={styles.settingsBtnText}>Broadcast</Text>
        </Pressable>
      </View>

      <View style={{ height: 22 }} />

      {/* App Info */}
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>APP INFORMATION</Text>
      {[
        { label: "App name", value: "MAWIBO" },
        { label: "Version", value: "1.0.0" },
        { label: "Platform", value: "Expo React Native" },
        { label: "Storage", value: "Offline-first (AsyncStorage)" },
        { label: "AI provider", value: "OpenAI gpt-5-mini" },
        { label: "Total AI tools", value: "25" },
        { label: "Doctors registered", value: `${DOCTORS.length}` },
        { label: "Counties covered", value: "All 15 Liberian counties" },
      ].map((item) => (
        <View key={item.label} style={[styles.infoRow, { borderBottomColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.mutedForeground }]}>{item.label}</Text>
          <Text style={[styles.infoValue, { color: c.foreground }]}>{item.value}</Text>
        </View>
      ))}

      <View style={{ height: 22 }} />

      {/* Feature Status */}
      <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>FEATURE STATUS</Text>
      {[
        { label: "AI Chat (AI Mate)", status: "Active", color: "#27AE60" },
        { label: "Community Feed + DMs", status: "Active", color: "#27AE60" },
        { label: "Doctor Booking (28 doctors)", status: "Active", color: "#27AE60" },
        { label: "25 AI Tools", status: "Active", color: "#27AE60" },
        { label: "Article Library (8 articles)", status: "Active", color: "#27AE60" },
        { label: "CBT, Gratitude, Goals, Anxiety", status: "Active", color: "#27AE60" },
        { label: "User Registration / Login", status: "Active", color: "#27AE60" },
        { label: "Real-time Socket.IO", status: "Planned v2", color: "#D97706" },
        { label: "Video Calls (WebRTC)", status: "Planned v2", color: "#D97706" },
        { label: "Cloud Sync / Backend", status: "Planned v2", color: "#D97706" },
        { label: "In-App Notifications (Community)", status: "Active", color: "#27AE60" },
        { label: "Push Notifications (Device)", status: "Planned v2", color: "#D97706" },
      ].map((item) => (
        <View key={item.label} style={[styles.featureRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.featureDot, { backgroundColor: item.color }]} />
          <Text style={[styles.featureLabel, { color: c.foreground }]}>{item.label}</Text>
          <Text style={[styles.featureStatus, { color: item.color }]}>{item.status}</Text>
        </View>
      ))}

      <View style={{ height: 22 }} />
      <Pressable
        onPress={() => Alert.alert("Lock Admin", "Return to PIN entry?", [
          { text: "Cancel", style: "cancel" },
          { text: "Lock", onPress: () => setUnlocked(false) },
        ])}
        style={[styles.settingsBtn, { backgroundColor: c.destructive }]}
      >
        <MaterialIcons name="lock" size={18} color="#FFFFFF" />
        <Text style={styles.settingsBtnText}>Lock Admin Dashboard</Text>
      </Pressable>
    </ScrollView>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: "#0D1B3E", paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadge}>
            <MaterialIcons name="admin-panel-settings" size={14} color="#F59E0B" />
            <Text style={styles.adminBadgeText}>ADMIN PANEL</Text>
          </View>
          <Text style={styles.headerTitle}>MAWIBO</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>v1.0.0</Text>
          <Pressable onPress={() => setUnlocked(false)} style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <MaterialIcons name="lock-open" size={20} color="#F59E0B" />
          </Pressable>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTab(t.id)}
                style={[styles.tabBtn, { borderBottomColor: active ? c.primary : "transparent" }]}>
                <MaterialIcons name={t.icon as keyof typeof MaterialIcons.glyphMap} size={16} color={active ? c.primary : c.mutedForeground} />
                <Text style={[styles.tabBtnText, { color: active ? c.primary : c.mutedForeground }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {tab === "overview" && renderOverview()}
      {tab === "doctors" && renderDoctors()}
      {tab === "community" && renderCommunity()}
      {tab === "appointments" && renderAppointments()}
      {tab === "users" && renderUsers()}
      {tab === "settings" && renderSettings()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  adminBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#F59E0B", letterSpacing: 1.2 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: "#FFFFFF", letterSpacing: -0.3 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  tabBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  tabBarInner: { paddingHorizontal: 8 },
  tabBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 2.5 },
  tabBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabContent: { padding: 16 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2, marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  barLabel: { fontFamily: "Inter_500Medium", fontSize: 13, width: 110 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  barCount: { fontFamily: "Inter_700Bold", fontSize: 13, width: 20, textAlign: "right" },
  countyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  countyCard: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, width: "47%" },
  countyName: { fontFamily: "Inter_600SemiBold", fontSize: 12, flex: 1 },
  countyCount: { fontFamily: "Inter_400Regular", fontSize: 11 },
  actionCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  actionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 },
  actionSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  searchBarMock: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 14 },
  searchPlaceholder: { fontFamily: "Inter_400Regular", fontSize: 14 },
  doctorCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  doctorAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  doctorAvatarText: { fontFamily: "Inter_700Bold", fontSize: 17 },
  doctorName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  doctorSpec: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  doctorMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  miniPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniPillText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  doctorFee: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  ratingChip: { flexDirection: "row", alignItems: "center", gap: 3, padding: 8, borderRadius: 10 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  modCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8, overflow: "hidden" },
  modHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, paddingBottom: 8 },
  modAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modAvatarText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  modAuthor: { fontFamily: "Inter_700Bold", fontSize: 13 },
  modTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  modContent: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, paddingHorizontal: 12, paddingBottom: 10 },
  modFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 10 },
  modStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  modStatText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  miniStat: { flex: 1, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", gap: 4 },
  miniStatVal: { fontFamily: "Inter_700Bold", fontSize: 22 },
  miniStatLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  apptCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  apptStatus: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  apptDoctor: { fontFamily: "Inter_700Bold", fontSize: 14 },
  apptSpec: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  apptDate: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontFamily: "Inter_700Bold", fontSize: 11, textTransform: "capitalize" },
  emptyWrap: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  infoValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  featureDot: { width: 10, height: 10, borderRadius: 5 },
  featureLabel: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  featureStatus: { fontFamily: "Inter_700Bold", fontSize: 11 },
  userCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  userAvatarText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  userName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  userCounty: { fontFamily: "Inter_600SemiBold", fontSize: 11, marginTop: 2 },
  userJoined: { fontFamily: "Inter_400Regular", fontSize: 11 },
  settingsCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 4 },
  settingsLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 4 },
  settingsInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontFamily: "Inter_400Regular", fontSize: 15 },
  settingsBtn: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", padding: 14, borderRadius: 12, marginTop: 12 },
  settingsBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  addDoctorBtn: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", padding: 14, borderRadius: 12, marginBottom: 12 },
  addDoctorText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  customBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, marginBottom: 6 },
  customBadgeText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  formModal: { flex: 1 },
  formModalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  formModalTitle: { fontFamily: "Inter_700Bold", fontSize: 17, flex: 1 },
  formSaveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  formSaveBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF" },
  formBody: { padding: 16, gap: 0 },
  formSectionLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  formFieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 8, marginTop: 4 },
  formInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 10 },
  formRow: { flexDirection: "row", gap: 10, marginBottom: 0 },
  formToggleRow: { flexDirection: "row", gap: 6 },
  formToggleBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  formToggleBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  formChipRow: { gap: 8, paddingBottom: 10 },
  formChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  formChipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  formSwitchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  formSwitchLabel: { fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 },
});
