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
      <View style={[styles.bulletDot, { backgroundColor: c.secondary }]} />
      <Text style={[styles.bulletText, { color: c.mutedForeground }]}>{children}</Text>
    </View>
  );
}

function InfoBox({ icon, title, body }: { icon: string; title: string; body: string }) {
  const c = useColors();
  return (
    <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoTitle, { color: c.foreground }]}>{title}</Text>
        <Text style={[styles.infoBody, { color: c.mutedForeground }]}>{body}</Text>
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Privacy Policy" showBack />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBanner, { backgroundColor: "#6FCF9722" }]}>
          <Text style={[styles.heroDate, { color: "#27AE60" }]}>Effective: 1 June 2025</Text>
          <Text style={[styles.heroSub, { color: c.mutedForeground }]}>
            Your privacy matters to us. MAWIBO is built with a privacy-first approach.
          </Text>
        </View>

        <View style={styles.highlightGrid}>
          <InfoBox icon="📱" title="On-Device Only" body="All your data stays on your device. Nothing is uploaded to our servers." />
          <InfoBox icon="🔒" title="No Accounts Required" body="You can use MAWIBO fully without creating an account." />
          <InfoBox icon="🚫" title="No Ads, No Tracking" body="We never show ads or track your behaviour for marketing." />
          <InfoBox icon="🗑️" title="Delete Anytime" body="Reset all data from Settings at any time. Instant and permanent." />
        </View>

        <Section title="1. Information We Collect">
          <Para>
            MAWIBO is designed to collect as little information as possible. Here is what the App stores:
          </Para>
          <Bullet>Profile information you provide voluntarily (name, county, language preference)</Bullet>
          <Bullet>Mood logs, journal entries, and wellness check-in data</Bullet>
          <Bullet>Appointment booking details (doctor name, date, time)</Bullet>
          <Bullet>Community posts and messages (stored locally on your device)</Bullet>
          <Bullet>App preferences (theme, notifications settings)</Bullet>
          <Para>
            All of this data is stored exclusively on your device using AsyncStorage and is never transmitted to MAWIBO servers.
          </Para>
        </Section>

        <Section title="2. Information We Do NOT Collect">
          <Para>We do not collect or store:</Para>
          <Bullet>Your real name (unless you voluntarily provide it)</Bullet>
          <Bullet>Location data or GPS coordinates</Bullet>
          <Bullet>Device identifiers for tracking purposes</Bullet>
          <Bullet>Advertising identifiers (IDFA, GAID)</Bullet>
          <Bullet>Browsing history or behavioural data</Bullet>
          <Bullet>Biometric data</Bullet>
        </Section>

        <Section title="3. AI Features">
          <Para>
            When you use AI-powered features (mood insights, chat, journal analysis, symptom check), your text is sent to our secure AI API endpoint to generate a response. This transmission:
          </Para>
          <Bullet>Uses encrypted HTTPS connections</Bullet>
          <Bullet>Does not include your name or identifiers</Bullet>
          <Bullet>Is not stored on our servers after the response is generated</Bullet>
          <Bullet>Is not used to train AI models</Bullet>
        </Section>

        <Section title="4. Doctor Booking">
          <Para>
            When you book an appointment, the booking details are stored locally on your device only. We do not share your booking information with any third party, including the healthcare providers listed, unless you contact them directly using the contact information provided in the App.
          </Para>
        </Section>

        <Section title="5. Community & Messaging">
          <Para>
            Community posts and direct messages are stored locally on your device. When you post in the community, only the content you choose to share is visible to other users. We encourage users not to share sensitive personal information publicly.
          </Para>
        </Section>

        <Section title="6. Children's Privacy">
          <Para>
            MAWIBO is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe a child has used the App and provided personal information, please contact us to have it removed.
          </Para>
        </Section>

        <Section title="7. Data Deletion">
          <Para>
            You can permanently delete all data stored by MAWIBO at any time by going to Settings → Reset everything. This action is immediate and irreversible.
          </Para>
        </Section>

        <Section title="8. Changes to This Policy">
          <Para>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through in-app notifications. Continued use of the App after changes constitutes acceptance.
          </Para>
        </Section>

        <Section title="9. Contact">
          <Para>
            For privacy-related questions or requests, contact: privacy@mawibo.lr
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
  highlightGrid: { gap: 8, marginBottom: 8 },
  infoBox: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  infoIcon: { fontSize: 24, lineHeight: 32 },
  infoTitle: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 2 },
  infoBody: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  section: { paddingVertical: 12, gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  para: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, flex: 1 },
});
