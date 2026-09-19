import { describe, expect, it } from "vitest";
import { MAX_PDF_BYTES, validatePdfFile } from "@/lib/pdf";

function makeFile(name: string, type: string, size = 1000): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validatePdfFile", () => {
  it("accepts a PDF by MIME type", () => {
    expect(validatePdfFile(makeFile("resume.pdf", "application/pdf"))).toBeNull();
  });

  it("accepts a PDF by extension when the type is missing", () => {
    expect(validatePdfFile(makeFile("resume.PDF", ""))).toBeNull();
  });

  it("rejects a non-PDF file", () => {
    expect(validatePdfFile(makeFile("resume.txt", "text/plain"))).toMatch(/pdf/i);
  });

  it("rejects a PDF over the size limit", () => {
    expect(validatePdfFile(makeFile("big.pdf", "application/pdf", MAX_PDF_BYTES + 1))).toMatch(/5 MB/i);
  });
});
