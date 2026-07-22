import React, { useRef, useState } from "react";
import {
  Alert,
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
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useChat } from "@/contexts/ChatContext";
import { useJournal } from "@/contexts/JournalContext";
import { LANGUAGES } from "@/constants/translations";
import { COUNTIES, getCountyName } from "@/constants/counties";
import type { ThemeMode } from "@/contexts/AppContext";

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "dark", label: "Dark", icon: "dark-mode" },
  { mode: "light", label: "Light", icon: "light-mode" },
  { mode: "system", label: "System", icon: "settings-brightness" },
];

function Avatar({
  name,
  size = 64,
}: {
  name: string;
  size?: number;
}) {
  const c = useColors();
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "ME";
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.primarySoft,
          borderColor: c.primary + "40",
        },
      ]}
    >
      <Text style={[styles.avatarText, { color: c.primary, fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, resetProfile } = useApp();
  const { clear: clearChat } = useChat();
  const { clear: clearJournal } = useJournal();

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [showLang, setShowLang] = useState(false);
  const [showCounty, setShowCounty] = useState(false);

  const versionTapCount = useRef(0);
  const onVersionTap = () => {
    versionTapCount.current += 1;
    if (versionTapCount.current >= 5) {
      versionTapCount.current = 0;
      router.push("/admin");
    }
  };

  const onResetAll = () => {
    Alert.alert(
      "Reset everything?",
      "This deletes your profile, chats, and journal. You will start fresh.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearChat();
            clearJournal();
            resetProfile();
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  const onSaveProfile = () => {
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      anonymous: name.trim().length === 0,
    });
    Alert.alert("Saved", "Your profile has been updated.");
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
        <View style={styles.avatarRow}>
          <Avatar name={name || "Me"} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Your profile
            </Text>
            <Text style={[styles.sectionSub, { color: c.mutedForeground }]}>
              Stored only on this device.
            </Text>
          </View>
        </View>

        <Card>
          <Text style={[styles.label, { color: c.foreground }]}>Name (optional)</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor={c.mutedForeground}
            style={[
              styles.input,
              {
                color: c.foreground,
                backgroundColor: c.muted,
                borderColor: c.border,
              },
            ]}
          />
          <View style={{ height: 14 }} />
          <Text style={[styles.label, { color: c.foreground }]}>Bio (optional)</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="A few words about yourself"
            placeholderTextColor={c.mutedForeground}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.bioInput,
              {
                color: c.foreground,
                backgroundColor: c.muted,
                borderColor: c.border,
              },
            ]}
          />
          <View style={{ height: 14 }} />
          <PrimaryButton label="Save profile" icon="check" onPress={onSaveProfile} />
        </Card>

        <View style={{ height: 14 }} />

        {/* Theme section */}
        <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>
          APPEARANCE
        </Text>
        <Card padded={false}>
          <View style={[styles.themeRow, { borderBottomColor: c.border }]}>
            <MaterialIcons name="palette" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground }]}>Theme</Text>
          </View>
          <View style={styles.themePicker}>
            {THEME_OPTIONS.map(({ mode, label, icon }) => {
              const active = profile.themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => updateProfile({ themeMode: mode })}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? c.primary : c.muted,
                      borderColor: active ? c.primary : c.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={active ? "#FFFFFF" : c.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: active ? "#FFFFFF" : c.mutedForeground },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 14 }} />

        {/* Preferences section */}
        <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>
          PREFERENCES
        </Text>
        <Card padded={false}>
          <Pressable
            onPress={() => setShowLang(true)}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <MaterialIcons name="translate" size={22} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: c.foreground }]}>
                Language
              </Text>
              <Text style={[styles.rowSub, { color: c.mutedForeground }]}>
                {LANGUAGES.find((l) => l.code === profile.language)?.name ??
                  "English"}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={c.mutedForeground}
            />
          </Pressable>
          <Pressable
            onPress={() => setShowCounty(true)}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <MaterialIcons name="location-on" size={22} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: c.foreground }]}>
                County
              </Text>
              <Text style={[styles.rowSub, { color: c.mutedForeground }]}>
                {getCountyName(profile.county)}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={c.mutedForeground}
            />
          </Pressable>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="notifications" size={22} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: c.foreground }]}>
                Notifications
              </Text>
              <Text style={[styles.rowSub, { color: c.mutedForeground }]}>
                Daily check-in reminders and tips
              </Text>
            </View>
            <Switch
              value={profile.notifications}
              onValueChange={(v) => updateProfile({ notifications: v })}
              trackColor={{ false: c.muted, true: c.primary + "88" }}
              thumbColor={profile.notifications ? c.primary : c.mutedForeground}
            />
          </View>
        </Card>

        <View style={{ height: 14 }} />

        {/* Quick links */}
        <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>
          SUPPORT
        </Text>
        <Card padded={false}>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <MaterialIcons name="notifications-active" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground, flex: 1 }]}>
              Notifications centre
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/support" as never)}
            style={[styles.row, { borderBottomWidth: 0 }]}
          >
            <MaterialIcons name="support-agent" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground, flex: 1 }]}>
              Emergency contacts
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
          </Pressable>
        </Card>

        <View style={{ height: 14 }} />

        {/* Legal */}
        <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>
          LEGAL
        </Text>
        <Card padded={false}>
          <Pressable
            onPress={() => router.push("/terms" as never)}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <MaterialIcons name="description" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground, flex: 1 }]}>
              Terms of Service
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/privacy" as never)}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <MaterialIcons name="privacy-tip" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground, flex: 1 }]}>
              Privacy Policy
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/security" as never)}
            style={[styles.row, { borderBottomWidth: 0 }]}
          >
            <MaterialIcons name="security" size={22} color={c.primary} />
            <Text style={[styles.rowTitle, { color: c.foreground, flex: 1 }]}>
              Security
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.mutedForeground} />
          </Pressable>
        </Card>

        <View style={{ height: 14 }} />

        {/* About */}
        <Card>
          <Text style={[styles.aboutTitle, { color: c.foreground }]}>
            About MAWIBO
          </Text>
          <Text style={[styles.aboutBody, { color: c.mutedForeground }]}>
            MAWIBO is a free wellness companion built for Liberia. Your
            data lives only on your device. We are not a substitute for a
            doctor — please reach out for emergencies.
          </Text>
          <Pressable onPress={onVersionTap} style={styles.versionRow} hitSlop={8}>
            <MaterialIcons name="info-outline" size={14} color={c.mutedForeground} />
            <Text style={[styles.version, { color: c.mutedForeground }]}>
              Version 1.0.0 · Tap 5× for admin
            </Text>
          </Pressable>
        </Card>

        <View style={{ height: 18 }} />
        <PrimaryButton
          label="Reset everything"
          icon="delete-outline"
          variant="destructive"
          onPress={onResetAll}
        />
      </ScrollView>

      {/* Language picker */}
      <Modal
        visible={showLang}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLang(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: c.overlay }]}
          onPress={() => setShowLang(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalSheet,
              { backgroundColor: c.background, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <Text style={[styles.modalTitle, { color: c.foreground }]}>
              Choose language
            </Text>
            <ScrollView style={{ flex: 1 }}>
              {LANGUAGES.map((l) => {
                const active = profile.language === l.code;
                const disabled = !l.available;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => {
                      if (disabled) return;
                      updateProfile({ language: l.code });
                      setShowLang(false);
                    }}
                    disabled={disabled}
                    style={[
                      styles.modalRow,
                      {
                        borderBottomColor: c.border,
                        opacity: disabled ? 0.45 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: c.foreground }]}>
                        {l.name}
                      </Text>
                      {disabled ? (
                        <Text style={[styles.rowSub, { color: c.mutedForeground }]}>
                          Coming soon
                        </Text>
                      ) : null}
                    </View>
                    {active ? (
                      <MaterialIcons name="check" size={22} color={c.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* County picker */}
      <Modal
        visible={showCounty}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCounty(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: c.overlay }]}
          onPress={() => setShowCounty(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalSheet,
              { backgroundColor: c.background, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <Text style={[styles.modalTitle, { color: c.foreground }]}>
              Choose county
            </Text>
            <ScrollView style={{ flex: 1 }}>
              {COUNTIES.map((co) => {
                const active = profile.county === co.id;
                return (
                  <Pressable
                    key={co.id}
                    onPress={() => {
                      updateProfile({ county: co.id });
                      setShowCounty(false);
                    }}
                    style={[styles.modalRow, { borderBottomColor: c.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: c.foreground }]}>
                        {co.name}
                      </Text>
                      <Text style={[styles.rowSub, { color: c.mutedForeground }]}>
                        {co.capital} · {co.region}
                      </Text>
                    </View>
                    {active ? (
                      <MaterialIcons name="check" size={22} color={c.primary} />
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
  content: { padding: 20 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  groupLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  label: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 8 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  themePicker: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  themeLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 58,
  },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  rowSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  aboutTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  aboutBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  version: { fontFamily: "Inter_400Regular", fontSize: 11 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
});
