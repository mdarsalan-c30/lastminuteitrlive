"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { formatINR } from "@/lib/filing/types";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Banner,
  Button,
  FilingActions,
  RiskBadge,
  ScreenTitle,
} from "@/components/filing/ui";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import { reconcileExtractedFactsV1 } from "@/lib/engine/reconcileV1";

export default function MismatchPage() {
  const router = useRouter();
  const draft = useDraftStore();
  const {
    mismatchResolved,
    mismatchProceedWithExplanation,
    income,
    connectedConnectors,
    documentFacts,
    setMismatchProceedWithExplanation,
  } = draft;

  const hasAis = connectedConnectors.includes("ais");
  const aisGrossSalary = useDraftStore((s) => s.aisFigures?.grossSalary);
  const aisTds = useDraftStore((s) => s.aisFigures?.tds);

  const reconcileIssues = useMemo(() => {
    if (!documentFacts?.length) return [];
    const userInput = draftToUserInput(draft);
    return reconcileExtractedFactsV1({ userInput, facts: documentFacts });
  }, [draft, documentFacts]);

  const salaryMismatch =
    hasAis &&
    typeof aisGrossSalary === "number" &&
    Math.abs(aisGrossSalary - income.grossSalary) > 100;

  const criticalCount = salaryMismatch
    ? 1
    : reconcileIssues.filter((i) => i.severity === "mismatch").length;
  const confirmCount = reconcileIssues.filter(
    (i) => i.severity === "confirm"
  ).length;
  const warningCount =
    (income.fdInterest > 0 ? 0 : hasAis ? 1 : 0) + confirmCount;

  const handleProceedWithExplanation = () => {
    setMismatchProceedWithExplanation(true);
    router.push("/file/review");
  };

  return (
    <FilingLayout
      mirrorText="AIS shows what the tax department already knows. Fixing mismatches here prevents refund delays and scrutiny notices."
    >
      <ScreenTitle
        title="Mismatch resolution"
        subtitle="Compare your draft with imported documents. We only show numbers we actually have — never sample figures."
      />

      {!mismatchResolved && (
        <Banner variant="info">
          Mismatches don&apos;t block you — you file on incometax.gov.in yourself. Clearing
          them now just means fewer refund delays and notices later.
        </Banner>
      )}

      <p className="text-sm text-slate-700 mb-4">
        <strong>Summary:</strong>{" "}
        {mismatchResolved
          ? "Critical items cleared"
          : `${criticalCount} critical · ${warningCount} to review`}
        {!hasAis && " · AIS not imported yet"}
      </p>

      <div
        className={`rounded-xl border p-4 mb-3 ${
          mismatchResolved || !salaryMismatch
            ? "border-emerald-200 bg-emerald-50/30"
            : "border-red-200 bg-red-50/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <RiskBadge
            variant={
              mismatchResolved || !salaryMismatch
                ? "green"
                : "red"
            }
          >
            {mismatchResolved || !salaryMismatch ? "OK" : "Critical"}
          </RiskBadge>
          <strong className="text-sm">Salary</strong>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-2">
          <span>Form 16 / draft: {formatINR(income.grossSalary)}</span>
          <span>
            AIS:{" "}
            {hasAis && typeof aisGrossSalary === "number"
              ? formatINR(aisGrossSalary)
              : "Not imported"}
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          {hasAis
            ? "AIS is what the tax department already has on record; Form 16 is your employer’s figure. Keep the one your proof backs up."
            : "Upload AIS to cross-check salary against ITD records. Until then we only show your Form 16 / draft figure."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button href="/file/import/mismatch/salary" variant="primary" className="text-xs px-3 py-1.5">
            Fix now
          </Button>
          {!hasAis && (
            <Button href="/file/import/documents?source=ais" variant="ghost" className="text-xs">
              Upload AIS
            </Button>
          )}
        </div>
      </div>

      {income.fdInterest > 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <RiskBadge variant="green">OK</RiskBadge>
            <strong className="text-sm">FD interest</strong>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-3">
            <span>Draft: {formatINR(income.fdInterest)}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <RiskBadge variant="yellow">Check</RiskBadge>
            <strong className="text-sm">FD / other interest</strong>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            No interest income in your draft yet. If AIS or your bank shows FD interest, add it before filing.
          </p>
          <Button href="/file/review?tab=income" variant="primary" className="text-xs px-3 py-1.5">
            Add income
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <RiskBadge variant="green">OK</RiskBadge>
          <strong className="text-sm">TDS</strong>
        </div>
        <p className="text-xs text-slate-600">
          Form 16: {formatINR(income.tds)}
          {hasAis && typeof aisTds === "number"
            ? ` · AIS: ${formatINR(aisTds)}`
            : " · AIS TDS: not imported"}
        </p>
      </div>

      {reconcileIssues.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 space-y-3">
          <strong className="text-sm text-slate-900">
            From uploaded documents
          </strong>
          {reconcileIssues.map((issue) => (
            <div
              key={issue.factKey}
              className={`rounded-lg border p-3 text-xs ${
                issue.severity === "mismatch"
                  ? "border-red-200 bg-red-50/40"
                  : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <RiskBadge
                  variant={issue.severity === "mismatch" ? "red" : "yellow"}
                >
                  {issue.severity === "mismatch" ? "Mismatch" : "Confirm"}
                </RiskBadge>
                <span className="font-semibold text-slate-800">{issue.label}</span>
              </div>
              <p className="text-slate-600">{issue.question}</p>
            </div>
          ))}
        </div>
      )}

      <FilingActions
        hint={
          <p className="text-tier-feature">
            <strong>What happens next:</strong> Cross-check TDS in Form 26AS, then
            review income and deductions.
          </p>
        }
      >
        <Button href="/file/review" disabled={!mismatchResolved && criticalCount > 0 && !mismatchProceedWithExplanation}>
          Continue when critical rows are green
        </Button>
        {!mismatchResolved && criticalCount > 0 && (
          <Button variant="ghost" onClick={handleProceedWithExplanation}>
            Proceed with explanation
          </Button>
        )}
      </FilingActions>
      {mismatchProceedWithExplanation && !mismatchResolved && (
        <div className="mt-4">
          <Banner variant="info">
            You chose to proceed with an unresolved mismatch. We&apos;ll flag this in
            your filing guide — keep proof handy.
          </Banner>
        </div>
      )}
    </FilingLayout>
  );
}
