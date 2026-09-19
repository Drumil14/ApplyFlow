import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddResumeDialog } from "@/components/dashboard/AddResumeDialog";

const createdResume = {
  id: "r2",
  title: "Backend Resume",
  versionTag: "v1",
  fileName: "backend-resume.txt",
  targetRole: null,
  skills: ["node", "postgresql"],
  score: 0,
  interviews: 0,
  offers: 0,
  rejections: 0,
  createdAt: "2026-02-01T00:00:00.000Z"
};

function renderDialog() {
  const onClose = vi.fn();
  const onCreated = vi.fn();
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  render(createElement(AddResumeDialog, { open: true, onClose, onCreated }), { wrapper });
  return { onClose, onCreated };
}

afterEach(() => vi.unstubAllGlobals());
beforeEach(() => vi.restoreAllMocks());

describe("AddResumeDialog", () => {
  it("opens as a labeled dialog", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /add resume/i })).toBeInTheDocument();
  });

  it("switches between upload and paste modes", async () => {
    const user = userEvent.setup();
    renderDialog();

    // Default: upload mode shows a choose-file control.
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /paste text/i }));
    expect(screen.getByLabelText(/resume text/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /upload pdf/i }));
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
  });

  it("rejects an unsupported file type", async () => {
    renderDialog();

    // fireEvent.change sets files directly, bypassing the input's accept filter
    // so we can exercise the client-side validation path.
    const input = screen.getByLabelText(/choose a pdf resume/i);
    fireEvent.change(input, { target: { files: [new File(["hi"], "resume.txt", { type: "text/plain" })] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/please choose a pdf file/i);
  });

  it("creates a pasted-text resume and reports success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ resume: createdResume }) }))
    );
    const user = userEvent.setup();
    const { onCreated, onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: /paste text/i }));
    await user.type(screen.getByLabelText(/resume text/i), "Backend engineer with Node.js and PostgreSQL.");
    await user.type(screen.getByLabelText(/^title$/i), "Backend Resume");
    await user.click(screen.getByRole("button", { name: /save & use resume/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdResume));
    expect(onClose).toHaveBeenCalled();
  });

  it("surfaces an API error without closing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({ message: "Resume title and file name are required." }) }))
    );
    const user = userEvent.setup();
    const { onCreated, onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: /paste text/i }));
    await user.type(screen.getByLabelText(/resume text/i), "Some resume text.");
    await user.type(screen.getByLabelText(/^title$/i), "Broken Resume");
    await user.click(screen.getByRole("button", { name: /save & use resume/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/title and file name are required/i);
    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
