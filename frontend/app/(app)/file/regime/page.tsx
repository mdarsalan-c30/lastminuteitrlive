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
import { ConfidencePanel } from "@/components/filing/ConfidencePanel";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import { OptimizationTips } from "@/components/filing/OptimizationTips";
import { TaxTraceExplainer } from "@/components/filing/TaxTraceExplainer";
import { WhyWeNeedThis } from "@/components/filing/OnboardingForm";
import { WHY_WE_ASK } from "@/lib/copy/trust";
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
import { CheckCircle2, TrendingDown } from "lucide-react";

export default function RegimePage() {
  const router = useRouter();
  const { regime, setRegime, mismatchResolved, filingPath, incomeChips } =
    useDraftStore();
  const [useSnapshot, setUseSnapshot] = useState(false);
  const [form10IeaAttested, setForm10IeaAttested] = useState(false);
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
  const needs10Iea = requiresForm10IeaAttestation(incomeChips, selected);
  const blockedBy10Iea = needs10Iea && !form10IeaAttested;

  const handleChoose = (r: "old" | "new") => {
    if (requiresForm10IeaAttestation(incomeChips, r) && !form10IeaAttested) {
      return;
    }
    setRegime(r);
    trackEvent("regime_compare_completion", {
      selected_regime: r,
      recommended_regime: recommended,
      savings_inr: savings,
    });
    // Proceed to the AI Smart CA tab
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
      mirrorText="Old regime lets you claim 80C, 80D, and HRA. New regime uses lower slabs but fewer deductions. You pick once per year."
    >
      <RiskBadge variant="green">Tax analysis</RiskBadge>

      <ScreenTitle
        title={FILING_REGIME.title}
        subtitle={
          loading
            ? FILING_REGIME.subtitleLoading
            : rc
              ? FILING_REGIME.subtitleResult(recommended, formatINR(savings))
              : FILING_REGIME.subtitleFallback
        }
      />

      <WhyWeNeedThis defaultOpen>
        <p>{WHY_WE_ASK.regime}</p>
        <p>{REGIME_COPY.defaultNew}</p>
        <p>
          Our recommendation is an estimate from your draft — you can pick either regime
          on the portal if you prefer.
        </p>
      </WhyWeNeedThis>

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
        isRefund ? (
          <Banner variant="success">
            Refund of {formatINR(Math.abs(selectedPay))} under the {selected} regime.
          </Banner>
        ) : (
          <Banner variant="warning">
            Tax payable: {formatINR(selectedPay)} before filing. Plan payment after review.
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
              title="Old regime"
              netLabel={oldPay < 0 ? "refund" : "payable"}
              amount={Math.abs(oldPay)}
              detail={`Tax ${formatINR(rc?.old.total_tax ?? 0)} · VI-A ${formatINR(effectiveResult?.deductions.total_chapter_via ?? 0)}`}
              selected={selected === "old"}
              recommended={recommended === "old"}
              disabled={!rc && !computeFailed}
              onClick={() => setRegime("old")}
            />
            <RegimeOption
              title="New regime"
              netLabel={newPay < 0 ? "refund" : "payable"}
              amount={Math.abs(newPay)}
              detail={`Tax ${formatINR(rc?.new.total_tax ?? 0)} · std ded + 80CCD(2) only`}
              selected={selected === "new"}
              recommended={recommended === "new"}
              disabled={!rc && !computeFailed}
              onClick={() => setRegime("new")}
            />
          </>
        )}
      </div>

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

      {!loading && rc && (
        <TaxTraceExplainer
          comparison={rc}
          selectedRegime={selected}
          className="mb-4"
        />
      )}

      {!loading && (
        <ConfidencePanel
          confidence={confidence}
          variant="compact"
          className="mb-4"
          showChecksDetail={false}
        />
      )}

      {!loading && effectiveResult?.regime_comparison && (
        <OptimizationTips
          recommendations={effectiveResult.recommendations}
          netPayable={selectedPay}
          recommendedRegime={effectiveResult.regime_comparison.recommended_regime}
          className="mb-4"
        />
      )}

      {!loading && rc && (
        <p className="mb-6 text-xs text-slate-500">
          Old regime beats new once your deductions cross ~
          {formatINR(rc.breakeven_deductions)} · Total income{" "}
          {formatINR(effectiveResult?.income_heads.gross_total_income ?? 0)}
        </p>
      )}

      <FilingActions
        hint={
          <p className="text-tier-feature">
            <strong>What happens next:</strong> We run a final risk review, then you
            pick a plan to unlock the portal filing guide.
          </p>
        }
      >
        <Button
          onClick={() => handleChoose(selected)}
          disabled={loading || (!rc && !computeFailed) || blockedBy10Iea}
        >
          I choose {selected === "new" ? "New" : "Old"} regime
        </Button>
      </FilingActions>

      {!mismatchResolved && (
        <p className="mt-3 text-xs text-amber-700">
          Some numbers in your documents don&apos;t match yet — sort them out
          before you file on the portal.
        </p>
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
  selected,
  recommended,
  disabled,
  onClick,
}: {
  title: string;
  netLabel: string;
  amount: number;
  detail: string;
  selected: boolean;
  recommended: boolean;
  disabled: boolean;
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
        recommended && selected && "regime-winner"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {recommended ? <TrendingDown className="size-3" /> : <CheckCircle2 className="size-3" />}
          Cheaper
        </span>
      )}
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-600">
        Net {netLabel}{" "}
        <strong className="text-lg tabular-nums text-foreground">
          {formatINR(amount)}
        </strong>
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </button>
  );
}
