"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordProtectedUploadProps {
  accept?: string;
  uploading: boolean;
  isConnected: boolean;
  label: string;
  /** Hint under the password field */
  passwordHint?: string;
  onUpload: (file: File, password?: string) => Promise<void>;
  /** When true, show password field immediately after file pick (AIS/TIS) */
  preferPassword?: boolean;
  /** Extra helper under the upload button */
  helperText?: string;
}

/**
 * Secondary connector upload with optional PDF password (AIS / TIS / 26AS / Groww).
 */
export function PasswordProtectedUpload({
  accept = ".pdf,application/pdf",
  uploading,
  isConnected,
  label,
  passwordHint = "Often PAN + date of birth as shown on the ITD download page",
  onUpload,
  preferPassword = true,
  helperText,
}: PasswordProtectedUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setPassword("");
    setNeedsPassword(false);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const runUpload = useCallback(
    async (file: File, pwd?: string) => {
      setLocalError(null);
      try {
        await onUpload(file, pwd && pwd.trim() ? pwd.trim() : undefined);
        clearSelection();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        const lower = message.toLowerCase();
        if (
          lower.includes("password") ||
          lower.includes("encrypted") ||
          lower.includes("locked")
        ) {
          setNeedsPassword(true);
        }
        setLocalError(message);
        throw error;
      }
    },
    [clearSelection, onUpload]
  );

  const onFilePicked = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setSelectedFile(file);
      setLocalError(null);
      if (preferPassword) {
        setNeedsPassword(true);
        return;
      }
      void runUpload(file).catch(() => {
        /* error shown via localError */
      });
    },
    [preferPassword, runUpload]
  );

  return (
    <div className="flex flex-col items-end gap-2 shrink-0 ml-4 min-w-[9rem]">
      <label
        className={cn(
          "cursor-pointer flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all",
          isConnected
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            onFilePicked(e.target.files?.[0]);
          }}
        />
        {uploading ? "Reading…" : isConnected ? "Replace" : "Upload"}
      </label>
      {helperText && !selectedFile && (
        <p className="text-[10px] text-slate-500 text-right max-w-[11rem] leading-snug">
          {helperText}
        </p>
      )}

      {selectedFile && (
        <div className="w-full min-w-[16rem] max-w-sm rounded-xl border border-slate-200 bg-white p-3 shadow-sm text-left">
          <div className="flex items-start gap-2">
            <FileText className="size-4 shrink-0 text-slate-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
            </div>
            <button
              type="button"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
              disabled={uploading}
              onClick={clearSelection}
              aria-label="Clear file"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {(needsPassword || preferPassword) && (
            <label className="mt-3 block">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Lock className="size-3" />
                PDF password
              </span>
              <input
                type="password"
                autoComplete="off"
                value={password}
                disabled={uploading}
                placeholder="Enter password"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedFile && !uploading) {
                    void runUpload(selectedFile, password).catch(() => {});
                  }
                }}
              />
              <p className="mt-1 text-[10px] text-slate-500">{passwordHint}</p>
            </label>
          )}

          {localError && (
            <p className="mt-2 text-[11px] font-medium text-rose-700">{localError}</p>
          )}

          <button
            type="button"
            disabled={uploading || !selectedFile}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => {
              if (!selectedFile) return;
              void runUpload(selectedFile, password).catch(() => {});
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Reading…
              </>
            ) : (
              "Read document"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
