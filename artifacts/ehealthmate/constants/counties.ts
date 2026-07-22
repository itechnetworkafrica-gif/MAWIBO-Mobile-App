export interface County {
  id: string;
  name: string;
  capital: string;
  region: "Coastal" | "Central" | "Northern" | "Southeastern";
}

export const COUNTIES: County[] = [
  { id: "montserrado", name: "Montserrado", capital: "Bensonville", region: "Coastal" },
  { id: "nimba", name: "Nimba", capital: "Sanniquellie", region: "Northern" },
  { id: "bong", name: "Bong", capital: "Gbarnga", region: "Central" },
  { id: "lofa", name: "Lofa", capital: "Voinjama", region: "Northern" },
  { id: "grand-bassa", name: "Grand Bassa", capital: "Buchanan", region: "Coastal" },
  { id: "margibi", name: "Margibi", capital: "Kakata", region: "Coastal" },
  { id: "bomi", name: "Bomi", capital: "Tubmanburg", region: "Coastal" },
  { id: "grand-cape-mount", name: "Grand Cape Mount", capital: "Robertsport", region: "Coastal" },
  { id: "gbarpolu", name: "Gbarpolu", capital: "Bopolu", region: "Northern" },
  { id: "river-cess", name: "River Cess", capital: "Cestos City", region: "Coastal" },
  { id: "sinoe", name: "Sinoe", capital: "Greenville", region: "Southeastern" },
  { id: "grand-gedeh", name: "Grand Gedeh", capital: "Zwedru", region: "Southeastern" },
  { id: "river-gee", name: "River Gee", capital: "Fish Town", region: "Southeastern" },
  { id: "maryland", name: "Maryland", capital: "Harper", region: "Southeastern" },
  { id: "grand-kru", name: "Grand Kru", capital: "Barclayville", region: "Southeastern" },
];

export function getCountyName(id: string | null | undefined): string {
  if (!id) return "All counties";
  return COUNTIES.find((c) => c.id === id)?.name ?? "All counties";
}
