"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, FileCheck2, Sparkles, UploadCloud } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { buildEligibilityForm16Url } from "@/lib/filing/routes";
import { useDraftStore, type FieldConfidence } from "@/lib/store/draft";
import type { ParseMode } from "@/lib/parsers/form16";
import { Form16UploadZone } from "@/components/filing/connectors/Form16UploadZone";
import { cn } from "@/lib/utils";

export type ConnectorStatus = "connected" | "manual" | "coming_soon";

export interface Connector {
  id: string;
  name: string;
  description: string;
  status: ConnectorStatus;
  required?: boolean;
  accept?: string;
}

const SECONDARY_CONNECTORS: Connector[] = [
  {
    id: "ais",
    name: "AIS (Annual Information Statement)",
    description: "Your official tax summary from the ITD",
    status: "manual",
    accept: ".pdf,.json",
  },
  {
    id: "form26as",
    name: "Form 26AS",
    description: "Proof of TDS deducted by employers/banks",
    status: "manual",
    accept: ".pdf,.json",
  },
];

const COMING_SOON_CONNECTORS: Connector[] = [
  {
    id: "zerodha",
    name: "Zerodha / Groww",
    description: "Direct broker integration",
    status: "coming_soon",
  },
];

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
  onUpload: (connector: Connector, file: File) => void;
}) {
  const isDisabled = connector.status === "coming_soon";

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl border transition-all",
      isConnected ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-blue-200"
    )}>
      <div className="flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm">{connector.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{connector.description}</p>
      </div>

      {connector.accept && !isDisabled && (
        <label className={cn(
          "cursor-pointer flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all shrink-0 ml-4",
          isConnected ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        )}>
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
          {uploading ? "Uploading…" : isConnected ? "Replace File" : "Upload"}
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
  } = useDraftStore();
  
  const connected = new Set(connectedConnectors);
  const [uploading, setUploading] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<ParsedUpload | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

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
    [appendAsEmployer, form16FastPath, mergeParsedFields, onUploadComplete, setConnectorConnected, ensureIncomeChip, setItrConfirmed]
  );

  const handleUpload = useCallback(
    async (connector: Connector, file: File) => {
      setUploading(connector.id);
      setUploadError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("connectorId", connector.id);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        applyParsedResponse(connector.id, data, file.name);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(null);
      }
    },
    [applyParsedResponse]
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

        const displayName = files.length === 1 ? files[0].name : `${files.length} files (${files.map((f) => f.name).join(", ")})`;

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
          Your Form 16 <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">Required</span>
        </h2>
        <Form16UploadZone
          uploading={uploading === "form16"}
          isConnected={connected.has("form16")}
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 font-medium flex items-center gap-2">
          {uploadError}
        </div>
      )}

      {lastParsed && (
        <div className={cn("rounded-xl border p-5", lastParsed.demo ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50")}>
          <div className="flex items-start gap-3">
            <FileCheck2 className={cn("size-5 shrink-0 mt-0.5", lastParsed.demo ? "text-amber-600" : "text-emerald-600")} />
            <div>
              <p className={cn("font-bold", lastParsed.demo ? "text-amber-900" : "text-emerald-900")}>
                {lastParsed.demo ? "Demo Data Applied" : "Successfully Parsed"}
              </p>
              <p className={cn("text-sm mt-1", lastParsed.demo ? "text-amber-800/80" : "text-emerald-800/80")}>
                {lastParsed.filename}
              </p>
              
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
