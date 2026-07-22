import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Header } from "@/components/Header";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: c.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.para, { color: c.mutedForeground }]}>{children}</Text>;
}

function SecurityCard({ icon, title, body, color }: { icon: string; title: string; body: string; color: string }) {
  const c = useColors();
  return (
    <View style={[styles.secCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.secIcon, { backgroundColor: color + "22" }]}>
        <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.secTitle, { color: c.foreground }]}>{title}</Text>
        <Text style={[styles.secBody, { color: c.mutedForeground }]}>{body}</Text>
      </View>
    </View>
  );
}

export default function SecurityScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Security" showBack />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: "#F59E0B22" }]}>
          <Text style={[styles.heroTitle, { color: "#F59E0B" }]}>Security at MAWIBO</Text>
          <Text style={[styles.heroSub, { color: c.mutedForeground }]}>
            We take the security of your personal wellness data seriously. Here is how we protect you.
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          <SecurityCard
            icon="phone-android"
            title="Local-First Storage"
            body="Your data lives only on your device. There is no cloud database storing your personal information."
            color="#3A7BD5"
          />
          <SecurityCard
            icon="lock"
            title="Encrypted Transmission"
            body="All API communication uses HTTPS with TLS 1.3 encryption. Data in transit is always encrypted."
            color="#6FCF97"
          />
          <SecurityCard
            icon="admin-panel-settings"
            title="PIN-Protected Admin"
            body="Admin functions are protected by a PIN code to prevent unauthorised access."
            color="#F59E0B"
          />
          <SecurityCard
            icon="no-encryption"
            title="No Third-Party Sharing"
            body="We never sell, share, or give your data to third parties for advertising or other commercial purposes."
            color="#E07A5F"
          />
          <SecurityCard
            icon="visibility-off"
            title="Anonymous by Default"
            body="No account is required to use most features. You choose how much information to share."
            color="#7C5DB8"
          />
          <SecurityCard
            icon="delete-forever"
            title="Right to Delete"
            body="Delete all your data instantly from Settings → Reset everything. We retain nothing."
            color="#E03E3E"
          />
        </View>

        <Section title="Data at Rest">
          <Para>
            All data stored by MAWIBO uses React Native's AsyncStorage, which is stored in the device's application sandbox. This storage is:
          </Para>
          <Para>• Isolated from other applications on your device</Para>
          <Para>• Protected by the operating system's app sandbox</Para>
          <Para>• Only accessible by the MAWIBO app itself</Para>
          <Para>
            On iOS, AsyncStorage data is protected by the iOS Data Protection framework when the device is locked with a passcode.
          </Para>
        </Section>

        <Section title="AI & API Security">
          <Para>
            When you use AI features, your input is sent to our backend API over an encrypted HTTPS connection. Our API:
          </Para>
          <Para>• Validates and sanitises all inputs</Para>
          <Para>• Does not log or store your personal content</Para>
          <Para>• Uses rate limiting to prevent abuse</Para>
          <Para>• Returns responses without retaining session data</Para>
          <Para>
            The AI model does not receive your name, county, or any identifying information — only the text content you choose to analyse.
          </Para>
        </Section>

        <Section title="Account Security">
          <Para>
            If you choose to create a MAWIBO account (optional), your credentials are stored locally. We recommend:
          </Para>
          <Para>• Using a unique, strong password</Para>
          <Para>• Not sharing your account with others</Para>
          <Para>• Logging out on shared devices</Para>
          <Para>• Using your device's screen lock</Para>
        </Section>

        <Section title="Crisis Data Handling">
          <Para>
            When the App detects possible crisis indicators in text you provide, it may surface emergency contact resources. This detection happens locally and/or through our encrypted API. No crisis flag data is stored or transmitted to third parties.
          </Para>
        </Section>

        <Section title="Vulnerability Reporting">
          <Para>
            If you discover a security vulnerability in MAWIBO, please report it responsibly to: security@mawibo.lr
          </Para>
          <Para>
            We take all security reports seriously and aim to respond within 48 hours. We appreciate responsible disclosure.
          </Para>
        </Section>

        <Section title="Updates">
          <Para>
            We regularly update MAWIBO to address security vulnerabilities and improve protections. We recommend always using the latest version of the App.
          </Para>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 4 },
  heroBanner: { borderRadius: 14, padding: 16, marginBottom: 8, gap: 6 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  cardsGrid: { gap: 8, marginBottom: 8 },
  secCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  secIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  secTitle: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 3 },
  secBody: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  section: { paddingVertical: 12, gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  para: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
});
