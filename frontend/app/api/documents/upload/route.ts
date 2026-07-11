import { NextRequest, NextResponse } from "next/server";
import {
  Form16PdfOpenError,
  parseForm16MultiPart,
  scrubPanFromLogMessage,
} from "@/lib/parsers/form16";
import { isKnownConnector, isLiveConnector } from "@/lib/connectors/registry";

const MAX_FORM16_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function collectUploadFiles(formData: FormData): File[] {
  const files: File[] = [];
  const seen = new Set<string>();

  for (const key of ["file", "files", "files[]"] as const) {
    for (const entry of formData.getAll(key)) {
      if (!(entry instanceof File)) continue;
      if (seen.has(entry.name)) continue;
      seen.add(entry.name);
      files.push(entry);
    }
  }

  return files;
}

function scrubPasswordFromMessage(message: string, password?: string): string {
  let safe = scrubPanFromLogMessage(message);
  if (password && password.length > 0) {
    safe = safe.split(password).join("*****");
  }
  return safe;
}

export async function POST(request: NextRequest) {
  let password: string | undefined;
  try {
    const formData = await request.formData();
    const connectorId = (formData.get("connectorId") as string) ?? "unknown";
    const passwordRaw = formData.get("password");
    password =
      typeof passwordRaw === "string" && passwordRaw.trim().length > 0
        ? passwordRaw.trim()
        : undefined;

    const files = collectUploadFiles(formData);

    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "Each file must be 10 MB or smaller." },
          { status: 400 }
        );
      }
    }

    if (isKnownConnector(connectorId) && !isLiveConnector(connectorId)) {
      return NextResponse.json(
        {
          error:
            "This document type is not available for automatic parsing yet. Enter figures manually or upload Form 16.",
          connectorId,
          comingSoon: true,
        },
        { status: 422 }
      );
    }

    if (connectorId === "form16") {
      if (files.length > MAX_FORM16_FILES) {
        return NextResponse.json(
          { error: `Upload at most ${MAX_FORM16_FILES} Form 16 PDFs at once.` },
          { status: 400 }
        );
      }

      const buffers = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          buffer: Buffer.from(await file.arrayBuffer()),
        }))
      );

      const parseResult = await parseForm16MultiPart(buffers, password);

      const demo = parseResult.parseMode === "demo_fallback";
      const hasPasswordError = parseResult.files.some((f) =>
        f.error?.includes("check password")
      );

      if (hasPasswordError && parseResult.parseMode === "demo_fallback") {
        return NextResponse.json(
          {
            error:
              "Could not open PDF — check password (usually PAN in capitals)",
          },
          { status: 400 }
        );
      }

      if (demo) {
        return NextResponse.json(
          {
            error:
              "Could not extract Form 16 fields reliably. Re-upload a clearer PDF or enter figures manually.",
            connectorId,
            parseMode: "demo_fallback",
            warnings: parseResult.warnings,
            demo: true,
          },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        connectorId,
        filename: parseResult.filenames[0],
        filenames: parseResult.filenames,
        files: parseResult.files.map((f) => ({
          name: f.name,
          partKind: f.partKind,
          fieldConfidence: f.confidence,
          warnings: f.warnings,
          error: f.error,
        })),
        fields: parseResult.fields,
        fieldConfidence: parseResult.confidence,
        parseMode: parseResult.parseMode,
        warnings: parseResult.warnings,
        parsedAt: new Date().toISOString(),
        demo: false,
        message: "Form 16 parsed from PDF — review extracted fields before filing.",
      });
    }

    return NextResponse.json(
      {
        error:
          "Unsupported document type. Upload Form 16, or enter income details manually.",
        connectorId,
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Form16PdfOpenError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const rawMessage =
      error instanceof Error ? error.message : "Upload processing failed";
    const safeMessage = scrubPasswordFromMessage(rawMessage, password);
    console.error("upload error:", safeMessage);
    return NextResponse.json(
      { error: "Upload processing failed" },
      { status: 500 }
    );
  }
}
