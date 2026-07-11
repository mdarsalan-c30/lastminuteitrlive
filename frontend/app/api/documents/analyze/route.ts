import { NextRequest, NextResponse } from "next/server";
import { runDocumentPipeline } from "@/lib/ai/documentPipeline";
import { isKnownConnector, isLiveConnector } from "@/lib/connectors/registry";
import { parseAisOrTisText } from "@/lib/parsers/ais";
import {
  isCamsCapitalGainStatement,
  parseCamsCgText,
} from "@/lib/parsers/cams";
import {
  isSpreadsheetFile,
  parseGrowwWorkbookBuffer,
} from "@/lib/parsers/growwXlsx";
import {
  extractPdfText,
  looksLikeEncryptedItdBlob,
  PdfOpenError,
} from "@/lib/parsers/pdfText";

const MAX_AI_FILE_BYTES = 10 * 1024 * 1024;

function scrubPassword(message: string, password?: string): string {
  if (!password) return message;
  return message.split(password).join("*****");
}

export async function POST(request: NextRequest) {
  let password: string | undefined;
  try {
    const formData = await request.formData();
    const connectorId = String(formData.get("connectorId") ?? "unknown");
    const file = formData.get("file");
    const passwordRaw = formData.get("password");
    password =
      typeof passwordRaw === "string" && passwordRaw.trim().length > 0
        ? passwordRaw.trim()
        : undefined;

    if (!isKnownConnector(connectorId)) {
      return NextResponse.json(
        { error: "Unsupported connector for document analysis" },
        { status: 400 }
      );
    }

    if (isLiveConnector(connectorId) && connectorId === "form16") {
      return NextResponse.json(
        { error: "Use /api/documents/upload for Form 16" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_AI_FILE_BYTES) {
      return NextResponse.json(
        { error: "File must be 10 MB or smaller" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const lowerName = file.name.toLowerCase();
    const mime = file.type || "application/octet-stream";
    const isPdf = mime.includes("pdf") || lowerName.endsWith(".pdf");

    // ITD Compliance Portal "JSON" downloads are encrypted blobs — not usable.
    if (
      lowerName.endsWith(".json") ||
      mime.includes("json") ||
      looksLikeEncryptedItdBlob(buffer)
    ) {
      if (
        looksLikeEncryptedItdBlob(buffer) ||
        !buffer.toString("utf8").trim().startsWith("{")
      ) {
        return NextResponse.json(
          {
            error:
              "This AIS/TIS JSON from the Income Tax portal is encrypted and cannot be read here. Download the AIS or TIS PDF instead, then enter the PDF password.",
            code: "encrypted_itd_json",
            comingSoon: false,
          },
          { status: 422 }
        );
      }
    }

    // Deterministic path for AIS / TIS PDFs (works without AI keys).
    const useAisDeterministic =
      connectorId === "ais" ||
      connectorId === "form26as" ||
      lowerName.includes("ais") ||
      lowerName.includes("tis");

    if (useAisDeterministic && isPdf) {
      try {
        const text = await extractPdfText(buffer, password);
        const parsed = parseAisOrTisText(text);
        if (parsed.parseMode === "failed" && parsed.facts.length === 0) {
          return NextResponse.json(
            {
              error:
                parsed.warnings[0] ??
                "Could not extract amounts from this PDF. Check the password and file type.",
              code: "parse_failed",
              warnings: parsed.warnings,
            },
            { status: 422 }
          );
        }

        const fields: Record<string, string | number> = {};
        if (parsed.fields.grossSalary != null) {
          fields.grossSalary = parsed.fields.grossSalary;
          fields.salary = parsed.fields.grossSalary;
        }
        if (parsed.fields.tdsSalary != null) fields.tds = parsed.fields.tdsSalary;
        if (parsed.fields.savingsInterest != null) {
          fields.fdInterest = parsed.fields.savingsInterest;
          fields.savingsInterest = parsed.fields.savingsInterest;
        }
        if (parsed.fields.dividendIncome != null) {
          fields.dividendIncome = parsed.fields.dividendIncome;
        }
        if (parsed.fields.pan) fields.pan = parsed.fields.pan;
        if (parsed.fields.assesseeName) {
          fields.assesseeName = parsed.fields.assesseeName;
        }

        return NextResponse.json({
          ok: true,
          connectorId,
          kind: parsed.kind,
          summary: parsed.summary,
          facts: parsed.facts,
          questions: [
            "Confirm salary and TDS match your Form 16.",
            "Confirm savings interest and dividend before filing.",
          ],
          warnings: parsed.warnings,
          fields,
          parseMode: parsed.parseMode,
          demo: false,
          providerTrace: { geminiUsed: false, openAiUsed: false, deterministic: true },
        });
      } catch (error) {
        if (error instanceof PdfOpenError) {
          return NextResponse.json(
            {
              error: scrubPassword(error.message, password),
              code: error.code,
              needsPassword:
                error.code === "password_required" ||
                error.code === "wrong_password",
            },
            { status: 422 }
          );
        }
        throw error;
      }
    }

    // Deterministic CAMS / MF capital-gains PDF (password often required).
    const useCamsDeterministic =
      connectorId === "cams" ||
      connectorId === "groww" ||
      lowerName.includes("cams") ||
      /capital.?gain/i.test(lowerName) ||
      /_py_/i.test(lowerName);

    if (useCamsDeterministic && isPdf) {
      try {
        const text = await extractPdfText(buffer, password);
        const lowerText = text.toLowerCase();

        if (
          connectorId === "groww" &&
          (lowerText.includes("user profile") ||
            lowerText.includes("change groww pin") ||
            (lowerText.includes("groww") &&
              lowerText.includes("basic details") &&
              lowerText.includes("reports")))
        ) {
          return NextResponse.json(
            {
              error:
                "This looks like a Groww User Profile / Reports page, not a capital-gains statement. Download Mutual Funds – Capital gains or Stocks – Capital gains for the FY, then upload that PDF.",
              code: "wrong_groww_document",
              comingSoon: false,
            },
            { status: 422 }
          );
        }

        if (isCamsCapitalGainStatement(text) || connectorId === "cams") {
          const parsed = parseCamsCgText(text);
          if (parsed.parseMode === "failed") {
            return NextResponse.json(
              {
                error:
                  parsed.warnings[0] ??
                  "Could not extract capital gains from this PDF. Check the password.",
                code: "parse_failed",
                warnings: parsed.warnings,
              },
              { status: 422 }
            );
          }

          return NextResponse.json({
            ok: true,
            connectorId,
            kind: parsed.kind,
            summary: parsed.summary,
            facts: parsed.facts,
            capitalGains: parsed.capitalGains,
            questions: [
              "Confirm STCG / LTCG / losses match your CAMS statement before filing.",
              "We keep one capital-gains statement at a time to avoid double counting — uploading another will replace these figures.",
            ],
            warnings: parsed.warnings,
            fields: {
              ...parsed.capitalGains,
              ...(parsed.fields.pan ? { pan: parsed.fields.pan } : {}),
            },
            parseMode: parsed.parseMode,
            demo: false,
            providerTrace: {
              geminiUsed: false,
              openAiUsed: false,
              deterministic: true,
            },
          });
        }
      } catch (error) {
        if (error instanceof PdfOpenError) {
          return NextResponse.json(
            {
              error: scrubPassword(error.message, password),
              code: error.code,
              needsPassword:
                error.code === "password_required" ||
                error.code === "wrong_password",
            },
            { status: 422 }
          );
        }
        throw error;
      }
    }

    // Groww / broker Excel or CSV (holdings vs capital gains).
    if (isSpreadsheetFile(file.name, mime)) {
      const parsed = parseGrowwWorkbookBuffer(buffer);

      if (parsed.parseMode === "wrong_document") {
        return NextResponse.json(
          {
            error:
              parsed.summary[0] ??
              "This Excel is a holdings snapshot, not a capital-gains report.",
            code: "wrong_groww_document",
            kind: parsed.kind,
            warnings: parsed.warnings,
            guidance: parsed.guidance,
            facts: parsed.facts,
            fields: {
              ...(parsed.fields.pan ? { pan: parsed.fields.pan } : {}),
              ...(parsed.fields.assesseeName
                ? { assesseeName: parsed.fields.assesseeName }
                : {}),
            },
            comingSoon: false,
          },
          { status: 422 }
        );
      }

      if (parsed.parseMode === "failed") {
        return NextResponse.json(
          {
            error:
              parsed.warnings[0] ??
              "Could not read STCG/LTCG from this spreadsheet.",
            code: "parse_failed",
            kind: parsed.kind,
            warnings: parsed.warnings,
            guidance: parsed.guidance,
          },
          { status: 422 }
        );
      }

      return NextResponse.json({
        ok: true,
        connectorId,
        kind: parsed.kind,
        summary: parsed.summary,
        facts: parsed.facts,
        capitalGains: parsed.capitalGains,
        questions: [
          "Confirm STCG / LTCG match your Groww Capital Gains report for the FY.",
          "We keep one capital-gains statement at a time to avoid double counting — uploading another will replace these figures.",
        ],
        warnings: parsed.warnings,
        fields: {
          ...parsed.capitalGains,
          ...(parsed.fields.pan ? { pan: parsed.fields.pan } : {}),
        },
        parseMode: parsed.parseMode,
        demo: false,
        providerTrace: {
          geminiUsed: false,
          openAiUsed: false,
          deterministic: true,
        },
      });
    }

    // Other PDFs: unlock check, then detect CAMS, else AI pipeline if keys exist.
    if (isPdf) {
      try {
        const text = await extractPdfText(buffer, password);
        if (isCamsCapitalGainStatement(text)) {
          const parsed = parseCamsCgText(text);
          if (parsed.parseMode === "extracted") {
            return NextResponse.json({
              ok: true,
              connectorId,
              kind: parsed.kind,
              summary: parsed.summary,
              facts: parsed.facts,
              capitalGains: parsed.capitalGains,
              questions: [
                "Confirm STCG / LTCG / losses match your statement before filing.",
              ],
              warnings: parsed.warnings,
              fields: { ...parsed.capitalGains },
              parseMode: parsed.parseMode,
              demo: false,
              providerTrace: {
                geminiUsed: false,
                openAiUsed: false,
                deterministic: true,
              },
            });
          }
        }
      } catch (error) {
        if (error instanceof PdfOpenError) {
          return NextResponse.json(
            {
              error: scrubPassword(error.message, password),
              code: error.code,
              needsPassword:
                error.code === "password_required" ||
                error.code === "wrong_password",
            },
            { status: 422 }
          );
        }
      }
    }

    if (!process.env.GEMINI_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Automatic reading for this file type needs AI keys, or upload AIS/TIS/CAMS PDF or Groww Capital Gains Excel (which we can read without AI).",
          comingSoon: true,
        },
        { status: 503 }
      );
    }

    const result = await runDocumentPipeline({
      connectorId,
      fileName: file.name,
      mimeType: mime.includes("pdf") ? "application/pdf" : mime,
      bytesBase64: buffer.toString("base64"),
      password,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("document analyze error:", error);
    return NextResponse.json(
      {
        error: scrubPassword(
          error instanceof Error ? error.message : "Document analysis failed",
          password
        ),
      },
      { status: 500 }
    );
  }
}
