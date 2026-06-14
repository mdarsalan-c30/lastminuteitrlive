"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { isClientPaymentBypassEnabled } from "@/lib/payments/bypass";
import { useDraftStore } from "@/lib/store/draft";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import { ConfidencePanel } from "@/components/filing/ConfidencePanel";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import type { ReactNode } from "react";
import { Banner, Button, FilingActions } from "@/components/filing/ui";

const CHECKLIST = [
  { id: "form", label: "Correct ITR form", status: "pass" as const },
  { id: "mismatch", label: "Critical mismatches resolved", status: "pass" as const },
  { id: "bank", label: "Bank account validated", status: "pass" as const },
  { id: "everify", label: "E-verify method selected", status: "pending" as const },
  { id: "reminder", label: "30-day verify reminder set", status: "pass" as const },
];

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
    regime,
    eVerifyMethod,
    setEVerifyMethod,
  } = useDraftStore();
  const { loading, confidence, engineUnavailable } = useDraftTaxCompute({ readOnly: true });

  const checks = CHECKLIST.map((c) => {
    if (c.id === "form") {
      return { ...c, label: `Correct ITR form (${recommendedForm})`, status: "pass" as const };
    }
    if (c.id === "mismatch") {
      return {
        ...c,
        status:
          mismatchResolved || mismatchProceedWithExplanation
            ? ("pass" as const)
            : ("pending" as const),
      };
    }
    if (c.id === "bank") {
      return { ...c, status: bankValidated ? ("pass" as const) : ("pending" as const) };
    }
    if (c.id === "everify") {
      return { ...c, status: eVerifyMethod ? ("pass" as const) : ("pending" as const) };
    }
    return c;
  });

  const mismatchOk = mismatchResolved || mismatchProceedWithExplanation;
  const checklistGreen = mismatchOk && bankValidated && regime && eVerifyMethod;
  const filingReadyForCheckout =
    confidence.filing_ready || (!loading && engineUnavailable);
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
  const checkoutLabel = paymentBypass
    ? "Open filing guide"
    : "Choose plan & unlock guide";
  const ctaDisabled = paymentBypass ? false : !canProceed;

  return (
    <div className={className} id="final-check">
      <h2 className="text-lg font-semibold text-slate-900">Pre-submit checklist</h2>
      <p className="mt-1 text-sm text-slate-600">
        {paymentBypass
          ? "Complete as many items as you can. Testing mode lets you open the filing guide even if some items are pending."
          : "All items must be green before you choose a plan and unlock your filing guide."}
      </p>

      {!loading && (
        <ConfidencePanel confidence={confidence} variant="compact" className="mt-4 mb-4" />
      )}

      {paymentBypass && !canProceed && !loading && (
        <Banner variant="warning">
          Some checklist items are still pending. You can open the filing guide for
          testing, but resolve mismatches and bank details before filing on the portal.
        </Banner>
      )}

      {!filingReadyForCheckout && !loading && (
        <Banner variant="info">
          Filing confidence is not ready yet. Upload missing documents or resolve
          mismatches before choosing a plan.
        </Banner>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4 mt-4">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center gap-2 py-2 text-sm border-b border-slate-100 last:border-0 ${
              check.status === "pass" ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <span>{check.status === "pass" ? "✓" : "○"}</span>
            <span>{check.label}</span>
          </div>
        ))}
      </div>

      {!eVerifyMethod && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select e-verify method
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={eVerifyMethod ?? ""}
            onChange={(e) => setEVerifyMethod(e.target.value)}
          >
            <option value="">Choose method</option>
            <option value="aadhaar_otp">Aadhaar OTP (recommended)</option>
            <option value="netbanking">Net banking</option>
            <option value="itr_v">ITR-V by post</option>
          </select>
        </div>
      )}

      <Banner variant="info">
        After you file on incometax.gov.in, you must e-verify on the portal within 30 days.
      </Banner>

      {showCheckoutCta && (
        <FilingActions className="mt-4">
          <Button
            href={checkoutHref}
            disabled={ctaDisabled}
            className="flex-1"
          >
            {checkoutLabel}
          </Button>
          {secondaryAction}
        </FilingActions>
      )}

      {!canProceed && checklistGreen && !filingReadyForCheckout && (
        <p className="text-xs text-slate-600 mt-2">
          Complete filing confidence requirements above to unlock checkout.
        </p>
      )}
    </div>
  );
}
