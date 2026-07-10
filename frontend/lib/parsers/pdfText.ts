import "./polyfill";
import { PDFParse, PasswordException } from "pdf-parse";

export class PdfOpenError extends Error {
  readonly code: "password_required" | "wrong_password" | "parse_failed";

  constructor(
    message: string,
    code: "password_required" | "wrong_password" | "parse_failed"
  ) {
    super(message);
    this.name = "PdfOpenError";
    this.code = code;
  }
}

const PASSWORD_HINT =
  "This PDF is password-protected. Enter the password (often your PAN in capitals, or the password shown on the download page).";

function isPasswordRelatedError(error: unknown): boolean {
  if (error instanceof PasswordException) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("password") ||
      msg.includes("encrypted") ||
      msg.includes("decrypt")
    );
  }
  return false;
}

/**
 * Extract plain text from a PDF buffer. Pass `password` for AIS / TIS / Form 16 locks.
 */
export async function extractPdfText(
  buffer: Buffer,
  password?: string
): Promise<string> {
  let parser: PDFParse | undefined;
  try {
    parser = new PDFParse({
      data: buffer,
      ...(password ? { password } : {}),
    });
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } catch (error) {
    if (isPasswordRelatedError(error)) {
      throw new PdfOpenError(
        password ? "Wrong PDF password — try again." : PASSWORD_HINT,
        password ? "wrong_password" : "password_required"
      );
    }
    throw new PdfOpenError(
      "Unable to read this PDF. Prefer a text-based download from the Income Tax / broker portal.",
      "parse_failed"
    );
  } finally {
    await parser?.destroy();
  }
}

/** Heuristic: ITD "JSON" downloads are often encrypted blobs, not parseable JSON. */
export function looksLikeEncryptedItdBlob(bytes: Buffer): boolean {
  const head = bytes.subarray(0, 80).toString("latin1");
  if (head.trimStart().startsWith("{") || head.trimStart().startsWith("[")) {
    return false;
  }
  // Hex-ish prefix then binary/base64 — typical Compliance Portal encrypted export
  return /^[0-9a-f]{32,}/i.test(head.replace(/\s/g, ""));
}
