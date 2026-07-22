import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_REMINDER_ID_KEY = "mawibo_daily_reminder_id_v1";
const PERMISSION_ASKED_KEY = "mawibo_push_permission_asked_v1";

let handlerConfigured = false;

export function configureNotificationHandler(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePushPermission(): Promise<boolean> {
  try {
    const already = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
    const current = await Notifications.getPermissionsAsync();
    if ((current.status as string) === "granted") return true;
    if (already && (current.status as string) !== "granted") return false;
    await AsyncStorage.setItem(PERMISSION_ASKED_KEY, "1");
    const result = await Notifications.requestPermissionsAsync();
    return (result.status as string) === "granted";
  } catch {
    return false;
  }
}

async function safeSchedule(
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput | null,
): Promise<string | null> {
  try {
    const granted = await ensurePushPermission();
    if (!granted) return null;
    return await Notifications.scheduleNotificationAsync({ content, trigger });
  } catch {
    return null;
  }
}

/** Fire an immediate device notification reflecting something that just happened in-app. */
export async function notifyNow(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
  await safeSchedule({ title, body, data, sound: Platform.OS === "web" ? undefined : "default" }, null);
}

/** Crisis / high risk — always try to reach the user even if the app is backgrounded. */
export async function notifyRiskAlert(guidance: string): Promise<void> {
  await notifyNow("We are here for you", guidance || "Your recent mood check-ins suggest a hard stretch. Tap for support.", {
    kind: "risk",
    route: "/(tabs)/support",
  });
}

/** Streak milestones — positive reinforcement, sent every multiple of 3 days. */
export async function notifyStreakMilestone(streak: number): Promise<void> {
  if (streak <= 0 || streak % 3 !== 0) return;
  await notifyNow(
    `${streak}-day streak! \u{1F525}`,
    "You have checked in on your wellbeing for " + streak + " days straight. Keep going — small steps add up.",
    { kind: "streak", route: "/(tabs)" },
  );
}

/** Appointment booked — schedule a reminder ~1 hour before, and the morning of. */
export async function scheduleAppointmentReminders(params: {
  id: string;
  doctorName: string;
  date: string;
  time: string;
}): Promise<void> {
  const target = new Date(`${params.date}T${params.time}:00`);
  if (Number.isNaN(target.getTime())) return;

  const oneHourBefore = new Date(target.getTime() - 60 * 60 * 1000);
  if (oneHourBefore.getTime() > Date.now()) {
    await safeSchedule(
      {
        title: "Appointment in 1 hour",
        body: `Your appointment with ${params.doctorName} is coming up at ${params.time}.`,
        data: { kind: "appointment", route: "/appointments" },
      },
      { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneHourBefore },
    );
  }

  const morningOf = new Date(target);
  morningOf.setHours(8, 0, 0, 0);
  if (morningOf.getTime() > Date.now() && morningOf.getTime() < target.getTime()) {
    await safeSchedule(
      {
        title: "Appointment today",
        body: `You see ${params.doctorName} today at ${params.time}. We will remind you again beforehand.`,
        data: { kind: "appointment", route: "/appointments" },
      },
      { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morningOf },
    );
  }
}

/** Ensure a single repeating evening check-in reminder exists; cheap to call on every app start. */
export async function ensureDailyCheckInReminder(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(DAILY_REMINDER_ID_KEY);
    if (existingId) {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      if (scheduled.some((s) => s.identifier === existingId)) return;
    }
    const id = await safeSchedule(
      {
        title: "How was your day?",
        body: "Take 30 seconds to log your mood and get a personalised AI check-in.",
        data: { kind: "checkin", route: "/daily-checkin" },
      },
      { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
    );
    if (id) await AsyncStorage.setItem(DAILY_REMINDER_ID_KEY, id);
  } catch {
    // silently ignore — reminders are a nice-to-have, never block the app
  }
}

/** Elevated mood insight (not crisis level) — gentler nudge toward tools. */
export async function notifyElevatedInsight(guidance: string): Promise<void> {
  await notifyNow("A gentle nudge", guidance || "Your mood pattern this week suggests some extra care could help.", {
    kind: "insight",
    route: "/(tabs)/tools",
  });
}
