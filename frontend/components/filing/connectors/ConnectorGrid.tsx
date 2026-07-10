"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { buildEligibilityForm16Url } from "@/lib/filing/routes";
import { useDraftStore, type FieldConfidence } from "@/lib/store/draft";
import type { ParseMode } from "@/lib/parsers/form16";
import { Form16UploadZone } from "@/components/filing/connectors/Form16UploadZone";
import { PasswordProtectedUpload } from "@/components/filing/connectors/PasswordProtectedUpload";
import { cn } from "@/lib/utils";
import { CONNECTOR_REGISTRY, type ConnectorStatus as RegistryStatus } from "@/lib/connectors/registry";
import { getBrokerGuide } from "@/lib/connectors/brokerGuides";
import type { ExtractedDocumentFact } from "@/lib/ai/documentPipeline";

export type ConnectorStatus = "connected" | "manual" | "coming_soon" | "ai_ready";

export interface Connector {
  id: string;
  name: string;
  description: string;
  status: ConnectorStatus;
  required?: boolean;
  accept?: string;
}

function mapRegistryStatus(status: RegistryStatus): ConnectorStatus {
  if (status === "live") return "manual";
  if (status === "guided" || status === "soon") return "ai_ready";
  return "coming_soon";
}

const SECONDARY_CONNECTORS: Connector[] = CONNECTOR_REGISTRY.filter(
  (connector) => connector.id !== "form16" && connector.status !== "roadmap"
).map((connector) => ({
  id: connector.id,
  name: connector.label,
  description: connector.description,
  status: mapRegistryStatus(connector.status),
  accept: connector.accept,
}));

const PASSWORD_HINTS: Record<string, string> = {
  ais: "ITD download password (often PAN + DOB, e.g. ABCDE1234F01011990)",
  form26as: "Often your PAN in capitals, or the password from the download page",
  bank: "Bank PDF password if the certificate is locked",
  groww:
    "Excel from Reports is usually unlocked. For PDF, use the download password if asked.",
  cams: "Password from the CAMS email / download page (often Name@YY style)",
  zerodha: "Console Tax P&L is usually unlocked",
  upstox: "Reports → Tax P&L — usually no password",
  dhan: "Reports → Tax P&L export — usually unlocked",
  angelone: "Reports → Tax P&L — usually unlocked",
};

const BROKER_CONNECTOR_IDS = new Set([
  "groww",
  "zerodha",
  "upstox",
  "dhan",
  "angelone",
]);

function brokerHelperText(connectorId: string): string | undefined {
  const guide = getBrokerGuide(connectorId);
  if (!guide) return undefined;
  return guide.taxPnlSteps[0];
}

interface ParsedUpload {
  connectorId: string;
  fields: Record<string, string | number>;
  filename: string;
  filenames?: string[];
  fieldConfidence?: Record<string, FieldConfidence>;
  parseMode?: ParseMode;
  warnings?: string[];
  demo?: boolean;
  parsedAt?: string;
  summary?: string[];
}

interface ConnectorGridProps {
  onUploadComplete?: (result: ParsedUpload) => void;
  highlightConnectorId?: string;
  form16FastPath?: boolean;
  appendAsEmployer?: boolean;
}

function ConnectorCard({
  connector,
  isConnected,
  uploading,
  onUpload,
}: {
  connector: Connector;
  isConnected: boolean;
  uploading: boolean;
  onUpload: (connector: Connector, file: File, password?: string) => Promise<void>;
}) {
  const isDisabled = connector.status === "coming_soon";
  const isAiReady = connector.status === "ai_ready";
  const wantsPassword =
    connector.id === "ais" ||
    connector.id === "form26as" ||
    connector.id === "bank" ||
    connector.id === "cams" ||
    BROKER_CONNECTOR_IDS.has(connector.id);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 p-4 rounded-xl border transition-all",
        isConnected
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-white hover:border-blue-200"
      )}
    >
      <div className="flex flex-col min-w-0">
        <h3 className="font-semibold text-slate-900 text-sm">{connector.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{connector.description}</p>
        {isAiReady && (
          <p className="text-[11px] text-teal-700 mt-1 font-medium">
            {connector.id === "ais"
              ? "PDF unlock + extract — confirm every figure before filing"
              : BROKER_CONNECTOR_IDS.has(connector.id)
                ? "Upload Tax P&L or Capital Gains — we map to ITR-2/3"
                : connector.id === "cams"
                  ? "CAMS CG PDF unlock + extract — confirm before filing"
                  : "AI extract (beta) — confirm every figure before filing"}
          </p>
        )}
        {BROKER_CONNECTOR_IDS.has(connector.id) && getBrokerGuide(connector.id) && (
          <ul className="text-[10px] text-slate-500 mt-1 space-y-0.5 list-disc pl-3">
            {getBrokerGuide(connector.id)!.taxPnlSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        )}
      </div>

      {connector.accept && !isDisabled && wantsPassword && (
        <PasswordProtectedUpload
          accept={connector.accept}
          uploading={uploading}
          isConnected={isConnected}
          label={connector.name}
          passwordHint={PASSWORD_HINTS[connector.id]}
          preferPassword={
            connector.id === "ais" ||
            connector.id === "form26as" ||
            connector.id === "cams"
          }
          helperText={
            BROKER_CONNECTOR_IDS.has(connector.id)
              ? brokerHelperText(connector.id)
              : undefined
          }
          onUpload={async (file, password) => {
            await onUpload(connector, file, password);
          }}
        />
      )}

      {connector.accept && !isDisabled && !wantsPassword && (
        <label
          className={cn(
            "cursor-pointer flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all shrink-0 ml-4",
            isConnected
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          <input
            type="file"
            accept={connector.accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(connector, file);
            }}
          />
          {uploading
            ? "Uploading…"
            : isConnected
              ? "Replace File"
              : isAiReady
                ? "Upload for AI"
                : "Upload"}
        </label>
      )}

      {isDisabled && (
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full shrink-0 ml-4">
          Coming Soon
        </span>
      )}
    </div>
  );
}

export default function ConnectorGrid({
  onUploadComplete,
  highlightConnectorId,
  form16FastPath = false,
  appendAsEmployer = false,
}: ConnectorGridProps) {
  const router = useRouter();
  const {
    connectedConnectors,
    setConnectorConnected,
    mergeParsedFields,
    ensureIncomeChip,
    setItrConfirmed,
    setAisFigures,
    setCapitalGains,
    mergeDocumentFacts,
    setIncome,
  } = useDraftStore();

  const connected = new Set(connectedConnectors);
  const [uploading, setUploading] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<ParsedUpload | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadGuidance, setUploadGuidance] = useState<string[]>([]);

  const applyParsedResponse = useCallback(
    (
      connectorId: string,
      data: {
        fields: Record<string, string | number>;
        fieldConfidence?: Record<string, FieldConfidence>;
        parseMode?: ParseMode;
        warnings?: string[];
        demo?: boolean;
        parsedAt?: string;
        filename?: string;
        filenames?: string[];
        files?: Array<{ name: string; partKind: string }>;
        summary?: string[];
      },
      displayFilename: string
    ) => {
      setConnectorConnected(connectorId);
      const parsed: ParsedUpload = {
        connectorId,
        fields: data.fields,
        filename: displayFilename,
        filenames: data.filenames,
        fieldConfidence: data.fieldConfidence,
        parseMode: data.parseMode,
        warnings: data.warnings,
        demo: data.demo,
        parsedAt: data.parsedAt,
        summary: data.summary,
      };
      mergeParsedFields(connectorId, {
        fields: data.fields,
        fieldConfidence: data.fieldConfidence,
        parseMode: data.parseMode,
        warnings: data.warnings,
        demo: data.demo,
        filename: displayFilename,
        filenames: data.filenames,
        parsedParts: data.files?.map((f) => ({
          name: f.name,
          partKind: f.partKind,
        })),
        parsedAt: data.parsedAt,
        appendAsEmployer: connectorId === "form16" ? appendAsEmployer : false,
      });
      setLastParsed(parsed);
      if (connectorId === "form16") {
        ensureIncomeChip("salary");
        if (form16FastPath) {
          setItrConfirmed(false);
        }
      }
      onUploadComplete?.(parsed);
    },
    [
      appendAsEmployer,
      form16FastPath,
      mergeParsedFields,
      onUploadComplete,
      setConnectorConnected,
      ensureIncomeChip,
      setItrConfirmed,
    ]
  );

  const applyAiFacts = useCallback(
    (
      connectorId: string,
      facts: ExtractedDocumentFact[],
      fields?: Record<string, string | number>,
      capitalGains?: Record<string, number>
    ) => {
      mergeDocumentFacts(
        facts.map((f) => ({
          key: f.key,
          label: f.label,
          value: f.value,
          confidence: f.confidence,
          sourceConnectorId: connectorId,
        }))
      );
      setConnectorConnected(connectorId);

      const num = (key: string): number | undefined => {
        if (fields && typeof fields[key] === "number") {
          return fields[key] as number;
        }
        if (capitalGains && typeof capitalGains[key] === "number") {
          return capitalGains[key];
        }
        const fact = facts.find((f) => f.key === key);
        if (!fact) return undefined;
        const n =
          typeof fact.value === "number"
            ? fact.value
            : Number(String(fact.value).replace(/[,₹\s]/g, ""));
        return Number.isFinite(n) ? n : undefined;
      };

      if (connectorId === "ais" || connectorId === "form26as") {
        const grossSalary =
          num("grossSalary") ?? num("gross_salary") ?? num("salary");
        const tds =
          num("tds") ?? num("tds_salary") ?? num("tds_other");
        const fdInterest =
          num("fdInterest") ??
          num("savingsInterest") ??
          num("fd_interest") ??
          num("savings_account_interest");
        const dividend =
          num("dividendIncome") ?? num("dividend_income");

        // Merge with earlier imports (e.g. AIS then 26AS) instead of replacing.
        const existing = useDraftStore.getState().aisFigures ?? {};
        setAisFigures({
          ...existing,
          ...(grossSalary !== undefined ? { grossSalary } : {}),
          ...(tds !== undefined ? { tds } : {}),
          ...(fdInterest !== undefined ? { fdInterest } : {}),
        });
        if (fdInterest !== undefined && fdInterest > 0) {
          setIncome({ fdInterest });
        }
        if (dividend !== undefined && dividend > 0) {
          setIncome({ otherIncome: dividend });
        }
        if (grossSalary !== undefined && grossSalary > 0) {
          ensureIncomeChip("salary");
        }
      }

      if (connectorId === "cams" || BROKER_CONNECTOR_IDS.has(connectorId)) {
        ensureIncomeChip("capital_gains");
        const stcg_111a = num("stcg_111a");
        const ltcg_112a = num("ltcg_112a");
        const stcg_other = num("stcg_other");
        const ltcg_other = num("ltcg_other");
        const stcl_equity = num("stcl_equity");
        const ltcl = num("ltcl");
        if (
          stcg_111a != null ||
          ltcg_112a != null ||
          stcg_other != null ||
          ltcg_other != null ||
          stcl_equity != null ||
          ltcl != null
        ) {
          setCapitalGains({
            ...(stcg_111a != null ? { stcg_111a } : {}),
            ...(ltcg_112a != null ? { ltcg_112a } : {}),
            ...(stcg_other != null ? { stcg_other } : {}),
            ...(ltcg_other != null ? { ltcg_other } : {}),
            ...(stcl_equity != null ? { stcl_equity } : {}),
            ...(ltcl != null ? { ltcl } : {}),
            sourceConnectorId: connectorId,
          });
        }
      }
    },
    [
      ensureIncomeChip,
      mergeDocumentFacts,
      setAisFigures,
      setCapitalGains,
      setConnectorConnected,
      setIncome,
    ]
  );

  const handleUpload = useCallback(
    async (connector: Connector, file: File, password?: string) => {
      setUploading(connector.id);
      setUploadError(null);
      setUploadGuidance([]);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("connectorId", connector.id);
        if (password) {
          form.append("password", password);
        }

        // AI-ready connectors (AIS/CAMS/26AS/…) go through document analyze.
        if (connector.status === "ai_ready") {
          const res = await fetch("/api/documents/analyze", {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          if (!res.ok) {
            if (Array.isArray(data.guidance)) {
              setUploadGuidance(data.guidance as string[]);
            }
            const err = new Error(
              data.error ??
                (data.comingSoon
                  ? "AI document analysis is not configured yet (set GEMINI_API_KEY and OPENAI_API_KEY)."
                  : "Upload failed")
            ) as Error & { needsPassword?: boolean; code?: string };
            err.needsPassword = Boolean(data.needsPassword);
            err.code = data.code;
            throw err;
          }
          const facts = (data.facts ?? []) as ExtractedDocumentFact[];
          const fields = (data.fields ?? {}) as Record<string, string | number>;
          const capitalGains = (data.capitalGains ?? undefined) as
            | Record<string, number>
            | undefined;
          applyAiFacts(connector.id, facts, fields, capitalGains);
          setLastParsed({
            connectorId: connector.id,
            fields:
              Object.keys(fields).length > 0
                ? fields
                : Object.fromEntries(
                    facts.map((f) => [f.key, f.value as string | number])
                  ),
            filename: file.name,
            parseMode: (data.parseMode as ParseMode) ?? "extracted",
            warnings: data.warnings ?? [],
            summary: data.summary,
            demo: false,
          });
          return;
        }

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        applyParsedResponse(connector.id, data, file.name);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed");
        throw error;
      } finally {
        setUploading(null);
      }
    },
    [applyAiFacts, applyParsedResponse]
  );

  const handleForm16Upload = useCallback(
    async (files: File[], password?: string) => {
      setUploading("form16");
      setUploadError(null);
      try {
        const form = new FormData();
        form.append("connectorId", "form16");
        for (const file of files) {
          form.append("files", file);
        }
        if (password) {
          form.append("password", password);
        }

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        const displayName =
          files.length === 1
            ? files[0].name
            : `${files.length} files (${files.map((f) => f.name).join(", ")})`;

        trackEvent("form16_upload", {
          fileCount: files.length,
          filename: files.map((f) => f.name).join(", "),
        });

        applyParsedResponse("form16", data, displayName);

        if (form16FastPath) {
          router.push(buildEligibilityForm16Url());
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed");
        throw error;
      } finally {
        setUploading(null);
      }
    },
    [applyParsedResponse, form16FastPath, router]
  );

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Primary Upload (Form 16) */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          Your Form 16{" "}
          <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
            Required
          </span>
        </h2>
        <Form16UploadZone
          uploading={uploading === "form16"}
          isConnected={connected.has("form16")}
          highlighted={highlightConnectorId === "form16"}
          onUpload={handleForm16Upload}
        />
      </div>

      {/* Secondary Uploads */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Optional Supporting Documents
        </h2>
        <div className="flex flex-col gap-3">
          {SECONDARY_CONNECTORS.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              isConnected={connected.has(connector.id)}
              uploading={uploading === connector.id}
              onUpload={handleUpload}
            />
          ))}
        </div>
      </div>

      {/* Errors & Success Messages */}
      {uploadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 font-medium space-y-2">
          <p>{uploadError}</p>
          {uploadGuidance.length > 0 && (
            <ul className="text-xs font-normal text-rose-800/90 space-y-1 list-disc pl-4">
              {uploadGuidance.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {lastParsed && (
        <div
          className={cn(
            "rounded-xl border p-5",
            lastParsed.demo
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          )}
        >
          <div className="flex items-start gap-3">
            <FileCheck2
              className={cn(
                "size-5 shrink-0 mt-0.5",
                lastParsed.demo ? "text-amber-600" : "text-emerald-600"
              )}
            />
            <div>
              <p
                className={cn(
                  "font-bold",
                  lastParsed.demo ? "text-amber-900" : "text-emerald-900"
                )}
              >
                {lastParsed.demo ? "Demo Data Applied" : "Successfully Parsed"}
              </p>
              <p
                className={cn(
                  "text-sm mt-1",
                  lastParsed.demo ? "text-amber-800/80" : "text-emerald-800/80"
                )}
              >
                {lastParsed.filename}
              </p>
              {lastParsed.summary && lastParsed.summary.length > 0 && (
                <p className="mt-2 text-xs text-emerald-900/80 font-medium">
                  {lastParsed.summary.join(" ")}
                </p>
              )}

              {lastParsed.warnings && lastParsed.warnings.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-amber-800 font-medium bg-amber-100/50 p-3 rounded-lg">
                  {lastParsed.warnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
