import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COUNTIES } from "@/constants/counties";
import { GOALS } from "@/constants/goals";
import { LANGUAGES } from "@/constants/translations";

export default function OnboardingScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, completeOnboarding } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [language, setLanguage] = useState(profile.language);
  const [county, setCounty] = useState<string | null>(profile.county);
  const [goals, setGoals] = useState<string[]>(profile.goals);
  const [showCountyModal, setShowCountyModal] = useState(false);

  const totalSteps = 4;

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return Boolean(language);
    if (step === 2) return Boolean(county);
    if (step === 3) return goals.length > 0;
    return true;
  }, [step, language, county, goals]);

  const onNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    updateProfile({
      name: name.trim(),
      language,
      county,
      goals,
      anonymous: name.trim().length === 0,
    });
    completeOnboarding();
    router.replace("/");
  };

  const onBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const topPad = Math.max(insets.top + 16, 40);
  const bottomPad = Math.max(insets.bottom + 16, 24);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: topPad },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressRow}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i <= step ? c.primary : c.border,
                    flex: 1,
                  },
                ]}
              />
            ))}
          </View>

          {step === 0 ? (
            <View>
              <View
                style={[styles.brandIcon, { backgroundColor: c.primarySoft }]}
              >
                <MaterialIcons name="favorite" size={36} color={c.primary} />
              </View>
              <Text style={[styles.title, { color: c.foreground }]}>
                Welcome to MAWIBO
              </Text>
              <Text style={[styles.body, { color: c.mutedForeground }]}>
                Your friendly mental health companion built for Liberia. Talk
                freely, track your mood, find a doctor in your county, and get
                support whenever you need it.
              </Text>
              <View style={{ height: 16 }} />
              <Text style={[styles.label, { color: c.foreground }]}>
                What should we call you? (optional)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={c.mutedForeground}
                returnKeyType="done"
                style={[
                  styles.input,
                  {
                    borderColor: c.border,
                    backgroundColor: c.card,
                    color: c.foreground,
                  },
                ]}
              />
              <Text style={[styles.hint, { color: c.mutedForeground }]}>
                You can stay anonymous. Skip to continue.
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Text style={[styles.title, { color: c.foreground }]}>
                Choose your language
              </Text>
              <Text style={[styles.body, { color: c.mutedForeground }]}>
                We will speak to you in this language. Tribal languages are
                coming soon.
              </Text>
              <View style={{ height: 16 }} />
              {LANGUAGES.map((l) => {
                const active = language === l.code;
                const disabled = !l.available;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => !disabled && setLanguage(l.code)}
                    disabled={disabled}
                    style={[
                      styles.choice,
                      {
                        borderColor: active ? c.primary : c.border,
                        backgroundColor: active ? c.primarySoft : c.card,
                        opacity: disabled ? 0.55 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.choiceTitle, { color: c.foreground }]}
                      >
                        {l.name}
                      </Text>
                      {disabled ? (
                        <Text
                          style={[
                            styles.choiceMeta,
                            { color: c.mutedForeground },
                          ]}
                        >
                          Coming soon
                        </Text>
                      ) : null}
                    </View>
                    {active ? (
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color={c.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Text style={[styles.title, { color: c.foreground }]}>
                Where in Liberia?
              </Text>
              <Text style={[styles.body, { color: c.mutedForeground }]}>
                We will show doctors and clinics close to you.
              </Text>
              <View style={{ height: 16 }} />
              <Pressable
                onPress={() => setShowCountyModal(true)}
                style={[
                  styles.input,
                  {
                    borderColor: c.border,
                    backgroundColor: c.card,
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={c.primary}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    color: county ? c.foreground : c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    flex: 1,
                  }}
                >
                  {county
                    ? COUNTIES.find((co) => co.id === county)?.name
                    : "Select your county"}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={c.mutedForeground}
                />
              </Pressable>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Text style={[styles.title, { color: c.foreground }]}>
                What brings you here?
              </Text>
              <Text style={[styles.body, { color: c.mutedForeground }]}>
                Pick anything that feels right. You can change this later.
              </Text>
              <View style={{ height: 16 }} />
              <View style={styles.goalGrid}>
                {GOALS.map((g) => {
                  const active = goals.includes(g.id);
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => toggleGoal(g.id)}
                      style={[
                        styles.goalCard,
                        {
                          borderColor: active ? c.primary : c.border,
                          backgroundColor: active ? c.primarySoft : c.card,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={g.icon as keyof typeof MaterialIcons.glyphMap}
                        size={26}
                        color={active ? c.primary : c.foreground}
                      />
                      <Text
                        style={[styles.goalLabel, { color: c.foreground }]}
                        numberOfLines={2}
                      >
                        {g.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              borderTopColor: c.border,
              paddingBottom: bottomPad,
              backgroundColor: c.background,
            },
          ]}
        >
          {step > 0 ? (
            <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={c.mutedForeground}
              />
              <Text style={{ color: c.mutedForeground, marginLeft: 6 }}>
                Back
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={step === totalSteps - 1 ? "Get started" : "Continue"}
              onPress={onNext}
              disabled={!canContinue}
              iconRight={step === totalSteps - 1 ? "check" : "arrow-forward"}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showCountyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountyModal(false)}
      >
        <View style={[styles.root, { backgroundColor: c.background }]}>
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: c.border,
                backgroundColor: c.card,
                paddingTop: insets.top + 14,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: c.foreground }]}>
              Select your county
            </Text>
            <Pressable
              onPress={() => setShowCountyModal(false)}
              hitSlop={12}
              style={styles.modalClose}
            >
              <MaterialIcons name="close" size={24} color={c.foreground} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {COUNTIES.map((co) => {
              const active = county === co.id;
              return (
                <Pressable
                  key={co.id}
                  onPress={() => {
                    setCounty(co.id);
                    setShowCountyModal(false);
                  }}
                  style={[styles.modalRow, { borderBottomColor: c.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.choiceTitle, { color: c.foreground }]}
                    >
                      {co.name}
                    </Text>
                    <Text
                      style={[
                        styles.choiceMeta,
                        { color: c.mutedForeground },
                      ]}
                    >
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 28,
  },
  progressDot: { height: 6, borderRadius: 3 },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 8,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 52,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
    minHeight: 56,
  },
  choiceTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  choiceMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 96,
    gap: 8,
  },
  goalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    minWidth: 60,
    minHeight: 48,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 60,
  },
});
