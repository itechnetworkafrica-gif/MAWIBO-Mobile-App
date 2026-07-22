import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import { uniqueId } from "@/lib/dateUtils";
import { scheduleAppointmentReminders } from "@/lib/pushEngine";

export type AppointmentStatus = "upcoming" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  facility: string;
  county: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: number;
}

interface AppointmentsContextValue {
  appointments: Appointment[];
  ready: boolean;
  book: (
    a: Omit<Appointment, "id" | "status" | "createdAt">,
  ) => Appointment;
  cancel: (id: string) => void;
  upcoming: Appointment[];
  past: Appointment[];
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

function isPast(a: Appointment): boolean {
  const dt = new Date(`${a.date}T${a.time}:00`);
  return dt.getTime() < Date.now();
}

export function AppointmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    readJson<Appointment[]>(STORAGE_KEYS.appointments, []).then((list) => {
      if (!mounted) return;
      setAppointments(list);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) writeJson(STORAGE_KEYS.appointments, appointments);
  }, [appointments, ready]);

  const book = useCallback<AppointmentsContextValue["book"]>((a) => {
    const next: Appointment = {
      ...a,
      id: uniqueId(),
      status: "upcoming",
      createdAt: Date.now(),
    };
    setAppointments((prev) => [next, ...prev]);
    scheduleAppointmentReminders({
      id: next.id,
      doctorName: next.doctorName,
      date: next.date,
      time: next.time,
    }).catch(() => {});
    return next;
  }, []);

  const cancel = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
    );
  }, []);

  const { upcoming, past } = useMemo(() => {
    const u: Appointment[] = [];
    const p: Appointment[] = [];
    appointments.forEach((a) => {
      if (a.status === "upcoming" && !isPast(a)) u.push(a);
      else p.push(a);
    });
    u.sort((x, y) => `${x.date}T${x.time}`.localeCompare(`${y.date}T${y.time}`));
    p.sort((x, y) => y.createdAt - x.createdAt);
    return { upcoming: u, past: p };
  }, [appointments]);

  const value = useMemo(
    () => ({ appointments, ready, book, cancel, upcoming, past }),
    [appointments, ready, book, cancel, upcoming, past],
  );

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments(): AppointmentsContextValue {
  const ctx = useContext(AppointmentsContext);
  if (!ctx)
    throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
}
