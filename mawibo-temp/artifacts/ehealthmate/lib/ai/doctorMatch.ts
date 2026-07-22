import { matchDoctor } from "@/lib/aiClient";
import { offlineDoctorMatch } from "./offline";
import type { DoctorMatch } from "./types";

export async function getDoctorMatch(input: {
  symptoms: string;
  mood?: string;
  county?: string;
  specialties: string[];
}): Promise<DoctorMatch> {
  try {
    return await matchDoctor(input);
  } catch {
    return offlineDoctorMatch(input.symptoms, input.specialties);
  }
}
