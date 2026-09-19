"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { AnalysisResult } from "@/types/app";

export type AnalyzeJobVariables = {
  resumeId: string;
  jobDescription: string;
};

/**
 * Runs a job analysis. Kept as a mutation (not a query) because it's an
 * explicit user action with side effects (it persists an analysis record).
 * Invalidates activity + analysis history so those views refresh.
 */
export function useAnalyzeJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resumeId, jobDescription }: AnalyzeJobVariables) =>
      (await fetchJson<{ analysis: AnalysisResult }>("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ resumeId, jobDescription })
      })).analysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses });
    }
  });
}
