"use client";

import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PlainEnglishHelp } from "@/components/filing/PlainEnglishHelp";
import { WhyWeAskHint } from "@/components/filing/WhyWeAskHint";
import { WHY_WE_ASK } from "@/lib/copy/trust";
import { FILING_DEDUCTIONS } from "@/lib/copy/filing";
import {
  Button,
  FilingActions,
  RiskBadge,
  ScreenTitle,
} from "@/components/filing/ui";

export default function DeductionsPage() {
  const { deductions, setDeductions } = useDraftStore();

  const rows = [
    {
      label: "80C — Tax-saving investments",
      amount: deductions.section80C,
      badge: "Standard" as const,
      variant: "green" as const,
    },
    {
      label: "80D — Health insurance",
      amount: deductions.section80D,
      badge: "Proof needed",
      variant: "yellow" as const,
    },
    {
      label: "80GG — Rent paid (no HRA)",
      amount: deductions.section80GG || null,
      badge: "Proof needed",
      variant: "yellow" as const,
    },
    {
      label: "NPS extra (Section 80CCD(1B))",
      amount: deductions.npsExtra,
      badge: "Proof needed",
      variant: "yellow" as const,
    },
    {
      label: "Invented expense pattern",
      amount: null,
      badge: "Blocked",
      variant: "red" as const,
      blocked: true,
    },
  ];

  return (
    <FilingLayout
      showNavRail
      activeNavSection="deductions"
      mirrorText="Only claim deductions you actually made and can prove. Inflated 80C or fake rent claims are common reasons for scrutiny notices."
    >
      <ScreenTitle
        title={FILING_DEDUCTIONS.title}
        subtitle={FILING_DEDUCTIONS.subtitle}
      />

      <PlainEnglishHelp
        summary="Deductions reduce tax only when they are real and supported by proof."
        points={[
          "Enter what you actually paid during the year.",
          "80C covers common tax-saving investments like PF, PPF, and ELSS.",
          "80D is health insurance premium paid by you.",
          "If you do not have proof, do not claim that deduction.",
        ]}
      />

      <WhyWeAskHint className="mb-4">{WHY_WE_ASK.deductions}</WhyWeAskHint>

      <div className="space-y-3 mb-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4 ${
              row.blocked ? "opacity-50" : ""
            }`}
          >
            <span className="flex-1 text-sm font-medium text-slate-800 min-w-[200px]">
              {row.label}
            </span>
            <RiskBadge variant={row.variant}>{row.badge}</RiskBadge>
            {row.amount !== null && (
              <span className="text-sm font-semibold text-slate-900">
                {formatINR(row.amount)}
              </span>
            )}
            {!row.blocked && (
              <Button variant="ghost" className="text-xs px-2 py-1">
                Upload proof
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 p-4">
        <label htmlFor="section80GG" className="text-sm font-medium text-slate-800">
          Section 80GG amount (annual rent if no HRA received)
        </label>
        <input
          id="section80GG"
          type="number"
          value={deductions.section80GG || ""}
          onChange={(e) =>
            setDeductions({ section80GG: Number(e.target.value) || 0 })
          }
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Enter rent paid in FY"
        />
      </div>

      <FilingActions>
        <Button href="/file/regime">Save & continue</Button>
      </FilingActions>
    </FilingLayout>
  );
}
