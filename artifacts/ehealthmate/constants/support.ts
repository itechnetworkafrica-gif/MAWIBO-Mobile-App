export interface SupportContact {
  id: string;
  name: string;
  description: string;
  phone: string;
  type: "emergency" | "ngo" | "clinic";
  county?: string;
  icon: string;
}

export const SUPPORT_CONTACTS: SupportContact[] = [
  {
    id: "police",
    name: "Liberia National Police",
    description: "Emergency response across Liberia",
    phone: "911",
    type: "emergency",
    icon: "local-police",
  },
  {
    id: "fire",
    name: "National Fire Service",
    description: "Fire and rescue emergencies",
    phone: "911",
    type: "emergency",
    icon: "local-fire-department",
  },
  {
    id: "ambulance",
    name: "National Ambulance Service",
    description: "Medical emergency transport",
    phone: "4455",
    type: "emergency",
    icon: "medical-services",
  },
  {
    id: "carter-mh",
    name: "The Carter Center Mental Health Program",
    description: "Mental health support and referrals",
    phone: "+231-77-000-2200",
    type: "ngo",
    icon: "psychology",
  },
  {
    id: "msf",
    name: "Médecins Sans Frontières (MSF) Liberia",
    description: "Free medical care and outreach",
    phone: "+231-77-053-0911",
    type: "ngo",
    icon: "volunteer-activism",
  },
  {
    id: "wash-united",
    name: "Wellness Liberia",
    description: "Counseling and family support",
    phone: "+231-88-555-1010",
    type: "ngo",
    icon: "groups",
  },
  {
    id: "jfk",
    name: "JFK Memorial Medical Center",
    description: "Monrovia, Montserrado",
    phone: "+231-77-700-0001",
    type: "clinic",
    county: "montserrado",
    icon: "local-hospital",
  },
  {
    id: "phebe",
    name: "Phebe Hospital",
    description: "Suakoko, Bong County",
    phone: "+231-88-866-0123",
    type: "clinic",
    county: "bong",
    icon: "local-hospital",
  },
  {
    id: "ganta",
    name: "Ganta United Methodist Hospital",
    description: "Ganta, Nimba County",
    phone: "+231-88-865-2200",
    type: "clinic",
    county: "nimba",
    icon: "local-hospital",
  },
  {
    id: "tellewoyan",
    name: "Tellewoyan Memorial Hospital",
    description: "Voinjama, Lofa County",
    phone: "+231-88-855-1100",
    type: "clinic",
    county: "lofa",
    icon: "local-hospital",
  },
  {
    id: "buchanan",
    name: "Liberia Government Hospital, Buchanan",
    description: "Buchanan, Grand Bassa",
    phone: "+231-88-877-3300",
    type: "clinic",
    county: "grand-bassa",
    icon: "local-hospital",
  },
  {
    id: "harper",
    name: "J.J. Dossen Memorial Hospital",
    description: "Harper, Maryland County",
    phone: "+231-88-822-4400",
    type: "clinic",
    county: "maryland",
    icon: "local-hospital",
  },
];
