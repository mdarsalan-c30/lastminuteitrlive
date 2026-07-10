"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { PortalGuideTable } from "@/components/filing/companion/PortalGuideTable";
import { EngineComputeFallback } from "@/components/filing/EngineComputeFallback";
import {
  Banner,
  Button,
  FilingActions,
  ScreenTitle,
  TrackerSteps,
} from "@/components/filing/ui";
import { OptimizationTips } from "@/components/filing/OptimizationTips";
import { formatINR } from "@/lib/format";
import { FILING_COMPANION } from "@/lib/copy/filing";
import { draftToUserInput } from "@/lib/engine/draftToUserInput";
import {
  draftToPortalSlice,
  fetchPersonalizedPortalGuide,
} from "@/lib/engine/portalGuideEngine";
import { getPortalGuide } from "@/lib/engine/client";
import type { PortalForm, PortalGuideResponse } from "@/lib/engine/types";
import { useTaxCompute } from "@/lib/hooks/useTaxCompute";
import { trackCompanionLoad } from "@/lib/monitoring/events";
import { usePaymentSession } from "@/lib/hooks/usePaymentSession";
import { isClientPaymentBypassEnabled } from "@/lib/payments/bypass";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import { useDraftStore } from "@/lib/store/draft";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FORMS: PortalForm[] = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"];
type CompanionViewMode = "guided" | "checklist";

const PortalWalkthroughWizard = dynamic(
  () =>
    import("@/components/filing/companion/PortalWalkthroughWizard").then(
      (mod) => mod.PortalWalkthroughWizard
    ),
  {
    loading: () => <PortalFootprintWizardSkeleton />,
    ssr: false,
  }
);

function SubmittedAckCard() {
  const router = useRouter();
  const markReturnSubmitted = useDraftStore((s) => s.markReturnSubmitted);
  const filingOutcome = useDraftStore((s) => s.filingOutcome);
  const [ack, setAck] = useState(filingOutcome.acknowledgementNumber);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const value = ack.trim();
    if (value.length < 6) {
      setError("Enter the acknowledgement number from the portal.");
      return;
    }
    markReturnSubmitted(value);
    router.push("/file/done");
  };

  return (
    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
      <p className="text-sm font-semibold text-slate-900">I submitted on the portal</p>
      <p className="text-xs text-slate-600">
        Paste your acknowledgement number to start the 30-day e-verify countdown.
      </p>
      <input
        type="text"
        value={ack}
        onChange={(e) => {
          setAck(e.target.value);
          setError(null);
        }}
        placeholder="Acknowledgement number"
        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
      />
      {error && <p className="text-xs text-amber-700">{error}</p>}
      <Button onClick={handleSubmit} className="w-full">
        Save &amp; continue
      </Button>
    </div>
  );
}

function PortalFootprintWizardSkeleton() {
  return (
    <div
      className="mb-6 rounded-xl border border-slate-200 bg-white p-6 animate-pulse"
      aria-hidden
    >
      <div className="h-5 w-48 rounded bg-slate-100" />
      <div className="mt-4 h-40 rounded-lg bg-slate-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-10 w-24 rounded bg-slate-100" />
        <div className="h-10 w-24 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function CompanionPageFallback() {
  return (
    <FilingLayout mirrorText="Loading your portal guide…">
      <div
        className="animate-pulse space-y-4"
        aria-busy="true"
        aria-label="Loading companion"
      >
        <div className="h-8 w-64 max-w-full rounded bg-slate-100" />
        <div className="h-4 w-full max-w-lg rounded bg-slate-100" />
        <div className="h-48 rounded-xl bg-slate-100" />
      </div>
    </FilingLayout>
  );
}

export default function CompanionPage() {
  return (
    <Suspense fallback={<CompanionPageFallback />}>
      <CompanionContent />
    </Suspense>
  );
}

function CompanionContent() {
  const searchParams = useSearchParams();
  const draft = useDraftStore();
  const { session, loading: sessionLoading } = usePaymentSession();
  const userInput = useMemo(() => draftToUserInput(draft), [draft]);
  const { result, compute, loading: computing, error: computeError, engineUnavailable, lastSnapshot } = useTaxCompute();
  const [useSnapshot, setUseSnapshot] = useState(false);
  const effectiveResult = result ?? (useSnapshot ? lastSnapshot : null);
  const [form, setForm] = useState<PortalForm>(
    (draft.recommendedForm as PortalForm) || "ITR-1"
  );
  const [guide, setGuide] = useState<PortalGuideResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [viewMode, setViewMode] = useState<CompanionViewMode>("guided");
  const [jsonExporting, setJsonExporting] = useState(false);
  const [jsonExportError, setJsonExportError] = useState<string | null>(null);
  const companionLoggedRef = useRef(false);

  const paymentBypass = isClientPaymentBypassEnabled();
  const exportUnlocked =
    paymentBypass ||
    (!sessionLoading && session?.verified === true && session.companionAccess === true);

  const justUnlocked = searchParams.get("unlocked") === "1" && exportUnlocked;
  const isDemoMode = searchParams.get("demo") === "1";

  const loadGuide = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setLoadWarning(null);
    const loadStartedAt = Date.now();
    try {
      if (!exportUnlocked) {
        const standardGuide = await getPortalGuide(form);
        setGuide(standardGuide);
        setLoadWarning(
          isDemoMode
            ? "Demo guide — exact copy-ready values unlock after payment."
            : "Free guide loaded — exact copy-ready values unlock after payment."
        );
        return;
      }

      const mismatches = draft.mismatchResolved ? [] : ["import-mismatch"];
      const data = await fetchPersonalizedPortalGuide({
        form,
        draft: draftToPortalSlice(draft),
        computeResult: effectiveResult ?? undefined,
        userInput,
        completedSteps: [],
        mismatches,
        paymentUnlocked: exportUnlocked,
      });
      setGuide(data);
      trackCompanionLoad({
        source: "client",
        form,
        durationMs: Date.now() - loadStartedAt,
      });
    } catch (err) {
      try {
        const fallback = await getPortalGuide(form);
        setGuide(fallback);
        setLoadWarning(
          "Personalized guide unavailable — showing standard checklist without your computed values."
        );
        trackCompanionLoad({
          source: "client",
          form,
          durationMs: Date.now() - loadStartedAt,
          error: "personalized_failed_used_static_fallback",
        });
      } catch {
        setGuide(null);
        setLoadError(
          err instanceof Error
            ? err.message
            : "We could not load your portal guide. Please try again."
        );
        trackCompanionLoad({
          source: "client",
          form,
          durationMs: Date.now() - loadStartedAt,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [exportUnlocked, form, effectiveResult, draft, userInput, isDemoMode]);

  useEffect(() => {
    if (companionLoggedRef.current) return;
    companionLoggedRef.current = true;
    void logSessionEvent("companion_open", {
      draft: draftSnapshotForLog(useDraftStore.getState()),
      meta: { form, bypass: paymentBypass, free: !exportUnlocked, demo: isDemoMode },
    });
  }, [exportUnlocked, paymentBypass, form, isDemoMode]);

  useEffect(() => {
    if (!exportUnlocked) return;
    compute(userInput);
  }, [compute, exportUnlocked, userInput]);

  useEffect(() => {
    // Free users get the standard guide; paid users get personalized values.
    // ?demo=1 is an explicit free-preview entry (marketing / help links).
    loadGuide();
  }, [exportUnlocked, isDemoMode, loadGuide, retryKey]);

  if (sessionLoading && !paymentBypass) {
    return (
      <FilingLayout mirrorText="Checking whether your portal guide is unlocked…">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-900">
            Checking payment access…
          </p>
          <p className="mt-2 text-sm text-slate-600">
            You can still use the free screen-by-screen guide. Exact copy-ready
            values unlock after payment.
          </p>
        </div>
      </FilingLayout>
    );
  }

  const handleRetry = () => setRetryKey((k) => k + 1);

  const handleItrJsonExport = async () => {
    if (!effectiveResult) return;
    const formSlug = form.toLowerCase().replace("-", ""); // "ITR-3" → "itr3"
    setJsonExporting(true);
    setJsonExportError(null);
    try {
      const response = await fetch(`/api/itr/export/${formSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, result: effectiveResult }),
      });
      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          validation?: { blocking?: string[] };
        };
        const blockingDetail = data.validation?.blocking?.[0];
        throw new Error(
          blockingDetail ?? data.error ?? "Could not export ITR JSON"
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lastminute-itr-${formSlug}-ay2026-27.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setJsonExportError(
        error instanceof Error ? error.message : "Could not export ITR JSON"
      );
    } finally {
      setJsonExporting(false);
    }
  };

  const mismatchBlock =
    !draft.mismatchResolved || (guide?.hasMismatches ?? false);

  return (
    <FilingLayout
      variant="companion"
      mirrorText="Each row maps to a field on the government portal. Copy values exactly — typos cause validation errors when you submit on incometax.gov.in."
    >
      <div className="companion-page-grid">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <ScreenTitle
                title={FILING_COMPANION.title}
                subtitle={FILING_COMPANION.subtitle}
                badge={
                  <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
                    Companion mode · Manual filing on ITD portal
                  </span>
                }
              />
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:pt-8">
              <label htmlFor="companion-form" className="text-sm font-medium text-slate-700">
                ITR form
              </label>
              <select
                id="companion-form"
                value={form}
                onChange={(e) => setForm(e.target.value as PortalForm)}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto"
              >
                {FORMS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {(computing || loading) && (
                <span className="text-sm text-slate-500">Loading figures…</span>
              )}
            </div>
          </div>

          {session?.passkey && (
            <Banner variant="info">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between w-full">
                <div>
                  <strong className="font-semibold text-slate-800">Chrome Extension Passkey: </strong>
                  <code className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-sm font-mono select-all text-primary font-bold">{session.passkey}</code>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    Valid for 7 days until {new Date(session.expiresAt || "").toLocaleDateString()}
                  </div>
                  <a
                    href="/api/invoices/mine?format=html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-700 underline underline-offset-2 whitespace-nowrap"
                  >
                    Download invoice
                  </a>
                </div>
              </div>
            </Banner>
          )}

      {justUnlocked && (
        <Banner variant="success">
          Your portal guide is unlocked — copy each value into incometax.gov.in as you
          go. {guide ? `${guide.steps.length} steps` : "Loading steps…"} with your
          return numbers pre-filled.
        </Banner>
      )}

      {!exportUnlocked && !sessionLoading && (
        <Banner variant="info">
          You are on the free screen-by-screen guide.{" "}
          <a
            href="/file/checkout/plans?reason=companion"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Unlock exact copy-ready values
          </a>{" "}
          after payment.
        </Banner>
      )}

      <EngineComputeFallback
        loading={computing}
        error={computeError}
        engineUnavailable={engineUnavailable}
        lastSnapshot={lastSnapshot}
        onRetry={() => {
          setUseSnapshot(false);
          void compute(userInput);
        }}
        onContinueWithSnapshot={() => setUseSnapshot(true)}
      />

      {loadWarning && (
        <div className="mb-4">
          <Banner variant="warning">{loadWarning}</Banner>
        </div>
      )}

      {loadError && !loading && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <p className="text-sm font-medium text-red-900">
            Could not load your portal guide
          </p>
          <p className="mt-1 text-sm text-red-700">{loadError}</p>
          <Button
            variant="primary"
            onClick={handleRetry}
            className="mt-4 min-h-11"
          >
            Try again
          </Button>
        </div>
      )}

      {(guide || viewMode === "guided") && (
        <>
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                View mode · Option B portal guide
              </p>
              <div className="grid grid-cols-2 gap-2 sm:w-auto">
                <Button
                  variant={viewMode === "guided" ? "primary" : "secondary"}
                  className="min-h-10 w-full text-xs sm:w-auto"
                  onClick={() => setViewMode("guided")}
                >
                  Screen-by-screen
                </Button>
                <Button
                  variant={viewMode === "checklist" ? "primary" : "secondary"}
                  className="min-h-10 w-full text-xs sm:w-auto"
                  onClick={() => setViewMode("checklist")}
                >
                  All fields
                </Button>
              </div>
              <div className="flex flex-col gap-1 sm:items-end">
                <Button
                  variant="secondary"
                  className="min-h-10 text-xs"
                  disabled={
                    !exportUnlocked ||
                    jsonExporting ||
                    !effectiveResult
                  }
                  onClick={handleItrJsonExport}
                >
                  {jsonExporting ? "Preparing JSON…" : `Download ${form} JSON`}
                </Button>
                {jsonExportError && (
                  <p className="max-w-xs text-xs text-amber-700">
                    {jsonExportError}
                  </p>
                )}
              </div>
          </div>
          {viewMode === "guided" && (
            <PortalWalkthroughWizard
              key={form}
              form={form}
              exportUnlocked={exportUnlocked}
              result={effectiveResult}
              userInput={userInput}
              formMismatch={
                Boolean(draft.recommendedForm) &&
                draft.recommendedForm !== form
              }
              recommendedForm={draft.recommendedForm}
            />
          )}
          {viewMode === "checklist" && guide && (
            <PortalGuideTable
              form={guide.form}
              steps={guide.steps}
              exportUnlocked={exportUnlocked}
              blockExport={mismatchBlock}
              mismatches={draft.mismatchResolved ? [] : ["import-mismatch"]}
            />
          )}
          {viewMode === "checklist" && !guide && !loading && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Field checklist unavailable for {form}. Use Screen-by-screen instead.
            </div>
          )}
        </>
      )}

      {!guide && !loading && !loadError && viewMode !== "guided" && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No portal guide available for {form}.
        </div>
      )}

      <FilingActions className="mt-4">
        <Button href="/file/support" variant="secondary" className="w-full sm:w-auto">
          Support & audit trail
        </Button>
        <Button href="/file" variant="ghost" className="w-full sm:w-auto">
          Back to filing
        </Button>
      </FilingActions>
        </div>

        <aside className="companion-summary-rail">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Accordion defaultValue={[]} multiple>
              <AccordionItem value="how-companion-works" className="border-b-0">
                <AccordionTrigger className="py-2">
                  How companion mode works (3 steps)
                </AccordionTrigger>
                <AccordionContent className="pb-1">
                  <ol className="text-tier-feature space-y-1.5 pl-4 list-decimal">
                    <li>Open incometax.gov.in in a second tab and keep this guide visible.</li>
                    <li>Follow each screen in order, copying only the values we mark.</li>
                    <li>Submit and e-verify on the portal yourself; we do not auto-file.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {effectiveResult?.regime_comparison && (
            <OptimizationTips
              recommendations={effectiveResult.recommendations}
              netPayable={
                effectiveResult.regime_comparison[
                  draft.regime ?? effectiveResult.regime_comparison.recommended_regime
                ].net_payable
              }
              recommendedRegime={effectiveResult.regime_comparison.recommended_regime}
              className="mb-0"
              limit={2}
            />
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 card-premium">
            <h4 className="text-sm font-semibold text-slate-900">What this means</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Each row maps to a field on incometax.gov.in. Copy values exactly — typos
              cause validation errors when you submit on the government portal.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">Filing progress</h2>
            <p className="text-tier-feature mt-1">
              After payment you file on incometax.gov.in yourself.
            </p>
            <div className="mt-3" id="filing-progress">
              <TrackerSteps
                steps={[
                  { label: "Payment", status: "done" },
                  { label: "File on portal", status: "current" },
                  { label: "E-verify", status: "pending" },
                  { label: "Refund", status: "pending" },
                ]}
              />
            </div>
            {effectiveResult?.regime_comparison && (
              <p className="text-tier-feature mt-3">
                <strong>Est. refund:</strong>{" "}
                <span className="tabular-nums">
                  {formatINR(
                    Math.max(
                      0,
                      -effectiveResult.regime_comparison[
                        draft.regime ?? effectiveResult.regime_comparison.recommended_regime
                      ].net_payable
                    )
                  )}
                </span>
              </p>
            )}
            <SubmittedAckCard />
          </div>

          <div className="text-xs">
            <Banner variant="info">
              Open{" "}
              <a
                href="https://www.incometax.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                incometax.gov.in
              </a>{" "}
              in another tab alongside this guide.
            </Banner>
          </div>
        </aside>
      </div>
    </FilingLayout>
  );
}
