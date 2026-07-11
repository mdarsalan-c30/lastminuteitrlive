"use client";

import { standardDeductionCap } from "@/lib/tax/hra";
import { formatINR } from "@/lib/format";
import type { EmployerForm16 } from "@/lib/filing/employers";

export function MultiForm16SummaryCard({
  employers,
  regime,
}: {
  employers: EmployerForm16[];
  regime: "old" | "new";
}) {
  if (employers.length < 2) return null;

  const mergedGross = employers.reduce((s, e) => s + (e.grossSalary || 0), 0);
  const mergedTds = employers.reduce((s, e) => s + (e.tds || 0), 0);
  const std = standardDeductionCap(regime, mergedGross);

  return (
    <section
      className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2"
      aria-labelledby="multi-f16-title"
    >
      <h3 id="multi-f16-title" className="text-base font-semibold">
        Multiple Form 16s — we merge carefully
      </h3>
      <p className="text-sm text-muted-foreground">
        You switched jobs. We add every employer&apos;s salary and TDS, but standard
        deduction is applied only once ({formatINR(std)} under the{" "}
        {regime === "new" ? "New" : "Old"} regime) — not once per Form 16.
      </p>
      <ul className="text-sm space-y-1">
        {employers.map((e) => (
          <li key={e.id} className="flex justify-between gap-2">
            <span>{e.name || "Employer"}</span>
            <span>
              {formatINR(e.grossSalary)} · TDS {formatINR(e.tds)}
            </span>
          </li>
        ))}
      </ul>
      <div className="pt-2 border-t border-border text-sm font-medium flex justify-between">
        <span>Merged gross / TDS</span>
        <span>
          {formatINR(mergedGross)} / {formatINR(mergedTds)}
        </span>
      </div>
    </section>
  );
}
