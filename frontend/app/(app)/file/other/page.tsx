"use client";

import Link from "next/link";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PlainEnglishField } from "@/components/filing/PlainEnglishField";
import { PlainEnglishHelp } from "@/components/filing/PlainEnglishHelp";
import { Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { cn } from "@/lib/utils";
import { Info, Landmark, ShieldCheck } from "lucide-react";

const CAP_80TTB = 50_000;

export default function OtherIncomePage() {
  const { income, setIncome, profile, seniorMode } = useDraftStore();
  const isSenior =
    profile.ageBand === "senior" || profile.ageBand === "super_senior";
  const deduction80TTB = isSenior
    ? Math.min(income.fdInterest, CAP_80TTB)
    : 0;

  return (
    <FilingLayout
      showNavRail
      activeNavSection="other"
      mirrorText="Bank FD interest and savings dividends belong here. Senior citizens can claim up to ₹50,000 deduction on this interest in the old regime."
    >
      <div className="space-y-6">
        {/* Page Title */}
        <ScreenTitle
          title="Other Sources of Income"
          subtitle="Declare bank account interest, fixed deposit interest, dividends, and family pensions."
        />

        <PlainEnglishHelp
          summary="All other interest earned throughout the year is taxable and must be declared."
          points={[
            "Includes interest from savings accounts and FD/RD deposits.",
            "Compare with your AIS (Annual Information Statement) to avoid notices.",
            "Under-60 citizens get a deduction up to ₹10,000 under Section 80TTA.",
            "Senior citizens get a deduction up to ₹50,000 under Section 80TTB.",
          ]}
        />

        {/* Input Form */}
        <div className="bg-slate-50/20 border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100/80 flex items-center gap-2">
            <Landmark className="size-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Interest & Deposits
            </h3>
          </div>

          <PlainEnglishField
            govLabel="Income from Other Sources - Interest on deposits/savings"
            simpleLabel="FD & Savings Interest"
            placeholder="0"
            type="number"
            fieldId="fd_interest"
            value={income.fdInterest ? String(income.fdInterest) : ""}
            onChange={(v) => setIncome({ fdInterest: Number(v) || 0 })}
            helper="Total interest accrued across all your savings accounts and bank FDs."
          />
        </div>

        {/* Senior Citizen Info Panel */}
        {isSenior && (
          <div
            className={cn(
              "mb-6 rounded-2xl border border-blue-200 bg-blue-100/75 p-5 shadow-sm transition-all",
              seniorMode && "p-6 border-blue-200"
            )}
          >
            <div className="flex gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                <Info className="size-5 text-blue-100" />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h3
                  className={cn(
                    "font-bold text-blue-950",
                    seniorMode ? "text-lg" : "text-sm"
                  )}
                >
                  Section 80TTB — Senior Citizen Benefit
                </h3>
                <p
                  className={cn(
                    "leading-relaxed text-slate-700",
                    seniorMode ? "text-sm" : "text-xs"
                  )}
                >
                  As a senior citizen, you can deduct up to{" "}
                  <strong className="font-semibold text-slate-900">{formatINR(CAP_80TTB)}</strong> of interest income. 
                  Based on your input, we will apply an exemption of{" "}
                  <strong className="text-emerald-700 font-bold tabular-nums">
                    {formatINR(deduction80TTB)}
                  </strong>{" "}
                  in the old tax regime.
                </p>
                <div className="pt-1">
                  <Link
                    href="/glossary/section-80ttb"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
                  >
                    Read plain-English guide to 80TTB →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Safe Info Box */}
        <div className="flex gap-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 text-xs text-emerald-800 leading-normal">
          <ShieldCheck className="size-4.5 shrink-0 text-emerald-600 mt-0.5" />
          <p>
            Savings account interest deduction (Section 80TTA/TTB) is automatically calculated 
            by our engine and applied to your final tax computation.
          </p>
        </div>

        {/* Actions */}
        <FilingActions>
          <Button href="/file/deductions" className="w-full sm:w-auto">
            Save & Continue
          </Button>
        </FilingActions>
      </div>
    </FilingLayout>
  );
}
