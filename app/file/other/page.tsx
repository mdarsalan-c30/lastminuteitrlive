"use client";

import Link from "next/link";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PlainEnglishField } from "@/components/filing/PlainEnglishField";
import { Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

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
      mirrorText="Bank FD interest and dividends from AIS belong here. Seniors can deduct up to ₹50,000 of interest under Section 80TTB in the old regime."
    >
      <ScreenTitle title="Other income" />

      <PlainEnglishField
        govLabel="Income from other sources"
        simpleLabel="Bank interest, FD interest, dividends, family pension"
      />

      <PlainEnglishField
        govLabel="Interest on deposits"
        simpleLabel="FD interest"
        value={formatINR(income.fdInterest).replace("₹", "₹ ")}
        onChange={(v) => {
          const num = parseInt(v.replace(/\D/g, ""), 10) || 0;
          setIncome({ fdInterest: num });
        }}
        helper="From AIS — confirm or edit"
      />

      {isSenior && (
        <div
          className={cn(
            "mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-4 shadow-sm",
            seniorMode && "p-5"
          )}
        >
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Info className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "font-semibold text-blue-950",
                  seniorMode ? "text-lg" : "text-base"
                )}
              >
                Section 80TTB — bank interest deduction
              </h3>
              <p
                className={cn(
                  "mt-2 leading-relaxed text-blue-900",
                  seniorMode ? "text-base" : "text-sm"
                )}
              >
                As a senior citizen, you can claim up to{" "}
                <strong>{formatINR(CAP_80TTB)}</strong> deduction on interest from
                savings accounts and fixed deposits. Based on your FD interest above,
                we can apply{" "}
                <strong className="tabular-nums">{formatINR(deduction80TTB)}</strong>{" "}
                when you file under the old tax regime.
              </p>
              <p
                className={cn(
                  "mt-2 text-blue-800/90",
                  seniorMode ? "text-sm" : "text-xs"
                )}
              >
                This replaces Section 80TTA (which applies only below age 60).
              </p>
              <Link
                href="/glossary/section-80ttb"
                className={cn(
                  "mt-3 inline-flex font-medium text-blue-700 underline-offset-2 hover:underline",
                  seniorMode ? "text-base" : "text-sm"
                )}
              >
                What is 80TTB? Read plain-English explanation →
              </Link>
            </div>
          </div>
        </div>
      )}

      <FilingActions>
        <Button href="/file/deductions">Save & continue</Button>
      </FilingActions>
    </FilingLayout>
  );
}
