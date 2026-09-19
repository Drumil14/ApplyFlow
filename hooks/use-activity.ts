"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Activity } from "@/types/app";

export function useActivity(initialData?: Activity[]) {
  return useQuery({
    queryKey: queryKeys.activity,
    queryFn: async () => (await fetchJson<{ activities: Activity[] }>("/api/activity")).activities,
    initialData
  });
}
