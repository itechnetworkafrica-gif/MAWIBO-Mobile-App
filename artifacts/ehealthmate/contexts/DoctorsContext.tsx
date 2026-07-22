import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { readJson, writeJson } from "@/lib/storage";
import { DOCTORS, type Doctor } from "@/constants/doctors";

const CUSTOM_DOCTORS_KEY = "custom_doctors_v1";

interface DoctorsContextValue {
  allDoctors: Doctor[];
  customDoctors: Doctor[];
  addDoctor: (doc: Doctor) => Promise<void>;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Promise<void>;
  removeDoctor: (id: string) => Promise<void>;
}

const DoctorsContext = createContext<DoctorsContextValue | null>(null);

export function DoctorsProvider({ children }: { children: React.ReactNode }) {
  const [customDoctors, setCustomDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    readJson<Doctor[]>(CUSTOM_DOCTORS_KEY, []).then((d) => setCustomDoctors(d ?? []));
  }, []);

  const persist = useCallback(async (list: Doctor[]) => {
    setCustomDoctors(list);
    await writeJson(CUSTOM_DOCTORS_KEY, list);
  }, []);

  const addDoctor = useCallback(async (doc: Doctor) => {
    await persist([...customDoctors, doc]);
  }, [customDoctors, persist]);

  const updateDoctor = useCallback(async (id: string, updates: Partial<Doctor>) => {
    const updated = customDoctors.map((d) => (d.id === id ? { ...d, ...updates } : d));
    await persist(updated);
  }, [customDoctors, persist]);

  const removeDoctor = useCallback(async (id: string) => {
    await persist(customDoctors.filter((d) => d.id !== id));
  }, [customDoctors, persist]);

  const allDoctors = [...DOCTORS, ...customDoctors];

  return (
    <DoctorsContext.Provider value={{ allDoctors, customDoctors, addDoctor, updateDoctor, removeDoctor }}>
      {children}
    </DoctorsContext.Provider>
  );
}

export function useDoctors() {
  const ctx = useContext(DoctorsContext);
  if (!ctx) throw new Error("useDoctors must be used inside DoctorsProvider");
  return ctx;
}
