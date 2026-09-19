"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Resume } from "@/types/app";

export function useResumes(initialData?: Resume[]) {
  return useQuery({
    queryKey: queryKeys.resumes,
    queryFn: async () => (await fetchJson<{ resumes: Resume[] }>("/api/resumes")).resumes,
    initialData
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await fetchJson<{ resume: Resume }>("/api/resumes", {
        method: "POST",
        body: JSON.stringify(payload)
      })).resume,
    onSuccess: (resume) => {
      queryClient.setQueryData<Resume[]>(queryKeys.resumes, (current) => [resume, ...(current ?? [])]);
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}
