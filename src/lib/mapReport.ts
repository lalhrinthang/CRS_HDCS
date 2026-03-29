// src/lib/mapReport.ts
import type { Report } from "@/types/report";
import type { ApiReport } from "@/lib/api";

export function mapApiReport(r: ApiReport): Report {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as Report["category"],
    status: r.status as Report["status"],
    latitude: r.latitude,
    longitude: r.longitude,
    township: r.township.name,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    photoUrl: r.photoUrl,
  };
}