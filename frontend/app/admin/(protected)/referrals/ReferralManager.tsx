"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReferralManager({
  config,
  codes,
  redemptions,
}: {
  config: any;
  codes: any[];
  redemptions: any[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [referrerRewardCoins, setReferrerRewardCoins] = useState(config.referrerRewardCoins);
  const [refereeDiscountPct, setRefereeDiscountPct] = useState(config.refereeDiscountPct);
  const [maxCoinUsePerFiling, setMaxCoinUsePerFiling] = useState(config.maxCoinUsePerFiling);

  async function saveConfig() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/referrals/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerRewardCoins: Number(referrerRewardCoins),
          refereeDiscountPct: Number(refereeDiscountPct),
          maxCoinUsePerFiling: Number(maxCoinUsePerFiling),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.refresh();
      alert("Configuration saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold">Referral Settings</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Referrer Reward (Coins)</span>
            <input
              type="number"
              value={referrerRewardCoins}
              onChange={(e) => setReferrerRewardCoins(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Referee Discount (%)</span>
            <input
              type="number"
              value={refereeDiscountPct}
              onChange={(e) => setRefereeDiscountPct(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Max Coins Used Per Checkout (%)</span>
            <input
              type="number"
              value={maxCoinUsePerFiling}
              onChange={(e) => setMaxCoinUsePerFiling(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={saveConfig}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save Configuration"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No codes yet.</td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.ownerEmail}</td>
                  <td className="px-4 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
