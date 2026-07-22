import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { COUNTIES } from "@/constants/counties";

type Mode = "welcome" | "login" | "register";

export default function AuthScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("welcome");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [county, setCounty] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCountyPicker, setShowCountyPicker] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (e: unknown) {
      Alert.alert("Login failed", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please re-enter your password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password, county);
      Alert.alert("Welcome!", `Account created for ${username.trim()}.`, [
        { text: "Continue", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert("Registration failed", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#3A7BD5", paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => (mode === "welcome" ? router.back() : setMode("welcome"))} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {mode === "welcome" ? "Join MAWIBO" : mode === "login" ? "Sign in" : "Create account"}
          </Text>
          <Text style={styles.headerSub}>Your health, your data, always private</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="health-and-safety" size={28} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">

        {mode === "welcome" && (
          <View style={styles.welcomeSection}>
            <View style={[styles.heroBadge, { backgroundColor: c.primarySoft }]}>
              <MaterialIcons name="lock" size={32} color={c.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: c.foreground }]}>Your account, fully yours</Text>
            <Text style={[styles.heroBody, { color: c.mutedForeground }]}>
              Create a free account to join the community, save your progress across devices, and connect with other members. Your data is stored privately on your device only.
            </Text>
            <View style={{ height: 32 }} />
            <Pressable
              onPress={() => setMode("register")}
              style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            >
              <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Create free account</Text>
            </Pressable>
            <View style={{ height: 12 }} />
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.secondaryBtn, { borderColor: c.primary }]}
            >
              <MaterialIcons name="login" size={20} color={c.primary} />
              <Text style={[styles.secondaryBtnText, { color: c.primary }]}>Sign in to existing account</Text>
            </Pressable>
            <View style={{ height: 24 }} />
            <View style={styles.featuresGrid}>
              {[
                { icon: "people", label: "Community access", color: "#6FCF97" },
                { icon: "chat", label: "Direct messages", color: "#3A7BD5" },
                { icon: "bookmark", label: "Saved posts", color: "#7C5DB8" },
                { icon: "trending-up", label: "Progress tracking", color: "#E0A800" },
              ].map((f) => (
                <View key={f.label} style={[styles.featureCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + "22" }]}>
                    <MaterialIcons name={f.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={f.color} />
                  </View>
                  <Text style={[styles.featureLabel, { color: c.foreground }]}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {mode === "login" && (
          <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: c.foreground }]}>Welcome back</Text>
            <Text style={[styles.formSub, { color: c.mutedForeground }]}>Sign in to continue your journey.</Text>
            <View style={{ height: 24 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={c.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 14 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={c.mutedForeground}
                secureTextEntry={!showPass}
                style={[styles.input, { flex: 1, backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
              />
              <Pressable onPress={() => setShowPass((s) => !s)} style={[styles.eyeBtn, { backgroundColor: c.muted }]}>
                <MaterialIcons name={showPass ? "visibility-off" : "visibility"} size={20} color={c.mutedForeground} />
              </Pressable>
            </View>
            <View style={{ height: 28 }} />
            <Pressable
              onPress={onLogin}
              disabled={loading}
              style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: loading ? 0.7 : 1 }]}
            >
              <MaterialIcons name="login" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{loading ? "Signing in..." : "Sign in"}</Text>
            </Pressable>
            <Pressable onPress={() => setMode("register")} style={styles.switchLink}>
              <Text style={[styles.switchText, { color: c.mutedForeground }]}>
                No account? <Text style={{ color: c.primary }}>Create one free</Text>
              </Text>
            </Pressable>
          </View>
        )}

        {mode === "register" && (
          <View style={styles.formSection}>
            <Text style={[styles.formTitle, { color: c.foreground }]}>Join the community</Text>
            <Text style={[styles.formSub, { color: c.mutedForeground }]}>Free, private, and always yours.</Text>
            <View style={{ height: 24 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Display name <Text style={{ color: c.destructive }}>*</Text></Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="How others will see you"
              placeholderTextColor={c.mutedForeground}
              autoCapitalize="words"
              style={[styles.input, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 14 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Email address <Text style={{ color: c.destructive }}>*</Text></Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={c.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 14 }} />
            <Text style={[styles.label, { color: c.foreground }]}>County</Text>
            <Pressable
              onPress={() => setShowCountyPicker(true)}
              style={[styles.input, styles.selectInput, { backgroundColor: c.muted, borderColor: c.border }]}
            >
              <Text style={[styles.selectText, { color: county ? c.foreground : c.mutedForeground }]}>
                {county || "Select your county (optional)"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={c.mutedForeground} />
            </Pressable>
            <View style={{ height: 14 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Password <Text style={{ color: c.destructive }}>*</Text></Text>
            <View style={styles.passRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={c.mutedForeground}
                secureTextEntry={!showPass}
                style={[styles.input, { flex: 1, backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
              />
              <Pressable onPress={() => setShowPass((s) => !s)} style={[styles.eyeBtn, { backgroundColor: c.muted }]}>
                <MaterialIcons name={showPass ? "visibility-off" : "visibility"} size={20} color={c.mutedForeground} />
              </Pressable>
            </View>
            <View style={{ height: 14 }} />
            <Text style={[styles.label, { color: c.foreground }]}>Confirm password <Text style={{ color: c.destructive }}>*</Text></Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor={c.mutedForeground}
              secureTextEntry={!showPass}
              style={[styles.input, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 28 }} />
            <Pressable
              onPress={onRegister}
              disabled={loading}
              style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: loading ? 0.7 : 1 }]}
            >
              <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{loading ? "Creating account..." : "Create account"}</Text>
            </Pressable>
            <Pressable onPress={() => setMode("login")} style={styles.switchLink}>
              <Text style={[styles.switchText, { color: c.mutedForeground }]}>
                Already have an account? <Text style={{ color: c.primary }}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {showCountyPicker && (
        <View style={[StyleSheet.absoluteFillObject, styles.pickerOverlay]}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowCountyPicker(false)} />
          <View style={[styles.pickerSheet, { backgroundColor: c.card }]}>
            <Text style={[styles.pickerTitle, { color: c.foreground }]}>Select County</Text>
            <ScrollView>
              {COUNTIES.map((co) => (
                <Pressable
                  key={co.id}
                  onPress={() => { setCounty(co.name); setShowCountyPicker(false); }}
                  style={[styles.pickerRow, { borderBottomColor: c.border }]}
                >
                  <Text style={[styles.pickerRowText, { color: co.name === county ? c.primary : c.foreground }]}>{co.name}</Text>
                  {co.name === county && <MaterialIcons name="check" size={18} color={c.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  headerIcon: { marginBottom: 2 },
  body: { padding: 20 },
  welcomeSection: { alignItems: "center" },
  heroBadge: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, textAlign: "center" },
  heroBody: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 16, paddingHorizontal: 24,
    borderRadius: 14, justifyContent: "center", width: "100%",
  },
  primaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 14, justifyContent: "center", borderWidth: 1.5, width: "100%",
  },
  secondaryBtnText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%" },
  featureCard: {
    width: "47%", padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center", gap: 8,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, textAlign: "center" },
  formSection: { width: "100%" },
  formTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  formSub: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 8 },
  input: {
    borderRadius: 12, borderWidth: 1, padding: 14,
    fontFamily: "Inter_400Regular", fontSize: 15,
  },
  passRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  eyeBtn: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  switchLink: { paddingVertical: 16, alignItems: "center" },
  switchText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  pickerOverlay: { justifyContent: "flex-end", zIndex: 999 },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  pickerSheet: { maxHeight: "60%", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  pickerTitle: { fontFamily: "Inter_700Bold", fontSize: 17, marginBottom: 10 },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  pickerRowText: { fontFamily: "Inter_500Medium", fontSize: 15 },
});
