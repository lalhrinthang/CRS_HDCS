// 1. Define all report categories as a union type

export type ReportCategory =
  | "infrastructure"
  | "environmental"
  | "safety"
  | "health"
  | "traffic"
  | "traffic_police_checkpoint"
  | "police_checkpoint"
  | "military_checkpoint"
  | "forced_conscription"
  | "explosion"
  | "gunfire"
  | "fire_incident"
  | "police_station"
  | "administration_office"
  | "road_under_construction"
  | "traffic_accident";
// 2. Define the Report status
export type ReportStatus = "active" | "verified"| "archived";

// 3. Main Report interface
export interface Report {
  id: string;            // Unique identifier (e.g., "report-1")
  title: string;         // Short description (e.g., "Broken street light")
  description: string;   // Detailed description
  category: ReportCategory;  // One of the 6 categories above
  status: ReportStatus;      // One of the 3 statuses above
  latitude: number;      // GPS latitude (e.g., 16.8281)
  longitude: number;     // GPS longitude (e.g., 96.1735)
  township: string;      // Yangon township name (e.g., "Dagon")
  createdAt: string;     // ISO date string (e.g., "2024-01-15T10:30:00.000Z")
  updatedAt: string;     // ISO date string
  photoUrl?: string;     // Optional — URL or base64 of attached photo
}
// 4. Human-readable category labels for UI display
export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  infrastructure: "Infrastructure",
  environmental: "Environmental",
  safety: "Safety Concern",
  health: "Health Hazard",
  traffic: "Traffic Issue",
  traffic_police_checkpoint: "Traffic Police Checkpoint",
  police_checkpoint: "Police Checkpoint",
  military_checkpoint: "Military Checkpoint",
  forced_conscription: "Forced Conscription",
  explosion: "Explosion",
  gunfire: "Gunfire",
  fire_incident: "Fire Incident",
  police_station: "Police Station",
  administration_office: "Administration Office",
  road_under_construction: "Road Under Construction",
  traffic_accident: "Traffic Accident"
};
// 5. Colors for map makers and chart segments based on category
export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  infrastructure: "hsl(var(--chart-1))",  // Orange-ish
  environmental: "hsl(var(--chart-2))",   // Teal-ish
  safety: "hsl(var(--destructive))",      // Red (danger!)
  health: "hsl(var(--chart-4))",          // Yellow-ish
  traffic: "hsl(var(--chart-5))",         // Orange
  traffic_police_checkpoint: "hsl(var(--chart-3))",  // Blue
  police_checkpoint: "hsl(var(--chart-3))",         // Blue
  military_checkpoint: "hsl(var(--chart-1))",       // Orange
  forced_conscription: "hsl(var(--destructive))",   // Red (danger!)
  explosion: "hsl(var(--destructive))",             // Red (danger!)
  gunfire: "hsl(var(--destructive))",               // Red (danger!)
  fire_incident: "hsl(var(--chart-1))",             // Orange
  police_station: "hsl(var(--chart-3))",            // Blue
  administration_office: "hsl(var(--muted))",       // Gray
  road_under_construction: "hsl(var(--chart-5))",   // Orange
  traffic_accident: "hsl(var(--destructive))",      // Red (danger!)
};
