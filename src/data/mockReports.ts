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
  "infrastructure",
  "environmental",
  "safety",
  "health",
  "traffic",
  "other",
];

const statuses: Report["status"][] = ["active", "verified", "archived"];

const reportTitles: Record<Report["category"], string[]> = {
  infrastructure: [
    "Broken street light",
    "Pothole on main road",
    "Damaged sidewalk",
    "Water pipe leak",
    "Collapsed drainage",
  ],
  environmental: [
    "Illegal dumping site",
    "Air quality concern",
    "Flooded area",
    "Fallen tree blocking path",
    "Contaminated water source",
  ],
  safety: [
    "Unsafe construction site",
    "Missing guardrail",
    "Dangerous electrical wiring",
    "Unsecured manhole",
    "Broken traffic signal",
  ],
  health: [
    "Stagnant water breeding mosquitoes",
    "Unsanitary food stall",
    "Open sewage",
    "Pest infestation area",
    "Medical waste disposal issue",
  ],
  traffic: [
    "Faded road markings",
    "Obscured traffic sign",
    "Congestion hotspot",
    "Pedestrian crossing needed",
    "Broken traffic light",
  ],
  other: [
    "Public facility damage",
    "Noise pollution",
    "Abandoned vehicle",
    "Street vendor obstruction",
    "General safety concern",
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
    const township = townships[Math.floor(Math.random() * townships.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const titles = reportTitles[category];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
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