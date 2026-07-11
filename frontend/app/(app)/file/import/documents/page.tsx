"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import ConnectorGrid from "@/components/filing/connectors/ConnectorGrid";
import {
  QuickEstimateForm,
  EMPTY_QUICK_ESTIMATE,
  type QuickEstimateValues,
} from "@/components/filing/import/QuickEstimateForm";
import {
  Banner,
  Button,
  FilingActions,
  ScreenTitle,
} from "@/components/filing/ui";
import { ItrAnalyticsPanel } from "@/components/filing/ItrAnalyticsPanel";
import { WhyWeAskHint } from "@/components/filing/WhyWeAskHint";
import { WHY_WE_ASK } from "@/lib/copy/trust";
import { FILING_IMPORT } from "@/lib/copy/filing";
import { useDraftStore } from "@/lib/store/draft";
import { trackEvent } from "@/lib/analytics";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { useItrAiSummary } from "@/lib/hooks/useItrAiSummary";
import {
  applySalariedFastPathDefaults,
  FORM16_FAST_PATH_SOURCE,
  isForm16FastPath,
} from "@/lib/filing/routes";
import { getImportContinueHref, type ImportStartMode } from "@/lib/filing/importModes";
import { BROKER_DOWNLOAD_GUIDES } from "@/lib/connectors/brokerGuides";
import { AiSectionChecklist } from "@/components/filing/wizards/AiSectionChecklist";
import { FileDown, FilePlus2, CloudDownload, HelpCircle, ChevronRight, TrendingUp, UploadCloud, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function BrokerChip({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-lg border px-3 py-1.5 transition-all text-xs font-semibold",
        selected
          ? "border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {selected && <Check className="size-3 mr-1.5" strokeWidth={3} />}
      {name}
    </button>
  );
}

function CompactUploadOrInputRow({
  title,
  uploadLabel,
  inputValue,
  onInputChange,
  inputPlaceholder,
}: {
  title: string;
  uploadLabel: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  inputPlaceholder: string;
}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-200 transition-colors">
      <div className="w-full md:w-44 font-semibold text-slate-800 text-sm shrink-0 leading-tight">
        {title}
      </div>
      
      <div className="flex-1 flex w-full items-center gap-3">
        {/* Upload Zone */}
        <div className="flex-1 border border-dashed border-slate-300 rounded-lg p-2 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
          <UploadCloud className="size-4 text-blue-500 mr-2 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate">{uploadLabel}</span>
          <input type="file" className="hidden" />
        </div>

        {/* Divider */}
        <span className="text-[10px] font-bold text-slate-400 uppercase">OR</span>

        {/* Manual Input */}
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-6 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            placeholder={inputPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    name,
    income,
    deductions,
    setName,
    setFilingMode,
    setFilingPath,
    ensureIncomeChip,
    setItrConfirmed,
    setIncome,
    setDeductions,
    connectedConnectors,
    lastParseResult,
  } = useDraftStore();

  const form16FastPath = isForm16FastPath(searchParams);
  const addEmployerMode = searchParams.get("addEmployer") === "1";
  const form16Connected = connectedConnectors.includes("form16");
  
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const hasBusinessChips =
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive");

  const [importMode, setImportMode] = useState<ImportStartMode | null>(null);
  const [estimateValues, setEstimateValues] = useState<QuickEstimateValues>({
    grossSalary: income.grossSalary,
    tds: income.tds,
    section80C: deductions.section80C,
    section80D: deductions.section80D,
    businessReceipts: income.freelanceRevenue ?? income.businessRevenue ?? 0,
  });

  // Dashboard State
  const [brokers, setBrokers] = useState<string[]>([]);
  const [brokerInputs, setBrokerInputs] = useState<Record<string, string>>({});
  
  // Specific inputs
  const [fnoProfit, setFnoProfit] = useState("");
  const [mfProfit, setMfProfit] = useState("");
  const [lossesCarryingForward, setLossesCarryingForward] = useState("");

  const toggleBroker = (b: string) => {
    setBrokers(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const handleBrokerInputChange = (broker: string, val: string) => {
    setBrokerInputs(prev => ({ ...prev, [broker]: val }));
  };

  const { result: taxResult } = useDraftTaxCompute();
  const taxSnapshot = useMemo(
    () =>
      taxResult
        ? {
            recommendedRegime: taxResult.regime_comparison.recommended_regime,
            taxOld: taxResult.regime_comparison.old.total_tax,
            taxNew: taxResult.regime_comparison.new.total_tax,
            taxSaving: taxResult.regime_comparison.tax_saving,
            refundEstimate:
              taxResult.regime_comparison.recommended_regime === "old"
                ? taxResult.regime_comparison.old.net_payable
                : taxResult.regime_comparison.new.net_payable,
          }
        : undefined,
    [taxResult]
  );
  const { aiSummary, aiLoading, aiEnabled } = useItrAiSummary({
    income,
    deductions,
    lastParseResult,
    connectedConnectors,
    taxSnapshot,
    enabled: form16FastPath || importMode === "form16",
  });

  useEffect(() => {
    trackEvent("import_started", {
      source: form16FastPath ? "form16_fast_path" : "documents",
    });
  }, [form16FastPath]);

  useEffect(() => {
    if (!form16FastPath) return;
    applySalariedFastPathDefaults(
      { setName, setFilingMode, setFilingPath, ensureIncomeChip, setItrConfirmed },
      searchParams.get("name")
    );
  }, [
    form16FastPath,
    searchParams,
    setName,
    setFilingMode,
    setFilingPath,
    ensureIncomeChip,
    setItrConfirmed,
  ]);

  const handleModeSelect = useCallback((mode: ImportStartMode) => {
    setImportMode(mode);
    trackEvent("import_mode_selected", { mode });
  }, []);

  const handleClearImportMode = useCallback(() => {
    setImportMode(null);
    setEstimateValues({ ...EMPTY_QUICK_ESTIMATE });
  }, []);

  const applyEstimateDraft = useCallback(() => {
    setFilingMode("estimate");
    setFilingPath("simple");
    if (estimateValues.grossSalary > 0) ensureIncomeChip("salary");
    setItrConfirmed(true);
    setIncome({
      grossSalary: estimateValues.grossSalary,
      tds: estimateValues.tds,
      // Business receipts land in freelanceRevenue (44ADA default);
      // the review "Business & freelance" card lets the user re-bucket to 44AD or books.
      ...(estimateValues.businessReceipts > 0
        ? { freelanceRevenue: estimateValues.businessReceipts }
        : {}),
    });
    if (estimateValues.businessReceipts > 0) ensureIncomeChip("freelance");
    setDeductions({
      section80C: estimateValues.section80C,
      section80D: estimateValues.section80D,
    });
    trackEvent("import_estimate_submitted", {
      grossSalary: estimateValues.grossSalary,
      businessReceipts: estimateValues.businessReceipts,
      section80C: estimateValues.section80C,
    });
  }, [
    ensureIncomeChip,
    estimateValues,
    setDeductions,
    setFilingMode,
    setFilingPath,
    setIncome,
    setItrConfirmed,
  ]);

  const effectiveImportMode: ImportStartMode | null = form16FastPath ? "form16" : importMode;
  const continueHref =
    effectiveImportMode !== null
      ? getImportContinueHref(effectiveImportMode, {
          form16Connected,
          form16FastPath,
        })
      : null;

  const handleContinue = useCallback(() => {
    if (effectiveImportMode === "manual") {
      if (estimateValues.grossSalary <= 0 && estimateValues.businessReceipts <= 0)
        return;
      applyEstimateDraft();
      router.push("/file/review");
      return;
    }
    if (effectiveImportMode === "capital_gains") {
      const hasBrokerProfits = Object.values(brokerInputs).some(v => Number(v) !== 0);
      if (hasBrokerProfits || brokers.length > 0 || Number(mfProfit) !== 0) {
        ensureIncomeChip("capital_gains");
      }
      const fnoAmt = Number(fnoProfit) || 0;
      if (fnoAmt !== 0 || brokers.length > 0) {
        ensureIncomeChip("fno");
        // Absolute turnover unknown from a single P&L figure — store profit and
        // ask for turnover on review. Audit flag uses turnover when provided.
        setIncome({
          fnoNonSpeculativeProfit: fnoAmt,
          fnoTurnover: Math.abs(fnoAmt),
        });
      }
      if (Number(mfProfit) !== 0) {
        // Rough MF estimate → STCG other until statement parsed
        useDraftStore.getState().setCapitalGains({
          stcg_other: Math.max(0, Number(mfProfit) || 0),
          sourceConnectorId: "manual_estimate",
        });
      }
      router.push("/file/review");
      return;
    }
    if (continueHref) {
      router.push(continueHref);
    }
  }, [applyEstimateDraft, continueHref, effectiveImportMode, estimateValues.grossSalary, estimateValues.businessReceipts, brokerInputs, brokers, fnoProfit, mfProfit, ensureIncomeChip, setIncome, router]);

  const continueDisabled =
    effectiveImportMode === null ||
    (effectiveImportMode === "manual" &&
      estimateValues.grossSalary <= 0 &&
      estimateValues.businessReceipts <= 0) ||
    (effectiveImportMode === "capital_gains" && brokers.length === 0 && !lossesCarryingForward && !fnoProfit && !mfProfit);

  return (
    <FilingLayout
      mirrorText="Upload your documents once, and our AI securely extracts every figure you need. No more manual data entry."
    >
      <div className="mb-4 w-full border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">AI Document Processing</h2>
        <div className="mt-3">
          <AiSectionChecklist
            kind={
              importMode === "capital_gains"
                ? "broker_pnl"
                : importMode === "form16"
                  ? "form16"
                  : "form16"
            }
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Also available:{" "}
          <Link href="/file/import/vda" className="text-primary font-medium underline">
            Crypto / VDA wizard
          </Link>
          {" · "}
          <Link href="/file/import/foreign" className="text-primary font-medium underline">
            NRI / foreign assets
          </Link>
        </p>
      </div>

      {/* Mode Selection Grid */}
      {!form16FastPath && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 mt-4">
          <button
            onClick={() => handleModeSelect("form16")}
            className={cn(
              "flex flex-col text-left rounded-xl border-2 p-4 transition-all",
              importMode === "form16" 
                ? "border-blue-600 bg-blue-50/80 shadow-sm" 
                : "border-slate-100 bg-white hover:border-blue-200"
            )}
          >
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "form16" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
              <FilePlus2 className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Upload Form 16</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Fastest. AI parses your PDF from your employer.</p>
          </button>

          <button
            onClick={() => handleModeSelect("capital_gains")}
            className={cn(
              "flex flex-col text-left rounded-xl border-2 p-4 transition-all",
              importMode === "capital_gains"
                ? "border-blue-600 bg-blue-50/80 shadow-sm"
                : "border-slate-100 bg-white hover:border-blue-200"
            )}
          >
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "capital_gains" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
              <TrendingUp className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Capital gains / F&amp;O</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">CAMS, Groww Excel, or broker Tax P&amp;L — guided entry.</p>
          </button>

          <button
            onClick={() => handleModeSelect("manual")}
            className={cn(
              "flex flex-col text-left rounded-xl border-2 p-4 transition-all",
              importMode === "manual" 
                ? "border-blue-600 bg-blue-50/80 shadow-sm" 
                : "border-slate-100 bg-white hover:border-blue-200"
            )}
          >
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "manual" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
              <HelpCircle className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Start with estimates</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">No documents needed now. Enter rough numbers.</p>
          </button>

        </div>
      )}

      {importMode !== null && !form16FastPath && (
        <div className="flex justify-end mb-4">
          <button onClick={handleClearImportMode} className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline">
            Change selection
          </button>
        </div>
      )}

      {/* Manual Estimate Section */}
      {!form16FastPath && importMode === "manual" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-100 pt-6">
          <h3 className="text-base font-bold text-slate-900 mb-3">Enter rough estimates</h3>
          <QuickEstimateForm
            values={estimateValues}
            onChange={setEstimateValues}
            showBusiness={hasBusinessChips}
          />
        </div>
      )}

      {/* Capital Gains / F&O Dashboard Section */}
      {!form16FastPath && importMode === "capital_gains" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-100 pt-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">Which platforms do you use?</h4>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {BROKER_DOWNLOAD_GUIDES.map((g) => (
                <BrokerChip
                  key={g.id}
                  name={g.label}
                  selected={brokers.includes(g.label)}
                  onClick={() => toggleBroker(g.label)}
                />
              ))}
              <BrokerChip
                name="Other MFs"
                selected={brokers.includes("Other MFs")}
                onClick={() => toggleBroker("Other MFs")}
              />
            </div>

            <div className="mb-4 space-y-2">
              {BROKER_DOWNLOAD_GUIDES.map((g) => (
                <details
                  key={g.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600"
                >
                  <summary className="cursor-pointer font-semibold text-slate-800">
                    How to download from {g.label}
                  </summary>
                  <ol className="mt-2 list-decimal pl-4 space-y-1">
                    {g.taxPnlSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                    {g.capitalGainsSteps?.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {brokers.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs italic bg-white border border-dashed rounded-xl mb-2">
                  Select platforms above to add their P&L statements
                </div>
              )}
              {brokers.map(b => (
                <CompactUploadOrInputRow
                  key={b}
                  title={`${b} P&L`}
                  uploadLabel={`Upload ${b} Statement`}
                  inputValue={brokerInputs[b] || ""}
                  onInputChange={(val) => handleBrokerInputChange(b, val)}
                  inputPlaceholder="Estimated Profit"
                />
              ))}

              <div className="h-px bg-slate-200 my-2"></div>

              {/* Permanent F&O / Mutual Fund / Losses Rows */}
              <CompactUploadOrInputRow
                title="Futures & Options (F&O)"
                uploadLabel="Upload P&L"
                inputValue={fnoProfit}
                onInputChange={setFnoProfit}
                inputPlaceholder="F&O Profit"
              />

              <CompactUploadOrInputRow
                title="Mutual Funds & Stocks"
                uploadLabel="Upload CAM"
                inputValue={mfProfit}
                onInputChange={setMfProfit}
                inputPlaceholder="Capital Gains"
              />

              <CompactUploadOrInputRow
                title="Brought Forward Losses"
                uploadLabel="Upload Last ITR-V"
                inputValue={lossesCarryingForward}
                onInputChange={setLossesCarryingForward}
                inputPlaceholder="Loss Amount"
              />
            </div>
            
            <div className="mt-4 text-[11px] text-slate-500">
              Upload broker Tax P&L in <strong>Optional Supporting Documents</strong> below
              — AI document reading for each broker is rolling out; manual entry works today.
            </div>
          </div>
        </div>
      )}

      {/* Form 16 Upload Section */}
      {(form16FastPath || importMode === "form16") && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start border-t border-slate-100 pt-6">
          <div className="min-w-0">
            {addEmployerMode && (
              <Banner variant="info">
                <strong>Adding another Form 16.</strong> Upload the next employer&apos;s Form 16 — we&apos;ll add its salary and TDS to your existing total.
              </Banner>
            )}
            <ConnectorGrid
              highlightConnectorId={form16FastPath ? FORM16_FAST_PATH_SOURCE : "form16"}
              form16FastPath={form16FastPath}
              appendAsEmployer={addEmployerMode}
            />
          </div>
          <ItrAnalyticsPanel
            income={income}
            deductions={deductions}
            lastParseResult={lastParseResult}
            connectedConnectors={connectedConnectors}
            aiSummary={aiSummary}
            aiLoading={aiLoading}
            aiEnabled={aiEnabled}
            taxSnapshot={taxSnapshot}
          />
        </div>
      )}

      {/* Continue Action */}
      {importMode !== null && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
          {continueHref && effectiveImportMode !== "manual" && effectiveImportMode !== "capital_gains" ? (
            <Button href={continueHref} disabled={continueDisabled}>
              Next Step <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleContinue} disabled={continueDisabled}>
              Continue to Filing <ChevronRight className="size-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </FilingLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-slate-600">Loading…</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
