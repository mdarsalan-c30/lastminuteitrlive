"use client";

import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Banner,
  Button,
  FilingActions,
  Card,
  FieldLabel,
  ScreenTitle,
} from "@/components/filing/ui";

export default function TdsPage() {
  const { income, setIncome } = useDraftStore();
  const tdsMismatch = false;

  return (
    <FilingLayout
      mirrorText="Form 26AS is the government's record of tax already deducted and paid. Claiming more TDS credit than it shows will delay your refund."
    >
      <ScreenTitle
        title="TDS credit matcher"
        subtitle="Form 26AS is the official record for tax already paid. You cannot claim more than it shows."
      />

      {!tdsMismatch ? (
        <Banner variant="success">
          Tax credit claimed fully matches Form 26AS — {formatINR(income.tds)}
        </Banner>
      ) : (
        <>
          <Banner variant="critical">
            TDS in Form 16 ({formatINR(income.tds)}) is not fully in 26AS (₹82,000).
          </Banner>
          <Card>
            <h3 className="font-semibold text-slate-900 mb-2">Ask your employer to</h3>
            <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
              <li>File revised TDS return on TRACES</li>
              <li>Re-download 26AS after correction</li>
            </ul>
          </Card>
        </>
      )}

      <Card className="mt-4">
        <h3 className="font-semibold text-slate-900 mb-3">Taxes paid by you</h3>
        <p className="text-xs text-slate-500 mb-4">
          Advance tax and self-assessment tax must match Form 26AS Part C.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Advance tax paid</FieldLabel>
            <input
              id="advanceTax"
              type="number"
              value={income.advanceTax || ""}
              onChange={(e) =>
                setIncome({ advanceTax: Number(e.target.value) || 0 })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Total for FY"
            />
          </div>
          <div>
            <FieldLabel>Self-assessment tax (SAT)</FieldLabel>
            <input
              id="sat"
              type="number"
              value={income.selfAssessmentTax || ""}
              onChange={(e) =>
                setIncome({ selfAssessmentTax: Number(e.target.value) || 0 })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Paid before filing"
            />
          </div>
        </div>
      </Card>

      <FilingActions>
        <Button href="/file/income">Continue</Button>
      </FilingActions>
    </FilingLayout>
  );
}
