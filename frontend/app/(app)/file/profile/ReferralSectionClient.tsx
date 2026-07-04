"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/filing/ui";

export function ReferralSectionClient() {
  const [code, setCode] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/user/referrals")
      .then((res) => res.json())
      .then((data) => {
        setCode(data.code);
        setWallet(data.wallet);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/user/referrals", { method: "POST" });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading referral info...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-500">Wallet Balance</h3>
        <p className="mt-1 text-2xl font-bold text-slate-900">{wallet?.coins || 0} Coins</p>
        <p className="text-xs text-slate-500 mt-1">Use coins at checkout for a discount.</p>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-medium text-slate-500 mb-3">Your Referral Code</h3>
        {code ? (
          <div>
            <div className="inline-block rounded-lg bg-slate-100 px-4 py-2 font-mono text-lg font-bold tracking-widest text-slate-900">
              {code.code}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Share this code with friends. They get a discount, and you earn coins!
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-3">
              You haven&apos;t generated a referral code yet.
            </p>
            <Button onClick={generateCode} disabled={generating}>
              {generating ? "Generating..." : "Generate Code"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
