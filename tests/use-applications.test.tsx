import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteApplication, useUpdateApplication } from "@/hooks/use-applications";
import { queryKeys } from "@/lib/queryKeys";
import type { Application } from "@/types/app";

const sampleApp: Application = {
  id: "app-1",
  company: "Stripe",
  role: "Frontend Engineer",
  status: "APPLIED",
  location: null,
  workMode: null,
  salaryMin: null,
  salaryMax: null,
  deadline: null,
  appliedAt: null,
  recruiterName: null,
  recruiterEmail: null,
  notes: null,
  links: [],
  priority: 2,
  resumeId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(queryKeys.applications, [sampleApp]);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

function apps(queryClient: QueryClient) {
  return queryClient.getQueryData<Application[]>(queryKeys.applications) ?? [];
}

afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.restoreAllMocks());

describe("useUpdateApplication", () => {
  it("optimistically applies a status change before the request resolves", async () => {
    // fetch stays pending so we observe the optimistic cache state.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useUpdateApplication(), { wrapper });

    result.current.mutate({ id: "app-1", payload: { status: "INTERVIEW" }, optimisticStatus: "INTERVIEW" });

    await waitFor(() => expect(apps(queryClient)[0].status).toBe("INTERVIEW"));
  });

  it("rolls back to the previous status when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({ message: "nope" }) }))
    );
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useUpdateApplication(), { wrapper });

    result.current.mutate({ id: "app-1", payload: { status: "INTERVIEW" }, optimisticStatus: "INTERVIEW" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apps(queryClient)[0].status).toBe("APPLIED");
  });
});

describe("useDeleteApplication", () => {
  it("optimistically removes the application before the request resolves", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteApplication(), { wrapper });

    result.current.mutate("app-1");

    await waitFor(() => expect(apps(queryClient)).toHaveLength(0));
  });

  it("rolls back the removal when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({ message: "nope" }) }))
    );
    const { queryClient, wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteApplication(), { wrapper });

    result.current.mutate("app-1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apps(queryClient)).toHaveLength(1);
  });
});
