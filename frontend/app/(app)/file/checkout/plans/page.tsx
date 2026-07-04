"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useDraftStore } from "@/lib/store/draft";
import { PLAN_LIST, PLANS } from "@/lib/payments/plans";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PaywallValueStack } from "@/components/filing/PaywallValueStack";
import { PlanCard } from "@/components/pricing/PlanCard";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import {
  CHECKOUT_PLANS,
  FILING_COMPANION,
} from "@/lib/copy/filing";
import { CA_REVIEW_COMING_SOON } from "@/lib/copy/trust";
import { CHECKOUT as CHECKOUT_STRINGS } from "@/lib/copy/strings";
import { companionStepCountForForm } from "@/lib/filing/confidence";
import { resolveCheckoutGate } from "@/lib/filing/checkoutGate";
import { recommendPlanFromConfidence } from "@/lib/filing/planRecommendation";
import {
  Banner,
  Button,
  FilingActions,
  ScreenTitle,
  Card,
} from "@/components/filing/ui";
import { usePaymentSession } from "@/lib/hooks/usePaymentSession";
import { getBrowserSessionId } from "@/lib/store/sessionInit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { triggerConfetti } from "@/components/filing/Confetti";

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <PlansContent />
    </Suspense>
  );
}

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    plan,
    setPlan,
    recommendedForm,
    mismatchResolved,
    mismatchProceedWithExplanation,
  } = useDraftStore();

  const { loading, confidence, regimeSavings, engineUnavailable } =
    useDraftTaxCompute();
  const [couponNoteVisible, setCouponNoteVisible] = useState(false);

  const gate = resolveCheckoutGate({
    mismatchResolved,
    mismatchProceedWithExplanation,
    confidence,
    engineUnavailable,
    loading,
  });

  const mismatchesResolved =
    mismatchResolved || mismatchProceedWithExplanation ? 2 : 0;
  const companionSteps = companionStepCountForForm(recommendedForm);
  const recommendedPlan = recommendPlanFromConfidence(confidence);
  const companionRedirect = searchParams.get("reason") === "companion";
  const selectedPlan = PLANS[plan];
  const checkoutBlocked = selectedPlan.comingSoon === true;

  useEffect(() => {
    if (plan === "ca") {
      setPlan(recommendedPlan === "ca" ? "pro" : recommendedPlan);
    }
  }, [plan, recommendedPlan, setPlan]);

  useEffect(() => {
    trackEvent("paywall_view", {
      filing_ready: gate.canCheckout,
      recommended_plan: recommendedPlan,
    });
  }, [gate.canCheckout, recommendedPlan]);

  useEffect(() => {
    if (!loading && gate.canCheckout) {
      setPlan(recommendedPlan);
    }
  }, [loading, gate.canCheckout, recommendedPlan, setPlan]);

  const handlePlanSelect = (planId: typeof plan) => {
    if (!gate.canCheckout || PLANS[planId].comingSoon) return;
    setPlan(planId);
    trackEvent("plan_select", { plan_id: planId });
  };

  const paidPlans = PLAN_LIST.filter((p) => p.id !== "free");

  return (
    <FilingLayout
      mirrorText="Plans unlock the step-by-step portal guide — you still file yourself on incometax.gov.in. No government submission from us."
    >
      <ScreenTitle title={CHECKOUT_PLANS.title} subtitle={CHECKOUT_PLANS.subtitle} />

      {companionRedirect && (
        <Banner variant="info">
          Unlock the portal filing guide by choosing a plan below. {CA_REVIEW_COMING_SOON}{" "}
          DIY and AI Smart are available now.
        </Banner>
      )}

      <PaywallValueStack
        regimeSavings={regimeSavings}
        mismatchesResolved={mismatchesResolved}
        companionStepCount={companionSteps}
        completenessScore={confidence.completeness_score}
        missingDocCount={confidence.missing_documents.length}
        recommendedPlan={recommendedPlan}
      />

      {!loading && !gate.canCheckout && (
        <div className="mb-4">
          <Banner variant="info">
            You&apos;re {Math.round(gate.completenessScore)}% ready to checkout.{" "}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => router.push(gate.blockingHref)}
            >
              {gate.blockingLabel}
            </button>{" "}
            to unlock payment.
          </Banner>
        </div>
      )}

      {!loading && gate.engineOverride && (
        <div className="mb-4">
          <Banner variant="info">
            Tax calculation is temporarily unavailable, but you can still checkout.
            Your filing guide will use saved draft figures — double-check amounts
            before filing on the portal.
          </Banner>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm mb-6 border border-slate-200/60 ring-1 ring-slate-100/50">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <svg className="w-32 h-32 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="relative z-10 mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Select your filing plan</h2>
          <p className="text-slate-500 text-sm">Unlock the step-by-step portal guide tailored for you.</p>
        </div>
        <div className="filing-card-grid relative z-10">
          {paidPlans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              variant="checkout"
              selected={plan === p.id}
              engineRecommended={recommendedPlan === p.id}
              disabled={!gate.canCheckout}
              onSelect={() => handlePlanSelect(p.id)}
            />
          ))}
        </div>
      </div>


      <p className="text-xs text-slate-500 mb-6">
        Who this plan is for: resident salaried · {recommendedForm} · no capital gains
      </p>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Have a Coupon Code?</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="plans-coupon"
            placeholder="Enter coupon code"
            aria-describedby="plans-coupon-note"
            onChange={(e) => setCouponNoteVisible(e.target.value.length > 0)}
            className="flex-1 min-h-12 px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono bg-slate-50 text-slate-900"
          />
          <button
            type="button"
            className="min-h-12 px-6 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
            onClick={() => {
              const el = document.getElementById("plans-coupon") as HTMLInputElement;
              setCouponNoteVisible(Boolean(el?.value));
            }}
          >
            Apply Code
          </button>
        </div>
        {couponNoteVisible && (
          <p id="plans-coupon-note" className="mt-3 text-sm text-slate-600" role="status">
            {CHECKOUT_STRINGS.couponAtPayment}
          </p>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4">
        <Accordion defaultValue={[]} multiple>
          <AccordionItem value="portal-guide-coverage" className="border-b-0">
            <AccordionTrigger>
              What&apos;s included in portal guide
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">ITR-1:</span> Salary,
                  deductions, taxes paid, preview and submit flow.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-2:</span> Salary
                  (if applicable), capital gains, other income, Part D tax checks.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-3:</span> Business
                  schedules, salary mix, deductions, Part D tax verification.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-4:</span>{" "}
                  Presumptive 44AD/44ADA path, salary mix, deductions and taxes paid.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>


      <FilingActions
        hint={
          <p className="text-tier-feature">
            <strong>What happens next:</strong> {CHECKOUT_PLANS.nextStep}
          </p>
        }
      >
        <Button
          href={gate.canCheckout && !checkoutBlocked ? "/file/checkout/payment" : undefined}
          disabled={!gate.canCheckout || checkoutBlocked}
          className="w-full sm:w-auto"
        >
          {FILING_COMPANION.paywallHeadline}
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}
