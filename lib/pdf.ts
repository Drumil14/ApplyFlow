/**
 * Client-side PDF text extraction.
 *
 * Isolated from any React component so the validation is unit-testable and the
 * heavy `pdfjs-dist` library can be mocked in component tests. Extraction runs
 * entirely in the browser — the raw PDF binary is never uploaded or stored.
 */

export const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

/** Pure, synchronous file guard. Returns an error message, or null if valid. */
export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please choose a PDF file.";
  if (file.size > MAX_PDF_BYTES) return "This PDF is larger than the 5 MB limit.";
  return null;
}

/**
 * Extract selectable text from a PDF File, in the browser.
 *
 * `pdfjs-dist` is imported lazily so it stays out of the initial bundle and is
 * only loaded when a user actually extracts a PDF. Throws when the PDF can't be
 * read or contains no selectable text (e.g. a scanned image).
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Version-locked worker asset (bundled by Next, no CDN dependency).
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    text += `${pageText}\n`;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("No selectable text found. This PDF may be a scanned image — try pasting the text instead.");
  }
  return trimmed;
}
