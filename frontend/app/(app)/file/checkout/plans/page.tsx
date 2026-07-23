"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useDraftStore } from "@/lib/store/draft";
import { PLAN_LIST, PLANS } from "@/lib/payments/plans";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PaywallValueStack } from "@/components/filing/PaywallValueStack";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { CHECKOUT_PLANS, FILING_COMPANION } from "@/lib/copy/filing";
import { CA_REVIEW_COMING_SOON } from "@/lib/copy/trust";
import { companionStepCountForForm } from "@/lib/filing/confidence";
import { resolveCheckoutGate } from "@/lib/filing/checkoutGate";
import { recommendPlanFromConfidence } from "@/lib/filing/planRecommendation";
import { Banner, Button, FilingActions, ScreenTitle } from "@/components/filing/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600 text-center font-medium">Loading filing plans...</div>}>
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

  const income = useDraftStore((s) => s.income);
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const connectedConnectors = useDraftStore((s) => s.connectedConnectors);
  const aisGrossSalary = useDraftStore((s) => s.aisFigures?.grossSalary);

  const { loading, confidence, regimeSavings, engineUnavailable } =
    useDraftTaxCompute();

  const hasOpenMismatch =
    connectedConnectors.includes("ais") &&
    typeof aisGrossSalary === "number" &&
    Math.abs(aisGrossSalary - income.grossSalary) > 100;

  const gate = resolveCheckoutGate({
    mismatchResolved,
    mismatchProceedWithExplanation,
    confidence,
    engineUnavailable,
    loading,
    hasOpenMismatch,
  });

  const mismatchesResolved =
    mismatchResolved || mismatchProceedWithExplanation ? 2 : 0;

  const companionSteps = companionStepCountForForm(recommendedForm);
  const recommendedPlan = recommendPlanFromConfidence(confidence);
  const companionRedirect = searchParams.get("reason") === "companion";
  const selectedPlan = PLANS[plan];
  const checkoutBlocked = selectedPlan?.comingSoon === true;

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

  const hasBusinessIncome =
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive") ||
    (income.businessRevenue ?? 0) > 0 ||
    (income.freelanceRevenue ?? 0) > 0;

  const hasSalaryIncome =
    income.grossSalary > 0 || incomeChips.includes("salary");

  const hasCapitalGainsIncome =
    incomeChips.includes("capital_gains") || capitalGains !== null;

  const planAudience =
    hasBusinessIncome && hasSalaryIncome
      ? "resident salaried + business/freelance"
      : hasBusinessIncome
        ? "resident business & freelance"
        : "resident salaried";

  const handlePlanSelect = (planId: typeof plan) => {
    if (!gate.canCheckout || PLANS[planId].comingSoon) return;
    setPlan(planId);
    trackEvent("plan_select", { plan_id: planId });
  };

  const paidPlans = PLAN_LIST.filter((p) => p.id !== "free");

  return (
    <FilingLayout
      mirrorText="Plans unlock the step-by-step portal guide - you still file yourself on incometax.gov.in. No government submission from us."
    >
      <ScreenTitle
        title={CHECKOUT_PLANS.title}
        subtitle={CHECKOUT_PLANS.subtitle}
      />

      {companionRedirect && (
        <Banner variant="info">
          Unlock the portal filing guide by choosing a plan below.{" "}
          {CA_REVIEW_COMING_SOON} DIY and AI Smart are available now.
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
        <div className="mb-6">
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
        <div className="mb-6">
          <Banner variant="info">
            Tax calculation is temporarily unavailable, but you can still
            checkout. Your filing guide will use saved draft figures -
            double-check amounts before filing on the portal.
          </Banner>
        </div>
      )}

      {/* Pricing Cards Container */}
      <div className="mb-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Select Your Filing Plan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose the right plan suited for your income sources and tax filing needs.
          </p>
        </div>

        {/* Clean Pill Cards Grid Matching Screenshot */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {paidPlans.map((p) => {
            const isSelected = plan === p.id;
            const isRecommended = recommendedPlan === p.id;
            const isPopular = isRecommended || p.id === "pro";

            // Price formatting
            const price = p.price ?? 0;
            const originalPrice = p.originalPrice || Math.round(price * 1.45);
            const features = p.features || [
              "Unlimited draft profile calculations",
              "AI document parsing & Form 16 upload",
              "Step-by-step Portal Filing Guide",
              "100% Tax compliance checks",
            ];

            return (
              <div
                key={p.id}
                onClick={() => handlePlanSelect(p.id)}
                className={cn(
                  "relative flex flex-col justify-between rounded-[32px] bg-white p-8 transition-all duration-300 cursor-pointer select-none",
                  isPopular
                    ? "border-2 border-[#0e5f63] shadow-[0_20px_50px_rgba(14,95,99,0.12)]"
                    : "border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md",
                  !gate.canCheckout && "opacity-80"
                )}
              >
                {/* Popular / Recommended Pill Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 rounded-full bg-[#0e5f63] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {isRecommended ? "RECOMMENDED FOR YOU" : "MOST POPULAR"}
                  </div>
                )}

                <div>
                  {/* Card Title & Subtitle */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {p.subtitle || p.description || "Comprehensive filing support"}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        ₹{price}
                      </span>
                      {originalPrice > price && (
                        <span className="text-lg font-semibold text-slate-400 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>
                    {p.subtext && (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {p.subtext}
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-6 mb-8">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0e5f63] mt-0.5">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Pill Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(p.id);
                  }}
                  disabled={!gate.canCheckout || p.comingSoon}
                  className={cn(
                    "w-full rounded-full py-3.5 px-6 font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2",
                    isSelected || isPopular
                      ? "bg-[#0e5f63] text-white hover:bg-[#0b4b4e] active:scale-[0.99]"
                      : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    (!gate.canCheckout || p.comingSoon) && "opacity-60 cursor-not-allowed"
                  )}
                >
                  {p.comingSoon ? (
                    "Coming Soon"
                  ) : isSelected ? (
                    <>
                      <span>Selected Plan</span>
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    "Select Plan"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mb-6 text-center text-xs text-slate-500">
        Who this plan is for: <span className="font-semibold text-slate-700">{planAudience}</span> - {recommendedForm}
        {hasCapitalGainsIncome ? " - capital gains covered" : ""}
      </p>

      {/* Accordion */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6">
        <Accordion defaultValue={[]} multiple>
          <AccordionItem value="portal-guide-coverage" className="border-b-0 py-2">
            <AccordionTrigger className="text-sm font-semibold text-slate-800">
              What&apos;s included in portal guide
            </AccordionTrigger>

            <AccordionContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <span className="font-semibold text-slate-900">ITR-1:</span>{" "}
                  Salary, deductions, taxes paid, preview and submit flow.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-2:</span>{" "}
                  Salary if applicable, capital gains, other income, Part D tax
                  checks.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-3:</span>{" "}
                  Business schedules, salary mix, deductions, Part D tax
                  verification.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">ITR-4:</span>{" "}
                  Presumptive 44AD/44ADA path, salary mix, deductions and taxes
                  paid.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Bottom Sticky Action Bar */}
      <FilingActions
        hint={
          <p className="text-xs text-slate-500">
            <strong>What happens next:</strong> {CHECKOUT_PLANS.nextStep}
          </p>
        }
      >
        <Button
          href={
            gate.canCheckout && !checkoutBlocked
              ? "/file/checkout/payment"
              : undefined
          }
          disabled={!gate.canCheckout || checkoutBlocked}
          className="w-full rounded-full bg-[#0e5f63] py-3.5 px-8 text-sm font-bold text-white shadow-lg shadow-[#0e5f63]/20 hover:bg-[#0b5458] sm:w-auto"
        >
          {FILING_COMPANION.paywallHeadline}
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}