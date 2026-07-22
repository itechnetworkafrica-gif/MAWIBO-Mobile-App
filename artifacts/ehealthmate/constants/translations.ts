export type LangCode =
  | "en"
  | "en-simple"
  | "bassa"
  | "kpelle"
  | "grebo"
  | "vai"
  | "mano"
  | "kru"
  | "krahn";

export interface LanguageOption {
  code: LangCode;
  name: string;
  english: string;
  available: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", english: "English", available: true },
  {
    code: "en-simple",
    name: "Simple English",
    english: "Simple English",
    available: true,
  },
  { code: "bassa", name: "Bassa", english: "Bassa", available: false },
  { code: "kpelle", name: "Kpelle", english: "Kpelle", available: false },
  { code: "grebo", name: "Grebo", english: "Grebo", available: false },
  { code: "vai", name: "Vai", english: "Vai", available: false },
  { code: "mano", name: "Mano", english: "Mano", available: false },
  { code: "kru", name: "Kru", english: "Kru", available: false },
  { code: "krahn", name: "Krahn", english: "Krahn", available: false },
];

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "common.continue": "Continue",
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.skip": "Skip",
  "common.done": "Done",
  "common.search": "Search",
  "common.county": "County",
  "common.specialty": "Specialty",
  "common.all": "All",
  "common.loading": "Loading",
  "common.retry": "Try again",
  "common.offline": "You are offline. Some features need internet.",

  "tabs.home": "Home",
  "tabs.ai": "AI Mate",
  "tabs.book": "Book",
  "tabs.tools": "Tools",
  "tabs.support": "Support",

  "onboarding.welcome": "Welcome to eHealthMate",
  "onboarding.tagline":
    "Your trusted mental health and care companion built for Liberia.",
  "onboarding.goals.title": "What brings you here today?",
  "onboarding.goals.subtitle": "Pick anything that fits. You can change later.",
  "onboarding.county.title": "Where are you located?",
  "onboarding.county.subtitle":
    "We use this to find clinics and doctors near you.",
  "onboarding.lang.title": "Choose your language",
  "onboarding.lang.subtitle":
    "More tribal languages are coming soon. English is always available.",
  "onboarding.privacy.title": "Your privacy matters",
  "onboarding.privacy.body":
    "Your journal entries and mood history stay on your phone. We never share personal data without your permission. You can use the app anonymously.",
  "onboarding.start": "Start using eHealthMate",

  "home.greeting.morning": "Good morning",
  "home.greeting.afternoon": "Good afternoon",
  "home.greeting.evening": "Good evening",
  "home.subtitle": "How are you feeling today?",
  "home.actions": "Quick actions",
  "home.insight": "Your daily insight",
  "home.streak": "Check-in streak",
  "home.appointments": "Upcoming",
  "home.appointments.empty": "No upcoming visits.",

  "ai.title": "AI Mate",
  "ai.subtitle": "A safe space to talk. Not a doctor.",
  "ai.placeholder": "Type how you feel",
  "ai.simplify": "Simple English",
  "ai.empty.title": "I'm here whenever you need to talk",
  "ai.empty.body":
    "Share what is on your mind. I'll listen, offer support, and suggest small steps you can take today.",
  "ai.crisis.title": "We're worried about you",
  "ai.crisis.body":
    "If you are in immediate danger, please reach out for help right now. You are not alone.",
  "ai.error": "I couldn't reach the network. Please check your connection.",

  "book.title": "Find a doctor",
  "book.subtitle": "Doctors across all 15 counties of Liberia.",
  "book.empty": "No doctors match your filters.",
  "book.book": "Book",
  "book.confirm": "Confirm booking",
  "book.success.title": "Booking confirmed",
  "book.success.body": "We saved your appointment. We'll remind you closer to the date.",
  "book.appointments": "My appointments",
  "book.upcoming": "Upcoming",
  "book.past": "Past",
  "book.cancel.button": "Cancel booking",

  "tools.title": "Wellness tools",
  "tools.subtitle": "Practical things that help when life feels hard.",

  "support.title": "Support and emergencies",
  "support.subtitle": "Help is available across Liberia. You are not alone.",
  "support.call": "Call now",

  "journal.title": "Journal",
  "journal.placeholder": "Write what is on your mind...",
  "journal.save": "Save entry",
  "journal.summary": "Get an AI summary",
  "journal.empty": "Your journal is private. Write your first entry below.",
};

const enSimple: Dictionary = {
  ...en,
  "onboarding.welcome": "Welcome",
  "onboarding.tagline": "We are here to help you feel better.",
  "onboarding.goals.title": "Why are you here?",
  "onboarding.goals.subtitle": "Pick what feels right.",
  "onboarding.county.title": "Where do you live?",
  "onboarding.county.subtitle": "We use this to find help near you.",
  "onboarding.lang.title": "Pick your language",
  "onboarding.lang.subtitle": "More languages are coming.",
  "onboarding.privacy.title": "Your story is yours",
  "onboarding.privacy.body":
    "Your notes stay on your phone. We do not share. You can use this app without your name.",
  "ai.empty.title": "I am here to listen",
  "ai.empty.body": "Tell me how you feel. I will listen and help.",
  "home.subtitle": "How do you feel today?",
};

const tribalPlaceholder: Dictionary = {
  ...en,
  "common.offline":
    "You are offline. (English shown — local language coming soon.)",
};

const dictionaries: Record<LangCode, Dictionary> = {
  en,
  "en-simple": enSimple,
  bassa: tribalPlaceholder,
  kpelle: tribalPlaceholder,
  grebo: tribalPlaceholder,
  vai: tribalPlaceholder,
  mano: tribalPlaceholder,
  kru: tribalPlaceholder,
  krahn: tribalPlaceholder,
};

export function translate(lang: LangCode, key: string): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}
