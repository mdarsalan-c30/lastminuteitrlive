"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2, X, UploadCloud, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILES = 5;
const AUTO_UPLOAD_DELAY_MS = 700;

interface Form16UploadZoneProps {
  uploading: boolean;
  isConnected: boolean;
  highlighted?: boolean;
  onUpload: (files: File[], password?: string) => Promise<void>;
}

function filesFingerprint(files: File[]): string {
  return files.map((f) => `${f.name}:${f.size}:${f.lastModified}`).join("|");
}

export function Form16UploadZone({
  uploading,
  isConnected,
  highlighted,
  onUpload,
}: Form16UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [autoUploadPending, setAutoUploadPending] = useState(false);
  const lastUploadedFingerprint = useRef<string>("");
  const lastAutoAttemptFingerprint = useRef<string>("");
  const uploadInFlight = useRef(false);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (file) =>
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) return;

    setSelectedFiles((current) => {
      const names = new Set(current.map((f) => f.name));
      const merged = [...current];
      for (const file of pdfs) {
        if (merged.length >= MAX_FILES) break;
        if (!names.has(file.name)) {
          merged.push(file);
          names.add(file.name);
        }
      }
      return merged;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((current) => current.filter((_, i) => i !== index));
    lastUploadedFingerprint.current = "";
    lastAutoAttemptFingerprint.current = "";
  }, []);

  const runUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || uploadInFlight.current || uploading) {
      return;
    }

    const fingerprint = `${filesFingerprint(selectedFiles)}::${password.trim()}`;
    if (fingerprint === lastUploadedFingerprint.current) {
      return;
    }

    uploadInFlight.current = true;
    setAutoUploadPending(true);
    lastAutoAttemptFingerprint.current = fingerprint;
    try {
      const trimmedPassword = password.trim();
      await onUpload(
        selectedFiles,
        trimmedPassword.length > 0 ? trimmedPassword : undefined
      );
      lastUploadedFingerprint.current = fingerprint;
      setSelectedFiles([]);
      setPassword("");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      // Keep files selected; user can fix password and retry manually or via re-select
    } finally {
      uploadInFlight.current = false;
      setAutoUploadPending(false);
    }
  }, [onUpload, password, selectedFiles, uploading]);

  useEffect(() => {
    if (selectedFiles.length === 0) return;

    const fingerprint = `${filesFingerprint(selectedFiles)}::${password.trim()}`;
    if (fingerprint === lastAutoAttemptFingerprint.current) return;

    const timer = window.setTimeout(() => {
      void runUpload();
    }, AUTO_UPLOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [selectedFiles, password, runUpload]);

  const isProcessing = uploading || autoUploadPending;

  return (
    <div className={cn(
      "rounded-2xl border-2 transition-all p-1",
      highlighted ? "border-blue-400 shadow-lg shadow-blue-500/10" : "border-slate-200",
      isConnected && "border-emerald-300"
    )}>
      <div
        className={cn(
          "rounded-xl flex flex-col items-center text-center transition-all p-8",
          dragOver ? "bg-blue-50 border-blue-200" : isConnected ? "bg-emerald-50/30" : "bg-slate-50/50 hover:bg-slate-50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
          }
        }}
      >
        <div className={cn(
          "rounded-full p-4 mb-4",
          isConnected ? "bg-emerald-100 text-emerald-600" : dragOver ? "bg-blue-100 text-blue-600" : "bg-white border border-slate-200 text-slate-400"
        )}>
          {isConnected ? <FileCheck className="size-8" /> : <UploadCloud className="size-8" />}
        </div>
        
        <h3 className="text-base font-bold text-slate-900">
          {isConnected ? "Form 16 Uploaded" : "Drag & Drop Form 16 PDF"}
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {isConnected 
            ? "Your employer's Form 16 has been successfully read by our AI." 
            : "Drop Part A, Part B, or your Annexure here. Parsing starts instantly."}
        </p>

        <label className={cn(
          "mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all shadow-sm",
          isConnected ? "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "bg-slate-900 text-white hover:bg-slate-800"
        )}>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            disabled={isProcessing}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
            }}
          />
          {isConnected ? "Upload another Form 16" : "Browse Files"}
        </label>
      </div>

      {(selectedFiles.length > 0 || isProcessing) && (
        <div className="px-5 py-4 bg-white border-t border-slate-100 rounded-b-xl">
          {selectedFiles.length > 0 && (
            <ul className="space-y-2 mb-4">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <FileText className="size-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{file.name}</span>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    disabled={isProcessing}
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              AI is reading your Form 16...
            </div>
          )}

          {!isProcessing && selectedFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  PDF Password (If Locked)
                </span>
                <div className="flex gap-2 mt-2">
                  <input
                    type="password"
                    autoComplete="off"
                    value={password}
                    disabled={isProcessing}
                    placeholder="Often your PAN in capitals"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => {
                      lastUploadedFingerprint.current = "";
                      lastAutoAttemptFingerprint.current = "";
                      setPassword(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    disabled={isProcessing || selectedFiles.length === 0}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => {
                      lastAutoAttemptFingerprint.current = "";
                      void runUpload();
                    }}
                  >
                    Re-Parse
                  </button>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
