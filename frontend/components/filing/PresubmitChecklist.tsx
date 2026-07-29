"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { isClientPaymentBypassEnabled } from "@/lib/payments/bypass";
import { useDraftStore } from "@/lib/store/draft";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { Button, FilingActions } from "@/components/filing/ui";

interface PresubmitChecklistProps {
  showCheckoutCta?: boolean;
  secondaryAction?: ReactNode;
  className?: string;
}

export function PresubmitChecklist({
  showCheckoutCta = true,
  secondaryAction,
  className = "",
}: PresubmitChecklistProps) {
  const {
    recommendedForm,
    mismatchResolved,
    mismatchProceedWithExplanation,
    bankValidated,
    connectedConnectors,
    income,
    regime,
    eVerifyMethod,
    setEVerifyMethod,
    setBankValidated,
    markFinalReviewComplete,
  } = useDraftStore();
  const { loading, confidence, engineUnavailable } = useDraftTaxCompute({
    readOnly: true,
  });
  const aisGrossSalary = useDraftStore((s) => s.aisFigures?.grossSalary);
  const hasOpenMismatch =
    connectedConnectors.includes("ais") &&
    typeof aisGrossSalary === "number" &&
    Math.abs(aisGrossSalary - income.grossSalary) > 100;
  const mismatchOk =
    !hasOpenMismatch || mismatchResolved || mismatchProceedWithExplanation;
  const checklistGreen = Boolean(
    mismatchOk && bankValidated && regime && eVerifyMethod
  );
  const filingReadyForCheckout =
    confidence.filing_ready && !loading && !engineUnavailable;
  const canProceed = checklistGreen && filingReadyForCheckout;
  const trackedGreen = useRef(false);

  useEffect(() => {
    if (!canProceed || trackedGreen.current) return;
    trackedGreen.current = true;
    trackEvent("presubmit_checklist_green", {
      completeness_score: confidence.completeness_score,
      recommended_form: recommendedForm,
    });
    void logSessionEvent("presubmit_green", {
      draft: draftSnapshotForLog(useDraftStore.getState()),
      meta: { completeness_score: confidence.completeness_score },
    });
  }, [canProceed, confidence.completeness_score, recommendedForm]);

  const paymentBypass = isClientPaymentBypassEnabled();
  const checkoutHref = paymentBypass
    ? "/file/companion"
    : canProceed
      ? "/file/checkout/plans"
      : undefined;

  return (
    <div className={className} id="final-check">
      <h2 className="text-lg font-semibold text-slate-900">
        Before you continue
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Complete only the items shown below. Your progress is saved.
      </p>

      {!filingReadyForCheckout && !loading && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Still needed:</strong>{" "}
          {confidence.missing_documents.length > 0
            ? confidence.missing_documents.join(", ")
            : "complete the tax calculation and review any differences"}
        </div>
      )}

      {!mismatchOk && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <span className="text-amber-950">
            Review the Form 16 and AIS salary difference.
          </span>
          <Button href="/file/import/mismatch" variant="secondary">
            Review difference
          </Button>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            E-verify method
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={eVerifyMethod ?? ""}
            onChange={(event) => setEVerifyMethod(event.target.value)}
          >
            <option value="">Choose method</option>
            <option value="aadhaar_otp">Aadhaar OTP (recommended)</option>
            <option value="netbanking">Net banking</option>
            <option value="itr_v">ITR-V by post</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Completed on incometax.gov.in after filing.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={bankValidated}
            onChange={(event) => setBankValidated(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0e5f63]"
          />
          <span>
            <strong className="block text-slate-900">
              Bank account checked
            </strong>
            I reviewed the bank account that will receive any refund.
          </span>
        </label>
      </div>

      {showCheckoutCta && (
        <FilingActions className="mt-5">
          <Button
            href={checkoutHref}
            disabled={!paymentBypass && !canProceed}
            onClick={() => {
              if (canProceed) markFinalReviewComplete();
            }}
            className="flex-1"
          >
            {paymentBypass
              ? "Open filing guide"
              : "Continue to choose a plan"}
          </Button>
          {secondaryAction}
        </FilingActions>
      )}

      {!canProceed && checklistGreen && !filingReadyForCheckout && (
        <p className="mt-2 text-xs text-slate-600">
          Complete the missing items shown above to continue.
        </p>
      )}
    </div>
  );
}
