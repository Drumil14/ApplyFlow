"use client";

/**
 * Server-state hooks for applications.
 *
 * `useApplications` seeds the cache from server-rendered data (`initialData`)
 * so the first paint has no loading flash, then keeps it fresh through the
 * mutation hooks. Delete is optimistic with rollback; the status-move
 * optimistic path lives in useUpdateApplication (see Kanban).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Application, Status } from "@/types/app";

export function useApplications(initialData?: Application[]) {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: async () => (await fetchJson<{ applications: Application[] }>("/api/applications")).applications,
    initialData
  });
}

type ApplicationPayload = Record<string, unknown>;

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplicationPayload) =>
      (await fetchJson<{ application: Application }>("/api/applications", {
        method: "POST",
        body: JSON.stringify(payload)
      })).application,
    onSuccess: (application) => {
      queryClient.setQueryData<Application[]>(queryKeys.applications, (current) => [
        application,
        ...(current ?? [])
      ]);
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}

export type UpdateApplicationVariables = {
  id: string;
  payload: ApplicationPayload;
  /** Optional optimistic status change (used by the Kanban board). */
  optimisticStatus?: Status;
};

type UpdateContext = { previous?: Application[] };

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation<Application, Error, UpdateApplicationVariables, UpdateContext>({
    mutationFn: async ({ id, payload }) =>
      (await fetchJson<{ application: Application }>(`/api/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      })).application,
    // Optimistic update: apply the change to the cache immediately, remember the
    // previous state so we can roll back if the request fails.
    onMutate: async ({ id, optimisticStatus }) => {
      if (!optimisticStatus) return {};
      await queryClient.cancelQueries({ queryKey: queryKeys.applications });
      const previous = queryClient.getQueryData<Application[]>(queryKeys.applications);
      queryClient.setQueryData<Application[]>(queryKeys.applications, (current) =>
        (current ?? []).map((app) => (app.id === id ? { ...app, status: optimisticStatus } : app))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.applications, context.previous);
      }
    },
    onSuccess: (application) => {
      queryClient.setQueryData<Application[]>(queryKeys.applications, (current) =>
        (current ?? []).map((app) => (app.id === application.id ? application : app))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}

type DeleteContext = { previous?: Application[] };

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: async (id: string) => {
      await fetchJson<{ ok: true }>(`/api/applications/${id}`, { method: "DELETE" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.applications });
      const previous = queryClient.getQueryData<Application[]>(queryKeys.applications);
      queryClient.setQueryData<Application[]>(queryKeys.applications, (current) =>
        (current ?? []).filter((app) => app.id !== id)
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.applications, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}
