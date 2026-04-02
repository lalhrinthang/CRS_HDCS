import { Report } from "@/types/report";

// Yangon townships and their approximate coordinates
const townships = [
  { name: "Dagon", lat: 16.8281, lng: 96.1735 },
  { name: "Botataung", lat: 16.7711, lng: 96.1913 },
  { name: "Pazundaung", lat: 16.7826, lng: 96.1807 },
  { name: "Kyauktada", lat: 16.7775, lng: 96.1608 },
  { name: "Lanmadaw", lat: 16.7839, lng: 96.1477 },
  { name: "Latha", lat: 16.7753, lng: 96.1558 },
  { name: "Tamwe", lat: 16.8167, lng: 96.1917 },
  { name: "Bahan", lat: 16.8167, lng: 96.1583 },
  { name: "Sanchaung", lat: 16.8000, lng: 96.1333 },
  { name: "Kamayut", lat: 16.8208, lng: 96.1347 },
  { name: "Hlaing", lat: 16.8458, lng: 96.1194 },
  { name: "Mayangone", lat: 16.8625, lng: 96.1389 },
  { name: "Insein", lat: 16.8994, lng: 96.1003 },
  { name: "Mingaladon", lat: 16.9333, lng: 96.0833 },
  { name: "Thaketa", lat: 16.7792, lng: 96.2208 },
  { name: "Dawbon", lat: 16.8042, lng: 96.2167 },
  { name: "North Okkalapa", lat: 16.8542, lng: 96.1917 },
  { name: "South Okkalapa", lat: 16.8250, lng: 96.2083 },
  { name: "Thingangyun", lat: 16.8417, lng: 96.1833 },
  { name: "Yankin", lat: 16.8333, lng: 96.1667 },
];

const categories: Report["category"][] = [
  "traffic_accident",
  "fire_incident",
  "explosion",
  "gunfire",
  "protest",
  "arrest_activity",
  "patrol_presence",
  "road_inspection",
  "road_blockage",
  "military_checkpoint",
  "police_checkpoint",
  "traffic_police_checkpoint",
  "forced_conscription_activity",
  "restricted_area",
  "other",
];

const statuses: Report["status"][] = ["active", "archived"];

const reportTitles: Record<Report["category"], string[]> = {
  traffic_accident: [
    "Collision at intersection",
    "Multi-vehicle crash",
    "Vehicle hit pedestrian",
    "Motorcycle accident",
    "Traffic pile-up",
  ],
  fire_incident: [
    "Building fire",
    "Vehicle fire",
    "Grassland fire",
    "Electrical fire",
    "Fire at market",
  ],
  explosion: [
    "Gas cylinder explosion",
    "Industrial explosion",
    "Fireworks explosion",
    "Bomb explosion",
    "Unknown blast",
  ],
  gunfire: [
    "Active gunfire",
    "Shooting incident",
    "Sporadic shots",
    "Crossfire",
    "Armed confrontation",
  ],
  protest: [
    "Street protest",
    "Gathering at street",
    "Group demonstration",
    "Public assembly",
    "Large crowd gathering",
  ],
  arrest_activity: [
    "Police arrest in progress",
    "Mass arrest",
    "Detention at checkpoint",
    "Arrest operation",
    "Suspicious arrest activity",
  ],
  patrol_presence: [
    "Heavy police presence",
    "Military patrol",
    "Armed patrol",
    "Security patrol",
    "Checkpoint patrol",
  ],
  road_inspection: [
    "Road inspection ongoing",
    "Bridge inspection",
    "Safety inspection",
    "Highway inspection",
    "Road maintenance check",
  ],
  road_blockage: [
    "Road blocked by debris",
    "Collapsed section",
    "Damaged road",
    "Fallen tree blocking",
    "Construction blockage",
  ],
  military_checkpoint: [
    "Military checkpoint",
    "Armed checkpoint",
    "Roadblock by military",
    "Military presence",
    "Defense establishment",
  ],
  police_checkpoint: [
    "Police checkpoint",
    "Security checkpoint",
    "Document check point",
    "Police barrier",
    "Police blockade",
  ],
  traffic_police_checkpoint: [
    "Traffic police checkpoint",
    "Road control point",
    "Traffic control",
    "Vehicle inspection point",
    "License check point",
  ],
  forced_conscription_activity: [
    "Forced conscription drive",
    "Military recruitment operation",
    "Conscription squad",
    "Forced enlistment",
    "Recruitment enforcement",
  ],
  restricted_area: [
    "Restricted zone",
    "Closed area",
    "No entry zone",
    "Blocked entrance",
    "Security perimeter",
  ],
  other: [
    "General concern",
    "Miscellaneous incident",
    "Unidentified event",
    "Local incident",
    "Other issue",
  ],
};

const generateRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

const addRandomOffset = (value: number, offset: number): number => {
  return value + (Math.random() - 0.5) * offset;
};

export const generateMockReports = (count: number = 50): Report[] => {
  const reports: Report[] = [];

  for (let i = 0; i < count; i++) {
    const township = townships[Math.floor(Math.random() * townships.length)]!;
    const category = categories[Math.floor(Math.random() * categories.length)]!;
    const titles = reportTitles[category];
    const title = titles[Math.floor(Math.random() * titles.length)]!;
    const status = statuses[Math.floor(Math.random() * statuses.length)]!;
    const createdAt = generateRandomDate(90);

    reports.push({
      id: `report-${i + 1}`,
      title,
      description: `${title} reported in ${township.name} township. Local residents have noticed this issue and it requires attention from the appropriate authorities.`,
      category,
      status,
      latitude: addRandomOffset(township.lat, 0.02),
      longitude: addRandomOffset(township.lng, 0.02),
      township: township.name,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return reports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const mockReports = generateMockReports(50);