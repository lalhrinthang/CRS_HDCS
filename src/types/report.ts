// 1. Define all report categories as a union type

export type ReportCategory =
  | "infrastructure"
  | "environmental"
  | "safety"
  | "health"
  | "traffic"
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
  infrastructure: "Infrastructure",
  environmental: "Environmental",
  safety: "Safety Concern",
  health: "Health Hazard",
  traffic: "Traffic Issue",
  other: "Other",
};
// 5. Colors for map makers and chart segments based on category
export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  infrastructure: "hsl(var(--chart-1))",  // Orange-ish
  environmental: "hsl(var(--chart-2))",   // Teal-ish
  safety: "hsl(var(--destructive))",      // Red (danger!)
  health: "hsl(var(--chart-4))",          // Yellow-ish
  traffic: "hsl(var(--chart-5))",         // Orange
  other: "hsl(var(--muted))",             // Gray
};
