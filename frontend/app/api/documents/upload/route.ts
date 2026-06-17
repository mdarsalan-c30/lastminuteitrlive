import { NextRequest, NextResponse } from "next/server";
import {
  Form16PdfOpenError,
  parseForm16MultiPart,
  scrubPanFromLogMessage,
  type FieldConfidence,
} from "@/lib/parsers/form16";

const MOCK_FIELDS: Record<string, Record<string, string | number>> = {
  ais: {
    salaryReported: 1215000,
    fdInterest: 18400,
    mutualFundGains: 0,
  },
  form26as: {
    tdsCredited: 85000,
    advanceTax: 0,
    selfAssessmentTax: 0,
  },
  cams: {
    stcg: 12500,
    ltcg: 0,
    dividend: 3200,
  },
};

const MAX_FORM16_FILES = 5;

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
        demo,
        message: demo
          ? "Demo fallback — could not extract all fields. Verify every figure against your Form 16."
          : "Form 16 parsed from PDF — review extracted fields before filing.",
      });
    }

    const file = files[0];
    const filename = file.name;

    const fields =
      MOCK_FIELDS[connectorId] ?? {
        note: "Document received — parsing stub",
        sizeBytes: file.size,
      };

    return NextResponse.json({
      success: true,
      connectorId,
      filename,
      fields,
      fieldConfidence: {} as Record<string, FieldConfidence>,
      parseMode: "demo_fallback",
      warnings: ["Demo parsing — sample numbers only."],
      parsedAt: new Date().toISOString(),
      demo: true,
      message:
        "Demo parsing — sample numbers only. Verify against your documents before filing.",
    });
  } catch (error) {
    if (error instanceof Form16PdfOpenError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const rawMessage = error instanceof Error ? error.message : "Upload processing failed";
    const safeMessage = scrubPasswordFromMessage(rawMessage, password);
    console.error("upload error:", safeMessage);
    return NextResponse.json(
      { error: "Upload processing failed" },
      { status: 500 }
    );
  }
}
