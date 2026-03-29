// src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ─── Helper: get stored token ───
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

// ─── Generic fetch wrapper ───
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ───
export const authApi = {
  login: (token: string) =>
    apiFetch<{ token: string; user: { id: string; name: string; role: string; township?: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ token }) }
    ),
};

// ─── Reports ───
export interface ApiReport {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  township: { id: string; name: string };
  author: { id: string; name: string };
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const reportsApi = {
  getAll: (params?: { category?: string; status?: string; townshipId?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.status) query.set("status", params.status);
    if (params?.townshipId) query.set("townshipId", params.townshipId);
    const qs = query.toString();
    return apiFetch<ApiReport[]>(`/reports${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => apiFetch<ApiReport>(`/reports/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    township: string; // township name
    latitude: number;
    longitude: number;
    status?: string;
    photoUrl?: string;
  }) =>
    apiFetch<ApiReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { status?: string; title?: string; description?: string }) =>
    apiFetch<ApiReport>(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/reports/${id}`, { method: "DELETE" }),
};

// ─── Townships ───
export interface ApiTownship {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const townshipsApi = {
  getAll: () => apiFetch<ApiTownship[]>("/townships"),
};