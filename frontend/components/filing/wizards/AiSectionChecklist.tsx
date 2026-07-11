"use client";

import { getUploadSectionChecklist } from "@/lib/ai/aiMasterPromptContext";
import type { AiDocumentKind } from "@/lib/ai/aiMasterPromptContext";

/**
 * Shows which document sections the AI (when wired) will inspect.
 * // AI_API_TODO
 */
export function AiSectionChecklist({
  kind,
  title = "What we look for in this document",
}: {
  kind: AiDocumentKind;
  title?: string;
}) {
  const items = getUploadSectionChecklist(kind).slice(0, 6);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">
        AI extraction uses these section rules when the AI API is connected. Until then,
        deterministic parsers + your confirmation apply.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
