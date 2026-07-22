import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProviders } from "@/contexts/AppProviders";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { DrawerMenu } from "@/components/DrawerMenu";
import { configureNotificationHandler, ensureDailyCheckInReminder, ensurePushPermission } from "@/lib/pushEngine";

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

const queryClient = new QueryClient();

function OnboardingGate() {
  const { profile, ready } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const seg = segments[0] as string | undefined;
    const inOnboarding = seg === "onboarding";
    if (!profile.hasOnboarded && !inOnboarding) {
      router.replace("/onboarding");
    } else if (profile.hasOnboarded && inOnboarding) {
      router.replace("/");
    }
  }, [profile.hasOnboarded, ready, segments, router]);

  useEffect(() => {
    if (!ready || !profile.hasOnboarded) return;
    ensurePushPermission()
      .then((granted) => {
        if (granted) ensureDailyCheckInReminder().catch(() => {});
      })
      .catch(() => {});
  }, [ready, profile.hasOnboarded]);

  return null;
}

function ThemedStatusBar() {
  const c = useColors();
  const isDark = c.background === "#0E1420";
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="doctor/[id]"
        options={{ title: "Doctor", presentation: "card" }}
      />
      <Stack.Screen name="appointments" options={{ title: "Appointments" }} />
      <Stack.Screen name="journal" options={{ title: "Journal" }} />
      <Stack.Screen name="breathing" options={{ title: "Breathing" }} />
      <Stack.Screen name="meditation" options={{ title: "Meditation" }} />
      <Stack.Screen name="sleep-sounds" options={{ title: "Sleep sounds" }} />
      <Stack.Screen name="stress-tips" options={{ title: "Stress tips" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="symptom-check" options={{ title: "AI Symptom Check" }} />
      <Stack.Screen name="affirmations" options={{ title: "Daily Affirmation" }} />
      <Stack.Screen name="mood-insights" options={{ title: "Mood Insights" }} />
      <Stack.Screen name="sleep-coach" options={{ title: "AI Sleep Coach" }} />
      <Stack.Screen name="smart-match" options={{ title: "Smart Doctor Match" }} />
      <Stack.Screen name="daily-checkin" options={{ title: "Daily Check-in" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProviders>
                <ThemedStatusBar />
                <OnboardingGate />
                <RootLayoutNav />
                <DrawerMenu />
              </AppProviders>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
