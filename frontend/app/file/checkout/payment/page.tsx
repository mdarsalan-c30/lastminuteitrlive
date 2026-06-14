"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { getPlan } from "@/lib/payments/plans";
import { getEffectivePrice, getDisplayPricing, formatPlanPriceLabel } from "@/lib/marketing/pricing";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import RazorpayButton from "@/components/filing/checkout/RazorpayButton";
import { usePaymentSession } from "@/lib/hooks/usePaymentSession";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { CHECKOUT_PAYMENT, FILING_COMPANION } from "@/lib/copy/filing";
import { PAYMENT_COPY } from "@/lib/copy/marketing";
import { formatINR } from "@/lib/format";
import {
  Banner,
  Card,
  FilingActions,
  ScreenTitle,
} from "@/components/filing/ui";

export default function PaymentPage() {
  const router = useRouter();
  const { plan, regime, setPaymentVerified } = useDraftStore();
  const { refresh: refreshPaymentSession } = usePaymentSession();
  const [useSnapshot, setUseSnapshot] = useState(false);
  const {
    loading,
    error,
    engineUnavailable,
    result,
    lastSnapshot,
    userInput,
    compute,
  } = useDraftTaxCompute();
  const selectedPlan = getPlan(plan);
  const effectivePrice = getEffectivePrice(plan);
  const displayPricing = getDisplayPricing(plan);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const effectiveResult = result ?? (useSnapshot ? lastSnapshot : null);
  const rc = effectiveResult?.regime_comparison;
  const activeRegime = regime ?? rc?.recommended_regime ?? "new";
  const netPayable = rc ? rc[activeRegime].net_payable : null;
  const refundAmount =
    netPayable !== null && netPayable < 0 ? Math.abs(netPayable) : 0;
  const taxDue = netPayable !== null && netPayable > 0 ? netPayable : 0;

  return (
    <FilingLayout
      mirrorText="You're paying for the step-by-step portal guide — not government filing. Refund and tax-due figures are estimates based on what you've entered so far."
    >
      <ScreenTitle
        title={CHECKOUT_PAYMENT.title}
        subtitle={CHECKOUT_PAYMENT.subtitle}
      />

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

      <Card recommended>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-700">
              <strong>Estimated refund (if ITD accepts your return):</strong>{" "}
              <span className="tabular-nums">{formatINR(refundAmount)}</span>
            </p>
            <p className="text-sm text-slate-700 mt-1">
              <strong>Tax due before filing:</strong>{" "}
              <span className="tabular-nums">{formatINR(taxDue)}</span>
            </p>
            {netPayable !== null && (
              <p className="text-xs text-slate-500 mt-2">
                Based on your {activeRegime} regime selection. Final amount
                confirmed only after ITD processes your return.
              </p>
            )}
            {netPayable === null && error && (
              <p className="text-xs text-amber-700 mt-2">
                Tax estimate unavailable — figures shown as ₹0 until your draft
                is recalculated.
              </p>
            )}
          </>
        )}
        <p className="text-sm text-slate-700 mt-3">
          <strong>Plan:</strong> {selectedPlan.name} ·{" "}
          <span className="tabular-nums">
            {displayPricing.showOffer && displayPricing.original !== undefined ? (
              <>
                {formatPlanPriceLabel(effectivePrice)}{" "}
                <span className="text-slate-500 line-through">
                  {formatPlanPriceLabel(displayPricing.original)}
                </span>
              </>
            ) : (
              formatPlanPriceLabel(effectivePrice)
            )}
          </span>
        </p>
      </Card>

      <Banner variant="info">
        Refunds go to your pre-validated bank account only after ITD processes your return.
      </Banner>

      <Banner variant="info">
        {FILING_COMPANION.paywallHeadline} — copy each value into incometax.gov.in yourself.
        We never auto-submit to the Income Tax Department. Independently operated — not
        affiliated with ITD.
      </Banner>

      {paymentError && (
        <Banner variant="critical">{paymentError}</Banner>
      )}

      <p className="text-xs text-slate-500">
        By paying you agree to our{" "}
        <Link href="/terms" className="text-primary underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/refund-policy" className="text-primary underline">
          Refund Policy
        </Link>
        . This unlocks your portal filing guide — you file and e-verify on incometax.gov.in
        yourself.
      </p>

      <FilingActions
        hint={
          <p className="text-tier-legal">
            {PAYMENT_COPY.secureLine} · {PAYMENT_COPY.portalLine}
          </p>
        }
      >
        <RazorpayButton
          planId={plan}
          onSuccess={async () => {
            setPaymentVerified(plan);
            await refreshPaymentSession();
            router.push("/file/companion?unlocked=1");
          }}
          onError={setPaymentError}
          className="min-h-11 w-full md:w-auto"
        />
      </FilingActions>
    </FilingLayout>
  );
}
