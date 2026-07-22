import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readJson, writeJson } from "@/lib/storage";

export interface LocalUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  county: string;
  bio: string;
  avatarColor: string;
  joinedAt: number;
}

interface AuthContextValue {
  user: LocalUser | null;
  allUsers: LocalUser[];
  isLoading: boolean;
  register: (username: string, email: string, password: string, county?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<LocalUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "auth_users_v1";
const SESSION_KEY = "auth_session_v1";

const AVATAR_COLORS = [
  "#3A7BD5", "#6FCF97", "#7C5DB8", "#E07A5F",
  "#E0A800", "#5C97E0", "#27AE60", "#E03E3E",
];

function simpleHash(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [allUsers, setAllUsers] = useState<LocalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      readJson<LocalUser[]>(USERS_KEY, []),
      readJson<string>(SESSION_KEY, ""),
    ]).then(([users, sessionId]) => {
      setAllUsers(users ?? []);
      if (sessionId) {
        const found = (users ?? []).find((u) => u.id === sessionId) ?? null;
        setUser(found);
      }
      setIsLoading(false);
    });
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string, county = "") => {
      const users = await readJson<LocalUser[]>(USERS_KEY, []) ?? [];
      const emailLower = email.trim().toLowerCase();
      if (users.some((u) => u.email === emailLower)) {
        throw new Error("An account with this email already exists.");
      }
      if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
        throw new Error("That username is already taken.");
      }
      const newUser: LocalUser = {
        id: `user-${Date.now()}`,
        username: username.trim(),
        email: emailLower,
        passwordHash: simpleHash(emailLower + password),
        county,
        bio: "",
        avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length]!,
        joinedAt: Date.now(),
      };
      const updated = [...users, newUser];
      await writeJson(USERS_KEY, updated);
      await writeJson(SESSION_KEY, newUser.id);
      setAllUsers(updated);
      setUser(newUser);
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const users = await readJson<LocalUser[]>(USERS_KEY, []) ?? [];
    const emailLower = email.trim().toLowerCase();
    const found = users.find((u) => u.email === emailLower);
    if (!found) throw new Error("No account found with that email.");
    if (found.passwordHash !== simpleHash(emailLower + password)) {
      throw new Error("Incorrect password.");
    }
    await writeJson(SESSION_KEY, found.id);
    setUser(found);
    setAllUsers(users);
  }, []);

  const logout = useCallback(() => {
    writeJson(SESSION_KEY, "");
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<LocalUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      readJson<LocalUser[]>(USERS_KEY, []).then((users) => {
        const next = (users ?? []).map((u) => (u.id === updated.id ? updated : u));
        writeJson(USERS_KEY, next);
        setAllUsers(next);
      });
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, allUsers, isLoading, register, login, logout, updateUser }),
    [user, allUsers, isLoading, register, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
