"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Banner, Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { useDraftStore } from "@/lib/store/draft";
import { summarizeVdaTrades, type VdaTrade } from "@/lib/tax/vda";
import { formatINR } from "@/lib/format";
import { getUploadSectionChecklist } from "@/lib/ai/aiMasterPromptContext";

function newTrade(): VdaTrade {
  return {
    id: `vda_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    token: "",
    costOfAcquisition: 0,
    considerationReceived: 0,
    tds194S: 0,
  };
}

export default function VdaImportPage() {
  const router = useRouter();
  const { ensureIncomeChip, setIncome, setQuestionAnswer } = useDraftStore();
  const [trades, setTrades] = useState<VdaTrade[]>([newTrade()]);
  const summary = useMemo(() => summarizeVdaTrades(trades), [trades]);
  const checklist = getUploadSectionChecklist("vda");

  const updateTrade = (id: string, patch: Partial<VdaTrade>) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const handleContinue = () => {
    ensureIncomeChip("crypto");
    setQuestionAnswer("vda_summary", {
      totalTaxableGains: summary.totalTaxableGains,
      totalTaxAt30Pct: summary.totalTaxAt30Pct,
      totalLossesBlocked: summary.totalLossesBlocked,
      totalTds194S: summary.totalTds194S,
      tradeCount: trades.length,
    });
    // Surface VDA tax as self-assessment reminder; engine special-rate wire is AI_API_TODO.
    setIncome({
      otherIncome: (useDraftStore.getState().income.otherIncome ?? 0),
      selfAssessmentTax:
        (useDraftStore.getState().income.selfAssessmentTax ?? 0) + 0,
    });
    router.push("/file/review?tab=income");
  };

  return (
    <FilingLayout mirrorText="Crypto is taxed at a flat 30% on each winning trade. Losses on one token cannot reduce gains on another.">
      <ScreenTitle
        title="Crypto / VDA (Schedule VDA)"
        subtitle="Add each sale. We tax winning trades at 30% and block loss netting across tokens."
      />

      <Banner variant="info">
        {/* AI_API_TODO */}
        AI will read exchange CSVs when the AI API is connected. For now, enter trades
        manually. Sections we will look for: {checklist.slice(0, 3).join("; ")}.
      </Banner>

      <div className="space-y-4">
        {trades.map((trade, index) => {
          const row = summary.trades[index];
          return (
            <div
              key={trade.id}
              className="rounded-2xl border border-border bg-card p-4 space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-muted-foreground">Token</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                    value={trade.token}
                    onChange={(e) => updateTrade(trade.id, { token: e.target.value })}
                    placeholder="BTC, ETH…"
                  />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">1% TDS (194S)</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                    value={trade.tds194S || ""}
                    onChange={(e) =>
                      updateTrade(trade.id, {
                        tds194S: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Cost of acquisition</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                    value={trade.costOfAcquisition || ""}
                    onChange={(e) =>
                      updateTrade(trade.id, {
                        costOfAcquisition: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Sale consideration</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                    value={trade.considerationReceived || ""}
                    onChange={(e) =>
                      updateTrade(trade.id, {
                        considerationReceived: Math.max(
                          0,
                          Number(e.target.value) || 0
                        ),
                      })
                    }
                  />
                </label>
              </div>
              {row && (
                <p className="text-sm text-muted-foreground">
                  {row.taxableGain > 0
                    ? `Taxable gain ${formatINR(row.taxableGain)} · 30% tax ${formatINR(row.taxAt30Pct)}`
                    : row.lossIgnored > 0
                      ? `Loss ${formatINR(row.lossIgnored)} — cannot set off against other tokens`
                      : "Enter cost and sale amounts"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-3 text-sm font-semibold text-primary"
        onClick={() => setTrades((prev) => [...prev, newTrade()])}
      >
        + Add another trade
      </button>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm space-y-1">
        <p>
          <strong>Total taxable gains:</strong> {formatINR(summary.totalTaxableGains)}
        </p>
        <p>
          <strong>Tax @ 30%:</strong> {formatINR(summary.totalTaxAt30Pct)}
        </p>
        <p>
          <strong>Losses blocked (not netted):</strong>{" "}
          {formatINR(summary.totalLossesBlocked)}
        </p>
        <p>
          <strong>194S TDS credit:</strong> {formatINR(summary.totalTds194S)}
        </p>
      </div>

      <FilingActions>
        <Button onClick={handleContinue}>Continue to review</Button>
      </FilingActions>
    </FilingLayout>
  );
}
