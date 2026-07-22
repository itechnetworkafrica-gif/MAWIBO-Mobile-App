import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
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

function Bullet({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: c.primary }]} />
      <Text style={[styles.bulletText, { color: c.mutedForeground }]}>{children}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Terms of Service" showBack />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: c.primarySoft }]}>
          <Text style={[styles.heroDate, { color: c.primary }]}>Effective: 1 June 2025</Text>
          <Text style={[styles.heroSub, { color: c.mutedForeground }]}>
            Please read these terms carefully before using MAWIBO.
          </Text>
        </View>

        <Section title="1. Acceptance of Terms">
          <Para>
            By downloading, installing, or using MAWIBO ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
          </Para>
        </Section>

        <Section title="2. Description of Service">
          <Para>
            MAWIBO is a free mental health and wellness companion designed for users in Liberia. The App provides:
          </Para>
          <Bullet>Mood tracking and journaling tools</Bullet>
          <Bullet>AI-powered wellness suggestions and insights</Bullet>
          <Bullet>A directory of healthcare providers for booking</Bullet>
          <Bullet>A peer support community forum</Bullet>
          <Bullet>Crisis resource information and emergency contacts</Bullet>
        </Section>

        <Section title="3. Not a Medical Service">
          <Para>
            MAWIBO is NOT a substitute for professional medical advice, diagnosis, or treatment. The App is intended for general wellness support only.
          </Para>
          <Para>
            Always seek the advice of a qualified healthcare provider for any medical concerns. In case of emergency, call 911 or your local emergency number immediately.
          </Para>
        </Section>

        <Section title="4. User Responsibilities">
          <Para>By using MAWIBO, you agree to:</Para>
          <Bullet>Provide accurate information when registering or using features</Bullet>
          <Bullet>Use the community respectfully — no harassment, hate speech, or harmful content</Bullet>
          <Bullet>Not misuse the crisis resources or emergency features</Bullet>
          <Bullet>Not attempt to reverse-engineer or tamper with the App</Bullet>
          <Bullet>Be at least 13 years of age to use MAWIBO</Bullet>
        </Section>

        <Section title="5. Community Guidelines">
          <Para>
            Our community forum is a safe space for peer support. We prohibit:
          </Para>
          <Bullet>Content that promotes self-harm, violence, or illegal activity</Bullet>
          <Bullet>Spam, advertisements, or unsolicited promotions</Bullet>
          <Bullet>Sharing of personal information of other users without consent</Bullet>
          <Bullet>Impersonation of healthcare professionals or MAWIBO staff</Bullet>
          <Para>
            Posts violating these guidelines may be removed and accounts may be suspended.
          </Para>
        </Section>

        <Section title="6. Intellectual Property">
          <Para>
            All content, design, and technology in MAWIBO is the property of the MAWIBO development team. You may not copy, distribute, or create derivative works without written permission.
          </Para>
        </Section>

        <Section title="7. Limitation of Liability">
          <Para>
            To the maximum extent permitted by law, MAWIBO and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.
          </Para>
        </Section>

        <Section title="8. Changes to Terms">
          <Para>
            We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify users of material changes through in-app notifications.
          </Para>
        </Section>

        <Section title="9. Governing Law">
          <Para>
            These Terms shall be governed by the laws of the Republic of Liberia. Any disputes shall be resolved through good-faith negotiation before any legal action is taken.
          </Para>
        </Section>

        <Section title="10. Contact">
          <Para>
            For questions about these Terms, contact us at: support@mawibo.lr
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
  heroDate: { fontFamily: "Inter_700Bold", fontSize: 13 },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  section: { paddingVertical: 12, gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  para: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, flex: 1 },
});
