"use client";

import { useState } from "react";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import { Banner, Button, Card, ScreenTitle } from "@/components/filing/ui";
import { PresubmitChecklist } from "@/components/filing/PresubmitChecklist";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";

export default function RiskReviewPage() {
  const {
    mismatchResolved,
    income,
    recommendedForm,
    regime,
    connectedConnectors,
  } = useDraftStore();
  const aisGrossSalary = useDraftStore((s) => s.aisFigures?.grossSalary);
  const hasAis = connectedConnectors.includes("ais");
  const salaryMismatchOpen =
    !mismatchResolved &&
    hasAis &&
    typeof aisGrossSalary === "number" &&
    Math.abs(aisGrossSalary - income.grossSalary) > 100;
  const [useSnapshot, setUseSnapshot] = useState(false);
  const {
    loading,
    error,
    isEstimated,
    engineUnavailable,
    result,
    lastSnapshot,
    confidence,
    userInput,
    compute,
  } = useDraftTaxCompute();

  const effectiveResult = result ?? (useSnapshot ? lastSnapshot : null);
  const totalIncome =
    effectiveResult?.income_heads.gross_total_income ??
    income.grossSalary + income.fdInterest;
  const activeRegime =
    regime ?? effectiveResult?.regime_comparison.recommended_regime ?? "new";
  const selectedPay = effectiveResult?.regime_comparison
    ? effectiveResult.regime_comparison[activeRegime].net_payable
    : null;

  return (
    <FilingLayout mirrorText="Review the remaining items and confirm the details before choosing a plan.">
      <ScreenTitle
        title="Final Review"
        subtitle="Check what is still needed, then confirm the details below."
      />

      {error && !engineUnavailable && (
        <Banner variant="warning">
          {error}
          {isEstimated ? " Figures below are estimates from your draft." : ""}
        </Banner>
      )}

      <EngineComputeFallback
        loading={loading}
        error={error}
        engineUnavailable={engineUnavailable}
        lastSnapshot={lastSnapshot}
        onRetry={() => {
          setUseSnapshot(false);
          void compute(userInput);
        }}
        onContinueWithSnapshot={() => setUseSnapshot(true)}
      />

      {!loading && confidence.missing_documents.length > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Optional documents not added yet
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                You can continue with your manual figures. Add these later to
                cross-check income and tax credits before filing:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {confidence.missing_documents.map((document) => (
                  <li key={document}>{document}</li>
                ))}
              </ul>
            </div>
            <Button href="/file/import/documents" variant="secondary">
              Add documents (optional)
            </Button>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="font-semibold text-slate-900">Tax summary</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">ITR form</span>
            <strong className="block">{recommendedForm}</strong>
          </p>
          <p>
            <span className="text-slate-500">Tax regime</span>
            <strong className="block capitalize">{activeRegime}</strong>
          </p>
          <p>
            <span className="text-slate-500">Total income</span>
            <strong className="block">{formatINR(totalIncome)}</strong>
          </p>
          <p>
            <span className="text-slate-500">
              {selectedPay !== null && selectedPay < 0
                ? "Estimated refund"
                : "Estimated tax payable"}
            </span>
            <strong className="block">
              {selectedPay === null
                ? "Calculation pending"
                : formatINR(Math.abs(selectedPay))}
            </strong>
          </p>
        </div>
        {salaryMismatchOpen && (
          <Banner variant="warning" className="mt-4">
            Your Form 16 and AIS show different salary figures. Review the
            difference before continuing.
          </Banner>
        )}
      </Card>

      <PresubmitChecklist />
    </FilingLayout>
  );
}
