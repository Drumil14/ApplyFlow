"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { useCreateResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { extractPdfText, validatePdfFile } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/app";

type Mode = "upload" | "paste";

export function AddResumeDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (resume: Resume) => void;
}) {
  const createResume = useCreateResume();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ids = useId();

  const [mode, setMode] = useState<Mode>("upload");
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [versionTag, setVersionTag] = useState("v1");
  const [targetRole, setTargetRole] = useState("");
  const [formError, setFormError] = useState("");

  const reset = () => {
    setMode("upload");
    setFileName("");
    setExtracting(false);
    setExtractError("");
    setExtractedText("");
    setPastedText("");
    setTitle("");
    setVersionTag("v1");
    setTargetRole("");
    setFormError("");
  };

  // Escape to close + move focus into the dialog on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("button, input, textarea")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setExtractError("");
    setExtractedText("");
    const invalid = validatePdfFile(file);
    if (invalid) {
      setFileName("");
      setExtractError(invalid);
      return;
    }
    setFileName(file.name);
    setExtracting(true);
    try {
      const text = await extractPdfText(file);
      setExtractedText(text);
      if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : "We couldn't read this PDF. Try another file or paste the text.");
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const contentText = mode === "upload" ? extractedText : pastedText;
  const canSave = Boolean(title.trim()) && Boolean(versionTag.trim()) && Boolean(contentText.trim()) && !extracting;

  const save = () => {
    setFormError("");
    if (!title.trim()) return setFormError("Give this resume a title.");
    if (!contentText.trim()) {
      return setFormError(mode === "upload" ? "Add a PDF with selectable text first." : "Paste your resume text first.");
    }

    const derivedFileName = mode === "upload" && fileName ? fileName : `${title.trim().toLowerCase().replace(/\s+/g, "-")}.txt`;

    createResume.mutate(
      {
        title: title.trim(),
        versionTag: versionTag.trim() || "v1",
        fileName: derivedFileName,
        targetRole: targetRole.trim() || undefined,
        contentText
      },
      {
        onSuccess: (resume) => {
          toast.success("Resume added");
          onCreated(resume);
          reset();
          onClose();
        },
        onError: (error) => setFormError(error.message || "Could not save this resume.")
      }
    );
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={closeAndReset}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${ids}-title`}
            className="panel mx-auto my-8 max-w-lg rounded-lg border border-hairline p-5 shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 id={`${ids}-title`} className="text-xl font-semibold">
                  Add resume
                </h2>
                <p className="mt-1 text-sm text-content-secondary">
                  Upload a PDF or paste text. It&apos;s saved to your workspace and used for matching.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAndReset}
                aria-label="Close"
                className="rounded-md p-2 text-content-tertiary outline-none transition-colors hover:bg-surface-hover hover:text-content focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode switch */}
            <div className="mb-4 inline-flex rounded-md border border-hairline bg-surface-inset p-0.5" role="group" aria-label="Resume input mode">
              {(["upload", "paste"] as Mode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
                    mode === value ? "bg-accent text-accent-fg" : "text-content-secondary hover:text-content"
                  )}
                >
                  {value === "upload" ? "Upload PDF" : "Paste text"}
                </button>
              ))}
            </div>

            {mode === "upload" ? (
              <div className="space-y-3">
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDrop}
                  className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-hairline-strong bg-surface-inset px-4 py-6 text-center"
                >
                  <Upload className="h-5 w-5 text-content-tertiary" aria-hidden="true" />
                  <p className="text-sm text-content-secondary">Drag a PDF here, or</p>
                  {/* Visually-hidden but focusable input, driven by the button below. */}
                  <input
                    ref={fileInputRef}
                    id={`${ids}-file`}
                    type="file"
                    accept="application/pdf"
                    aria-label="Choose a PDF resume"
                    className="sr-only"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose file
                  </Button>
                  <p className="text-xs text-content-tertiary">PDF only · up to 5 MB</p>
                </div>

                {fileName ? (
                  <div className="flex items-center gap-2 text-sm text-content-secondary">
                    <FileText className="h-4 w-4 shrink-0 text-content-tertiary" aria-hidden="true" />
                    <span className="truncate">{fileName}</span>
                  </div>
                ) : null}

                {extracting ? (
                  <div className="flex items-center gap-2 text-sm text-content-secondary" aria-live="polite">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Extracting text…
                  </div>
                ) : null}

                {extractError ? (
                  <p role="alert" className="rounded-md border border-status-rose/30 bg-status-rose/10 p-3 text-sm text-status-rose">
                    {extractError}
                  </p>
                ) : null}

                {extractedText ? (
                  <div>
                    <label htmlFor={`${ids}-preview`} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-content-tertiary">
                      Extracted text preview
                    </label>
                    <Textarea
                      id={`${ids}-preview`}
                      readOnly
                      value={extractedText}
                      className="min-h-32 bg-surface-inset text-content-secondary"
                    />
                  </div>
                ) : null}

                <p className="text-xs text-content-tertiary">
                  PDF files are processed locally in your browser and are not uploaded. The extracted text is saved to your
                  ApplyFlow workspace for skill matching.
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor={`${ids}-paste`} className="mb-1.5 block text-sm font-medium">
                  Resume text
                </label>
                <Textarea
                  id={`${ids}-paste`}
                  value={pastedText}
                  onChange={(event) => setPastedText(event.target.value)}
                  placeholder="Paste your resume text here…"
                  className="min-h-40"
                />
                <p className="mt-2 text-xs text-content-tertiary">
                  Saved to your ApplyFlow workspace for skill matching.
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium">Title</span>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Frontend Resume" />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium">Version tag</span>
                <Input value={versionTag} onChange={(event) => setVersionTag(event.target.value)} placeholder="v1" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium">Target role <span className="font-normal text-content-tertiary">(optional)</span></span>
                <Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Frontend Engineer" />
              </label>
            </div>

            {formError ? (
              <p role="alert" className="mt-3 text-sm text-status-rose">
                {formError}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeAndReset}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={save}
                disabled={!canSave || createResume.isPending}
                icon={createResume.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              >
                Save &amp; use resume
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
