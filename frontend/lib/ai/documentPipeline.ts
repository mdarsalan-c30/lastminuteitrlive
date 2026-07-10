import { getConnectorDefinition } from "@/lib/connectors/registry";
import { extractPdfText } from "@/lib/parsers/pdfText";
import {
  getExtractionPromptForKind,
  type AiDocumentKind,
} from "@/lib/ai/aiMasterPromptContext";

export type { AiDocumentKind };

export interface ExtractedDocumentFact {
  key: string;
  label: string;
  value: string | number | boolean;
  confidence: number;
  source: string;
  needsUserConfirmation: boolean;
}

export interface DocumentPipelineResult {
  connectorId: string;
  kind: AiDocumentKind;
  summary: string[];
  facts: ExtractedDocumentFact[];
  questions: string[];
  warnings: string[];
  providerTrace: {
    geminiUsed: boolean;
    openAiUsed: boolean;
  };
}

function connectorToKind(connectorId: string): AiDocumentKind {
  if (connectorId === "form16") return "form16";
  if (connectorId === "ais") return "ais";
  if (connectorId === "form26as") return "form26as";
  if (connectorId === "cams" || connectorId === "mfcentral") return "cams";
  if (
    connectorId === "groww" ||
    connectorId === "zerodha" ||
    connectorId === "upstox" ||
    connectorId === "dhan" ||
    connectorId === "angelone"
  ) {
    return "broker_pnl";
  }
  if (connectorId === "bank") return "bank_interest";
  if (connectorId === "crypto" || connectorId === "vda") return "vda";
  return "unknown";
}

/** // AI_API_TODO — uses pre-master routing; live keys still required at runtime. */
function extractionPrompt(kind: AiDocumentKind): string {
  return getExtractionPromptForKind(kind);
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function normalizePipelineResult(
  connectorId: string,
  kind: AiDocumentKind,
  raw: unknown,
  trace: DocumentPipelineResult["providerTrace"]
): DocumentPipelineResult {
  const data = raw as Partial<DocumentPipelineResult>;
  const facts = Array.isArray(data.facts)
    ? data.facts
        .filter((fact) => fact && typeof fact === "object")
        .map((fact) => fact as Partial<ExtractedDocumentFact>)
        .filter(
          (fact) =>
            typeof fact.key === "string" &&
            typeof fact.label === "string" &&
            fact.value !== undefined
        )
        .map((fact) => ({
          key: fact.key!,
          label: fact.label!,
          value: fact.value!,
          confidence:
            typeof fact.confidence === "number"
              ? Math.max(0, Math.min(1, fact.confidence))
              : 0.5,
          source: typeof fact.source === "string" ? fact.source : connectorId,
          needsUserConfirmation: fact.needsUserConfirmation !== false,
        }))
    : [];

  return {
    connectorId,
    kind,
    summary: Array.isArray(data.summary)
      ? data.summary.filter((item): item is string => typeof item === "string")
      : [],
    facts,
    questions: Array.isArray(data.questions)
      ? data.questions.filter((item): item is string => typeof item === "string")
      : [],
    warnings: Array.isArray(data.warnings)
      ? data.warnings.filter((item): item is string => typeof item === "string")
      : [],
    providerTrace: trace,
  };
}

async function readWithGemini(input: {
  bytesBase64: string;
  mimeType: string;
  prompt: string;
}): Promise<string> {
  // AI_API_TODO — wire production Gemini key; until then callers catch and use parsers.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: input.prompt },
              {
                inline_data: {
                  mime_type: input.mimeType,
                  data: input.bytesBase64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini document read failed: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return text;
}

async function structureWithOpenAi(input: {
  kind: AiDocumentKind;
  extractedText: string;
}): Promise<unknown> {
  // AI_API_TODO — wire production OpenAI key; until then callers catch and use parsers.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: extractionPrompt(input.kind) },
        { role: "user", content: input.extractedText },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI structuring failed: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no structured content");
  return parseJsonObject(content);
}

export async function runDocumentPipeline(input: {
  connectorId: string;
  fileName: string;
  mimeType: string;
  bytesBase64: string;
  password?: string;
}): Promise<DocumentPipelineResult> {
  const connector = getConnectorDefinition(input.connectorId);
  const connectorId = connector?.id ?? input.connectorId;
  const kind = connectorToKind(input.connectorId);
  if (kind === "unknown") {
    throw new Error("Unsupported document type for AI extraction");
  }

  // Prefer locally unlocked text when a password is provided (encrypted PDFs);
  // fall back to Gemini vision extraction otherwise or if unlock fails.
  let extractedText: string | null = null;
  if (input.password && input.mimeType.includes("pdf")) {
    try {
      extractedText = await extractPdfText(
        Buffer.from(input.bytesBase64, "base64"),
        input.password
      );
    } catch {
      extractedText = null;
    }
  }

  let geminiUsed = false;
  if (extractedText === null) {
    extractedText = await readWithGemini({
      bytesBase64: input.bytesBase64,
      mimeType: input.mimeType,
      prompt: `${extractionPrompt(kind)}\nFilename: ${input.fileName}`,
    });
    geminiUsed = true;
  }

  const structured = await structureWithOpenAi({
    kind,
    extractedText,
  });

  return normalizePipelineResult(connectorId, kind, structured, {
    geminiUsed,
    openAiUsed: true,
  });
}
