"use client";

import { Sparkles } from "lucide-react";

/** Plain-language next-step explanation for the government portal. */
export function PortalCaBanner({
  title = "What to do next",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#0e5f63]/20 bg-[#0e5f63]/5 px-4 py-3">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-[#0e5f63]" aria-hidden />
      <div className="min-w-0 text-sm text-slate-800">
        <p className="font-semibold text-[#0e5f63]">{title}</p>
        <div className="mt-1 leading-relaxed text-slate-700">{children}</div>
      </div>
    </div>
  );
}
