"use client";

import { Lightbulb, Info } from "lucide-react";

export function CABrainAlert({
  title,
  description,
  type = "info",
}: {
  title: string;
  description: string;
  type?: "info" | "success" | "warning";
}) {
  const bgClass =
    type === "info"
      ? "bg-blue-50 border-blue-200"
      : type === "success"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-amber-50 border-amber-200";

  const iconClass =
    type === "info"
      ? "text-blue-600"
      : type === "success"
      ? "text-emerald-600"
      : "text-amber-600";

  const titleClass =
    type === "info"
      ? "text-blue-900"
      : type === "success"
      ? "text-emerald-900"
      : "text-amber-900";

  return (
    <div className={`mt-4 rounded-xl border p-4 shadow-sm ${bgClass}`}>
      <div className="flex gap-3">
        <Lightbulb className={`mt-0.5 size-5 shrink-0 ${iconClass}`} />
        <div>
          <h4 className={`text-[14px] font-bold tracking-tight ${titleClass}`}>
            CA Brain: {title}
          </h4>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
