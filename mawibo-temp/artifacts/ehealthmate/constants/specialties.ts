export interface Specialty {
  id: string;
  name: string;
  icon: string;
}

export const SPECIALTIES: Specialty[] = [
  { id: "general", name: "General Practice", icon: "local-hospital" },
  { id: "mental-health", name: "Mental Health", icon: "psychology" },
  { id: "pediatrics", name: "Pediatrics", icon: "child-care" },
  { id: "obgyn", name: "OB / GYN", icon: "people" },
  { id: "internal", name: "Internal Medicine", icon: "favorite" },
  { id: "dental", name: "Dental", icon: "health-and-safety" },
  { id: "dermatology", name: "Dermatology", icon: "spa" },
  { id: "cardiology", name: "Cardiology", icon: "monitor-heart" },
  { id: "neurology", name: "Neurology", icon: "psychology-alt" },
  { id: "nutrition", name: "Nutrition", icon: "restaurant" },
];

export function getSpecialtyName(id: string | null | undefined): string {
  if (!id) return "All specialties";
  return SPECIALTIES.find((s) => s.id === id)?.name ?? "All specialties";
}
