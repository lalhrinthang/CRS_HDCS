// src/hooks/useReports.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, townshipsApi } from "@/lib/api";
import { toast } from "sonner";

// ─── Fetch all reports ───
export function useReports(filters?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => reportsApi.getAll(filters),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// ─── Fetch all townships ───
export function useTownships() {
  return useQuery({
    queryKey: ["townships"],
    queryFn: () => townshipsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes (rarely changes)
  });
}

// ─── Create a report ───
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create report");
    },
  });
}

// ─── Update report status ───
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string } }) =>
      reportsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update report");
    },
  });
}

// ─── Delete a report ───
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report deleted!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete report");
    },
  });
}