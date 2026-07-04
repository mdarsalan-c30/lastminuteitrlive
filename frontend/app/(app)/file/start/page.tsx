"use client";

import { Suspense } from "react";
import { GateContent } from "@/components/filing/GateScreen";

/** GATE — canonical entry (doc 40 / doc 21). */
export default function StartPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <GateContent />
    </Suspense>
  );
}
