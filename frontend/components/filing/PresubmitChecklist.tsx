"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { isClientPaymentBypassEnabled } from "@/lib/payments/bypass";
import { useDraftStore } from "@/lib/store/draft";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { Button, FilingActions } from "@/components/filing/ui";
import { resolveCheckoutGate } from "@/lib/filing/checkoutGate";

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
  const router = useRouter();
  const {
    recommendedForm,
    mismatchResolved,
    mismatchProceedWithExplanation,
    connectedConnectors,
    income,
    regime,
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
  const checklistGreen = Boolean(mismatchOk && regime);
  const checkoutGate = resolveCheckoutGate({
    mismatchResolved,
    mismatchProceedWithExplanation,
    confidence,
    engineUnavailable,
    loading,
    hasOpenMismatch,
  });
  const canProceed = checklistGreen && checkoutGate.canCheckout;
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
      {!mismatchOk && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <span className="text-amber-950">
            Review the Form 16 and AIS salary difference.
          </span>
          <Button href="/file/import/mismatch" variant="secondary">
            Review difference
          </Button>
        </div>
      )}

      {showCheckoutCta && (
        <FilingActions className={mismatchOk ? "" : "mt-5"}>
          <Button
            disabled={!paymentBypass && !canProceed}
            onClick={() => {
              if (!checkoutHref) return;
              if (canProceed) {
                markFinalReviewComplete();
              }
              router.push(checkoutHref);
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

      {!canProceed && checklistGreen && !checkoutGate.canCheckout && (
        <p className="mt-2 text-xs text-slate-600">
          Complete the tax calculation or review the open difference to continue.
        </p>
      )}
    </div>
  );
}
