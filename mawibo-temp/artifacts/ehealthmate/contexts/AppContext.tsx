import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import type { LangCode } from "@/constants/translations";

export type ThemeMode = "system" | "light" | "dark";

export interface UserProfile {
  name: string;
  bio: string;
  county: string | null;
  language: LangCode;
  goals: string[];
  hasOnboarded: boolean;
  anonymous: boolean;
  themeMode: ThemeMode;
  notifications: boolean;
  notifBadge: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  bio: "",
  county: null,
  language: "en",
  goals: [],
  hasOnboarded: false,
  anonymous: true,
  themeMode: "dark",
  notifications: true,
  notifBadge: 2,
};

interface AppContextValue {
  profile: UserProfile;
  ready: boolean;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    readJson<UserProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE).then((p) => {
      if (!mounted) return;
      setProfile({ ...DEFAULT_PROFILE, ...p });
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      writeJson(STORAGE_KEYS.profile, profile);
    }
  }, [profile, ready]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setProfile((p) => ({ ...p, hasOnboarded: true }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
  }, []);

  const value = useMemo(
    () => ({ profile, ready, updateProfile, completeOnboarding, resetProfile }),
    [profile, ready, updateProfile, completeOnboarding, resetProfile],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
