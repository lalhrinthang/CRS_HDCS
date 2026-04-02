// 1. Define all report categories as a union type

export type ReportCategory =
  | "traffic_accident"
  | "fire_incident"
  | "explosion"
  | "gunfire"
  | "protest"
  | "arrest_activity"
  | "patrol_presence"
  | "road_inspection"
  | "road_blockage"
  | "military_checkpoint"
  | "police_checkpoint"
  | "traffic_police_checkpoint"
  | "forced_conscription_activity"
  | "restricted_area"
  | "other";
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
  traffic_accident: "Traffic Accident",
  fire_incident: "Fire Incident",
  explosion: "Explosion",
  gunfire: "Gunfire",
  protest: "Protest",
  arrest_activity: "Arrest Activity",
  patrol_presence: "Patrol Presence",
  road_inspection: "Road Inspection",
  road_blockage: "Road Blockage",
  military_checkpoint: "Military Checkpoint",
  police_checkpoint: "Police Checkpoint",
  traffic_police_checkpoint: "Traffic Police Checkpoint",
  forced_conscription_activity: "Forced Conscription Activity",
  restricted_area: "Restricted Area",
  other: "Other",
};
// 5. Colors for map makers and chart segments based on category
export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  traffic_accident: "hsl(var(--destructive))",           // Red (danger!)
  fire_incident: "hsl(var(--chart-1))",                  // Orange
  explosion: "hsl(var(--destructive))",                  // Red (danger!)
  gunfire: "hsl(var(--destructive))",                    // Red (danger!)
  protest: "hsl(var(--chart-1))",                        // Orange
  arrest_activity: "hsl(var(--destructive))",            // Red (danger!)
  patrol_presence: "hsl(var(--chart-3))",                // Blue
  road_inspection: "hsl(var(--chart-4))",                // Yellow-ish
  road_blockage: "hsl(var(--chart-1))",                  // Orange
  military_checkpoint: "hsl(var(--chart-3))",            // Blue
  police_checkpoint: "hsl(var(--chart-3))",              // Blue
  traffic_police_checkpoint: "hsl(var(--chart-3))",      // Blue
  forced_conscription_activity: "hsl(var(--destructive))", // Red (danger!)
  restricted_area: "hsl(var(--chart-1))",                // Orange
  other: "hsl(var(--muted))",                            // Gray
};
