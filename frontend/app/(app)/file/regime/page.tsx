"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Banner,
  Button,
  FilingActions,
  RiskBadge,
  ScreenTitle,
} from "@/components/filing/ui";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import { OptimizationTips } from "@/components/filing/OptimizationTips";
import { TaxTraceExplainer } from "@/components/filing/TaxTraceExplainer";
import { FILING_REGIME } from "@/lib/copy/filing";
import {
  REGIME_COPY,
  requiresForm10IeaAttestation,
} from "@/lib/copy/regime";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { useDraftStore } from "@/lib/store/draft";
import { trackEvent } from "@/lib/analytics";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export default function RegimePage() {
  const router = useRouter();
  const { regime, setRegime, mismatchResolved, filingPath, incomeChips, paidPlanId, markCalculationComplete } =
    useDraftStore();
  const isPaid = Boolean(paidPlanId);
  const [useSnapshot, setUseSnapshot] = useState(false);
  const [form10IeaAttested, setForm10IeaAttested] = useState(false);
  const {
    loading,
    error,
    isEstimated,
    engineUnavailable,
    result,
    lastSnapshot,
    userInput,
    compute,
  } = useDraftTaxCompute();

  const effectiveResult = result ?? (useSnapshot ? lastSnapshot : null);
  const rc = effectiveResult?.regime_comparison;
  const computeFailed =
    !loading && !rc && (isEstimated || engineUnavailable || !!error);
  const fallbackRegime = regime ?? "new";
  const recommended = rc?.recommended_regime ?? fallbackRegime;
  const selected = regime ?? recommended;
  const oldPay = rc?.old.net_payable ?? 0;
  const newPay = rc?.new.net_payable ?? 0;
  const savings = rc?.tax_saving ?? Math.abs(oldPay - newPay);
  const selectedPay = selected === "old" ? oldPay : newPay;
  const isRefund = selectedPay < 0;
  const sameEstimatedTax = Boolean(rc && oldPay === newPay);
  const needs10Iea = requiresForm10IeaAttestation(incomeChips, selected);
  const blockedBy10Iea = needs10Iea && !form10IeaAttested;

  const handleChoose = (r: "old" | "new") => {
    if (requiresForm10IeaAttestation(incomeChips, r) && !form10IeaAttested) {
      return;
    }
    setRegime(r);
    if (rc) markCalculationComplete();
    trackEvent("regime_compare_completion", {
      selected_regime: r,
      recommended_regime: recommended,
      savings_inr: savings,
    });
    // Proceed to the guided tax check.
    router.push("/file/advisor");
  };

  const handleRetry = () => {
    void compute(userInput);
  };

  return (
    <FilingLayout
      showNavRail
      activeNavSection="regime"
      variant="wide"
      mirrorText="Your tax regime decides which tax rates, deductions, and exemptions apply to your return."
    >
      <RiskBadge variant="green">TAX Comparison</RiskBadge>

      <ScreenTitle
        title="Old vs New Tax Regime"
        helpText="Why you need to choose: Your tax regime decides the tax rates and deductions that will apply to your return. The New Tax Regime is selected by default. However, the Old Tax Regime may result in lower tax if you have enough eligible deductions and exemptions. Our recommendation is based on the information added so far. You can review and change your selection before filing."
        subtitle={
          loading
            ? FILING_REGIME.subtitleLoading
            : rc
              ? FILING_REGIME.subtitleResult(recommended, formatINR(savings))
              : FILING_REGIME.subtitleFallback
        }
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

      {computeFailed && !error && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handleRetry}
            disabled={loading}
          >
            Retry calculation
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleChoose(fallbackRegime)}
            disabled={
              loading ||
              (requiresForm10IeaAttestation(incomeChips, fallbackRegime) &&
                !form10IeaAttested)
            }
          >
            Continue with estimates ({fallbackRegime === "new" ? "New" : "Old"}{" "}
            regime)
          </Button>
        </div>
      )}

      {!loading && effectiveResult && (
        <Banner variant="success">
          ✓ {effectiveResult.profile.itr_form} computed · compare regimes below
        </Banner>
      )}

      {!loading && rc && (
        isPaid ? (
          isRefund ? (
            <Banner variant="success">
              Refund of {formatINR(Math.abs(selectedPay))} under the {selected} regime.
            </Banner>
          ) : null
        ) : (
          <Banner variant="success">
            {sameEstimatedTax
              ? "Both regimes currently show the same estimated tax."
              : `Recommended: ${recommended === "old" ? "Old" : "New"} Tax Regime based on the details added so far.`}{" "}
            Pay to unlock the detailed calculation.
          </Banner>
        )
      )}

      <div className="filing-card-grid mb-4">
        {loading ? (
          <>
            <RegimeCardSkeleton />
            <RegimeCardSkeleton />
          </>
        ) : (
          <>
            <RegimeOption
              title="Old Tax Regime"
              netLabel={oldPay < 0 ? "Estimated Refund:" : "Estimated Tax Payable:"}
              amount={Math.abs(oldPay)}
              detail={isPaid ? `Tax ${formatINR(rc?.old.total_tax ?? 0)} · VI-A ${formatINR(effectiveResult?.deductions.total_chapter_via ?? 0)}` : "Pay to unlock the detailed calculation"}
              selected={selected === "old"}
              badgeLabel={
                sameEstimatedTax
                  ? "Same Estimated Tax"
                  : recommended === "old"
                    ? "Recommended"
                    : undefined
              }
              disabled={!rc && !computeFailed}
              onClick={() => setRegime("old")}
              blurAmount={!isPaid}
            />
            <RegimeOption
              title="New Tax Regime"
              netLabel={newPay < 0 ? "Estimated Refund:" : "Estimated Tax Payable:"}
              amount={Math.abs(newPay)}
              detail={isPaid ? `Tax ${formatINR(rc?.new.total_tax ?? 0)} · standard deduction and 80CCD(2) only` : "Pay to unlock the detailed calculation"}
              description="Offers different tax slabs with fewer deductions and exemptions to claim."
              selected={selected === "new"}
              badgeLabel={
                sameEstimatedTax
                  ? "Same Estimated Tax"
                  : recommended === "new"
                    ? "Recommended"
                    : undefined
              }
              disabled={!rc && !computeFailed}
              onClick={() => setRegime("new")}
              blurAmount={!isPaid}
            />
          </>
        )}
      </div>

      {sameEstimatedTax && (
        <Banner variant="info">
          Both regimes currently show the same estimated tax. Add all your income
          and deduction details for a more accurate comparison.
        </Banner>
      )}

      {isEstimated && (
        <Banner variant="info">
          <strong>Estimate Mode.</strong> These results are based on the details
          currently available. Upload your Form 16, AIS, and Capital Gains
          documents before filing to improve the accuracy of your tax calculation.
        </Banner>
      )}

      {needs10Iea && (
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-2">
          <h3 className="font-semibold text-amber-950">{REGIME_COPY.form10IeaTitle}</h3>
          <p className="text-sm text-amber-900">{REGIME_COPY.form10IeaBody}</p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={form10IeaAttested}
              onChange={(e) => setForm10IeaAttested(e.target.checked)}
            />
            <span>{REGIME_COPY.form10IeaCheckbox}</span>
          </label>
          {blockedBy10Iea && (
            <p className="text-xs text-amber-800">
              {REGIME_COPY.blockedWithoutAttestation}
            </p>
          )}
        </div>
      )}

      {isPaid && !loading && rc && (
        <TaxTraceExplainer
          comparison={rc}
          selectedRegime={selected}
          className="mb-4"
        />
      )}

      {isPaid && !loading && effectiveResult?.regime_comparison && (
        <OptimizationTips
          recommendations={effectiveResult.recommendations}
          netPayable={selectedPay}
          recommendedRegime={effectiveResult.regime_comparison.recommended_regime}
          className="mb-4"
        />
      )}

      {isPaid && !loading && rc && (
        <p className="mb-6 text-xs text-slate-500">
          Old regime beats new once your deductions cross ~
          {formatINR(rc.breakeven_deductions)} · Total income{" "}
          {formatINR(effectiveResult?.income_heads.gross_total_income ?? 0)}
        </p>
      )}

      <FilingActions
        hint={
          <p className="text-tier-feature">
            <strong>What happens next:</strong> We will review your return for
            missing details. Select a plan and continue to the filing guide.
          </p>
        }
      >
        <Button
          onClick={() => handleChoose(selected)}
          disabled={loading || (!rc && !computeFailed) || blockedBy10Iea}
        >
          Choose {selected === "new" ? "New" : "Old"} Tax Regime
        </Button>
      </FilingActions>

      {!mismatchResolved && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-amber-700">
          <p>
            Details might differ across your documents. Review them before filing
            your return.
          </p>
          <Button href="/file/import/mismatch" variant="secondary">
            Review Document Differences
          </Button>
        </div>
      )}
    </FilingLayout>
  );
}

function RegimeCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm animate-pulse"
      aria-hidden
    >
      <div className="h-5 w-24 rounded bg-slate-100" />
      <div className="mt-3 h-7 w-36 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-full rounded bg-slate-100" />
    </div>
  );
}

function RegimeOption({
  title,
  netLabel,
  amount,
  detail,
  description,
  selected,
  badgeLabel,
  disabled,
  blurAmount,
  onClick,
}: {
  title: string;
  netLabel: string;
  amount: number;
  detail: string;
  description?: string;
  selected: boolean;
  badgeLabel?: string;
  disabled: boolean;
  blurAmount?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-5 text-left transition-all sm:p-6",
        selected
          ? "border-primary/40 bg-primary/5 shadow-md ring-2 ring-primary/10"
          : "border-slate-200/80 bg-white shadow-sm hover:shadow-md",
        badgeLabel === "Recommended" && selected && "regime-winner"
      )}
    >
      {badgeLabel && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          <CheckCircle2 className="size-3" />
          {badgeLabel}
        </span>
      )}
      <h4 className="font-bold text-slate-900">{title}</h4>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <p className="mt-2 text-sm text-slate-600">
        {netLabel}{" "}
        <strong className={cn("text-lg tabular-nums text-foreground", blurAmount && "blur-sm select-none opacity-50")}>
          {formatINR(amount)}
        </strong>
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </button>
  );
}
