"use client";

import Link from "next/link";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { Card } from "@/components/filing/ui";
import type { CapitalGainsDraft } from "@/lib/store/draft";

/**
 * Capital gains view/edit card (ITR-2/ITR-3). Shows CG figures imported from
 * CAMS / broker statements and lets the user correct them inline, so a
 * "sold shares only" filer is never stuck without an edit surface.
 */

const FIELDS: {
  key: keyof Omit<CapitalGainsDraft, "sourceConnectorId">;
  label: string;
  hint: string;
}[] = [
  {
    key: "stcg_111a",
    label: "Short-term gains — listed shares / equity MF",
    hint: "Held under 1 year · taxed at special rate",
  },
  {
    key: "ltcg_112a",
    label: "Long-term gains — listed shares / equity MF",
    hint: "Held over 1 year · first ₹1.25 lakh is tax-free",
  },
  {
    key: "stcg_other",
    label: "Short-term gains — other assets (debt MF, gold, property)",
    hint: "Taxed at your slab rate",
  },
  {
    key: "ltcg_other",
    label: "Long-term gains — other assets",
    hint: "Land, gold, debt funds held long-term",
  },
  {
    key: "stcl_equity",
    label: "Short-term losses (enter as positive)",
    hint: "We set these off against gains for you",
  },
  {
    key: "ltcl",
    label: "Long-term losses (enter as positive)",
    hint: "Sets off against long-term gains only",
  },
];

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? parseInt(digits, 10) : 0;
}

function formatAmountInput(value: number | undefined): string {
  return value && value > 0 ? value.toLocaleString("en-IN") : "";
}

function connectorLabel(id: string | undefined): string {
  if (!id) return "";
  if (id === "manual_estimate") return "your estimate";
  if (id.includes("cams")) return "CAMS statement";
  return `${id.replace(/[_-]/g, " ")} import`;
}

export function CapitalGainsCard() {
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const setCapitalGains = useDraftStore((s) => s.setCapitalGains);

  const cg = capitalGains ?? {};
  const totalGains =
    (cg.stcg_111a ?? 0) + (cg.ltcg_112a ?? 0) + (cg.stcg_other ?? 0) + (cg.ltcg_other ?? 0);
  const totalLosses = (cg.stcl_equity ?? 0) + (cg.ltcl ?? 0);
  const source = connectorLabel(cg.sourceConnectorId);

  const update = (key: keyof Omit<CapitalGainsDraft, "sourceConnectorId">, value: string) => {
    setCapitalGains({
      ...cg,
      [key]: parseAmount(value),
      sourceConnectorId: cg.sourceConnectorId ?? "manual_estimate",
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Capital gains</h3>
        <Link
          href="/file/import/documents?source=cams"
          className="text-sm font-medium text-primary hover:underline"
        >
          Import statement
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {totalGains > 0 || totalLosses > 0 ? (
          <>
            Gains {formatINR(totalGains)} · losses {formatINR(totalLosses)}
            {source && <span className="text-slate-500"> · from {source}</span>}
          </>
        ) : (
          "Enter net gains (after brokerage) from your broker's Tax P&L or CAMS statement — not the full sale amount."
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="text-xs font-semibold text-slate-700">
            {f.label}
            <input
              type="text"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-normal"
              placeholder="0"
              value={formatAmountInput(cg[f.key])}
              onChange={(e) => update(f.key, e.target.value)}
            />
            <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
              {f.hint}
            </span>
          </label>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Tip: your broker&apos;s &quot;Tax P&amp;L&quot; report already splits gains
        short-term vs long-term — copy those totals here.
      </p>
    </Card>
  );
}
