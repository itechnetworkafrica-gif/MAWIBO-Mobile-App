import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { readJson, writeJson } from "@/lib/storage";

// ── Types ─────────────────────────────────────────────────────────────────

export interface LocalUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // empty string for server-auth users
  county: string;
  bio: string;
  avatarColor: string;
  joinedAt: number;
}

interface ServerUser {
  id: string;
  username: string;
  email: string;
  county: string;
  bio: string;
  avatarColor: string;
  joinedAt: number;
}

interface AuthContextValue {
  user: LocalUser | null;
  allUsers: LocalUser[];
  isLoading: boolean;
  register: (
    username: string,
    email: string,
    password: string,
    county?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<LocalUser>) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);
const USERS_KEY = "auth_users_v1";
const TOKEN_KEY = "auth_token_v2";

// ── Helpers ───────────────────────────────────────────────────────────────

function getApiBase(): string {
  // For Vercel / standalone deployments, use explicit API base URL
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (apiBase) return apiBase.replace(/\/$/, "");
  // In Replit dev/production, use the dev domain
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return "";
  return `https://${domain}`;
}

function serverToLocal(su: ServerUser): LocalUser {
  return { ...su, passwordHash: "" };
}

async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed.");
  }
  return data;
}

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [allUsers, setAllUsers] = useState<LocalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [token, localUsers] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          readJson<LocalUser[]>(USERS_KEY, []),
        ]);
        setAllUsers(localUsers ?? []);

        if (token) {
          try {
            const data = await authFetch<{ user: ServerUser }>("/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(serverToLocal(data.user));
          } catch {
            // Token expired or network error — clear it
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch {
        // Storage error — start fresh
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      county = ""
    ) => {
      const data = await authFetch<{ user: ServerUser; token: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ username, email, password, county }),
        }
      );
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      const newUser = serverToLocal(data.user);
      setUser(newUser);
      // Cache in local list for community display
      setAllUsers((prev) => [...prev, newUser]);
      const existing = (await readJson<LocalUser[]>(USERS_KEY, [])) ?? [];
      await writeJson(USERS_KEY, [...existing, newUser]);
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const data = await authFetch<{ user: ServerUser; token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setUser(serverToLocal(data.user));
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<LocalUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // Sync to server in the background (best-effort)
      (async () => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          if (!token) return;
          await authFetch("/api/auth/me", {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              bio: updates.bio,
              county: updates.county,
              avatarColor: updates.avatarColor,
            }),
          });
        } catch {
          // Ignore — local state is already updated
        }
      })();

      // Update local list for community display
      setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, allUsers, isLoading, register, login, logout, updateUser }),
    [user, allUsers, isLoading, register, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
