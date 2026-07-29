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
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-lg border px-3 py-1.5 transition-all text-xs font-semibold cursor-pointer",
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
  onFileSelect,
}: {
  title: string;
  uploadLabel: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  inputPlaceholder: string;
  onFileSelect?: (file: File) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-200 transition-colors">
      <div className="w-full md:w-44 font-semibold text-slate-800 text-sm shrink-0 leading-tight">
        {title}
      </div>
      
      <div className="flex-1 flex w-full items-center gap-3">
        {/* Upload Zone - Changed to <label> so click triggers file picker */}
        <label className="flex-1 border border-dashed border-slate-300 rounded-lg p-2 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
          <UploadCloud className="size-4 text-blue-500 mr-2 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate">
            {fileName || uploadLabel}
          </span>
          <input
            type="file"
            accept=".pdf,.xlsx,.csv,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFileName(file.name);
                onFileSelect?.(file);
              }
            }}
          />
        </label>

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
    questionAnswers,
    setQuestionAnswer,
  } = useDraftStore();

  const form16FastPath = isForm16FastPath(searchParams);
  const requirementsStep =
    form16FastPath && searchParams.get("step") === "requirements";
  const addEmployerMode = searchParams.get("addEmployer") === "1";
  const form16Connected = connectedConnectors.includes("form16");
  
  const incomeChips = useDraftStore((s) => s.incomeChips);
  const capitalGains = useDraftStore((s) => s.capitalGains);
  const hasBusinessChips =
    incomeChips.includes("freelance") ||
    incomeChips.includes("business_presumptive");

  const [importMode, setImportMode] = useState<ImportStartMode | null>(
    form16FastPath ? "form16" : null
  );
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
    capitalGains,
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

  const handleModeSelect = useCallback(
    (mode: ImportStartMode) => {
      setImportMode(mode);
      if (mode === "manual") {
        setQuestionAnswer("document_form16_manual", true);
        setQuestionAnswer("document_ais_manual", true);
        setQuestionAnswer("document_form26as_manual", true);
        setFilingMode("estimate");
      } else if (mode === "form16") {
        setQuestionAnswer("document_form16_manual", false);
      }
      trackEvent("import_mode_selected", { mode });
    },
    [setFilingMode, setQuestionAnswer]
  );

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

  const effectiveImportMode: ImportStartMode | null = importMode;
  const selectedAdditionalSources = useMemo(
    () =>
      [
        {
          id: "rent_received",
          label: "House property details",
          connectorIds: [] as string[],
        },
        {
          id: "freelance",
          label: "Business or freelance income details",
          connectorIds: [] as string[],
        },
        {
          id: "business_presumptive",
          label: "Business income details",
          connectorIds: [] as string[],
        },
        {
          id: "capital_gains",
          label: "Capital gains statement",
          connectorIds: ["cams", "groww", "zerodha", "upstox", "dhan", "angelone"],
        },
        {
          id: "fno",
          label: "F&O Tax P&L",
          connectorIds: ["groww", "zerodha", "upstox", "dhan", "angelone"],
        },
        {
          id: "crypto",
          label: "Crypto / VDA statement",
          connectorIds: ["crypto"],
        },
        {
          id: "foreign",
          label: "Foreign income details",
          connectorIds: [] as string[],
        },
        {
          id: "nri",
          label: "NRI income and residential-status details",
          connectorIds: [] as string[],
        },
      ].filter((item) => incomeChips.includes(item.id)),
    [incomeChips]
  );

  const collectionRequirements = useMemo(() => {
    if (!requirementsStep) return [];

    const documentRequirements = [
      {
        id: "form16",
        label: "Form 16",
        complete:
          form16Connected ||
          questionAnswers.document_form16_manual === true,
        allowManual: true,
      },
      {
        id: "ais",
        label: "AIS / TIS",
        complete:
          connectedConnectors.includes("ais") ||
          questionAnswers.document_ais_manual === true,
        allowManual: true,
      },
      {
        id: "form26as",
        label: "Form 26AS",
        complete:
          connectedConnectors.includes("form26as") ||
          questionAnswers.document_form26as_manual === true,
        allowManual: true,
      },
    ];

    const additionalRequirements = selectedAdditionalSources.map((source) => ({
      id: source.id,
      label: source.label,
      complete:
        source.connectorIds.some((id) => connectedConnectors.includes(id)) ||
        questionAnswers[`document_${source.id}_manual`] === true,
      allowManual: true,
    }));

    return [...documentRequirements, ...additionalRequirements];
  }, [
    connectedConnectors,
    form16Connected,
    questionAnswers,
    requirementsStep,
    selectedAdditionalSources,
  ]);

  const incompleteRequirements = collectionRequirements.filter(
    (requirement) => !requirement.complete
  );
  const collectionComplete =
    !requirementsStep || incompleteRequirements.length === 0;

  const continueHref = requirementsStep
    ? "/file/review?tab=income"
    : effectiveImportMode !== null
      ? getImportContinueHref(effectiveImportMode, {
          form16Connected,
          form16FastPath,
        })
      : null;

  const handleContinue = useCallback(() => {
    if (effectiveImportMode === "manual") {
      applyEstimateDraft();
      router.push("/file/review?tab=income");
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
        setIncome({
          fnoNonSpeculativeProfit: fnoAmt,
          fnoTurnover: Math.abs(fnoAmt),
        });
      }
      if (Number(mfProfit) !== 0) {
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
    !collectionComplete ||
    (effectiveImportMode === "form16" &&
      !requirementsStep &&
      !form16Connected) ||
    (effectiveImportMode === "capital_gains" && brokers.length === 0 && !lossesCarryingForward && !fnoProfit && !mfProfit);

  return (
    <FilingLayout
      mirrorText="Upload your documents once, and our AI securely extracts every figure you need. No more manual data entry."
    >
      {/* Mode Selection Grid */}
      {!requirementsStep && (
        <div className="mb-6 mt-4">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              How would you like to add your tax details?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose one option to get started. You can add documents later.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#0e5f63] bg-[#0e5f63] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:p-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => handleModeSelect("form16")}
            aria-pressed={importMode === "form16"}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left shadow-[0_2px_10px_rgba(14,95,99,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0e5f63]/55 hover:shadow-[0_7px_18px_rgba(14,95,99,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]/35",
              importMode === "form16" 
                ? "-translate-y-0.5 border-[#0e5f63] bg-emerald-50 ring-2 ring-[#0e5f63]/20 shadow-[0_8px_20px_rgba(14,95,99,0.18)]"
                : "border-emerald-200/90 bg-white"
            )}
          >
            {importMode === "form16" && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#0e5f63] text-white shadow-sm">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            )}
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "form16" ? "bg-[#0e5f63] text-white" : "bg-slate-100 text-slate-500")}>
              <FilePlus2 className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Upload Form 16</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Choose this if your employer gave you Form 16.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect("capital_gains")}
            aria-pressed={importMode === "capital_gains"}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left shadow-[0_2px_10px_rgba(14,95,99,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0e5f63]/55 hover:shadow-[0_7px_18px_rgba(14,95,99,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]/35",
              importMode === "capital_gains"
                ? "-translate-y-0.5 border-[#0e5f63] bg-emerald-50 ring-2 ring-[#0e5f63]/20 shadow-[0_8px_20px_rgba(14,95,99,0.18)]"
                : "border-emerald-200/90 bg-white"
            )}
          >
            {importMode === "capital_gains" && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#0e5f63] text-white shadow-sm">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            )}
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "capital_gains" ? "bg-[#0e5f63] text-white" : "bg-slate-100 text-slate-500")}>
              <TrendingUp className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Capital gains / F&amp;O</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">CAMS, Groww Excel, or broker Tax P&amp;L — guided entry.</p>
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect("manual")}
            aria-pressed={importMode === "manual"}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left shadow-[0_2px_10px_rgba(14,95,99,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0e5f63]/55 hover:shadow-[0_7px_18px_rgba(14,95,99,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]/35",
              importMode === "manual" 
                ? "-translate-y-0.5 border-[#0e5f63] bg-emerald-50 ring-2 ring-[#0e5f63]/20 shadow-[0_8px_20px_rgba(14,95,99,0.18)]"
                : "border-emerald-200/90 bg-white"
            )}
          >
            {importMode === "manual" && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#0e5f63] text-white shadow-sm">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            )}
            <div className={cn("rounded-lg p-2 inline-block mb-3", importMode === "manual" ? "bg-[#0e5f63] text-white" : "bg-slate-100 text-slate-500")}>
              <HelpCircle className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-[14px]">Enter details manually</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">No documents? Enter your income and tax details yourself.</p>
          </button>

          </div>
        </div>
      )}

      {importMode !== null && !requirementsStep && (
        <div className="flex justify-end mb-4">
          <button type="button" onClick={handleClearImportMode} className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline">
            Change selection
          </button>
        </div>
      )}

      {/* Manual Estimate Section */}
      {!requirementsStep && importMode === "manual" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-100 pt-6">
          <h3 className="mb-1 text-base font-bold text-slate-900">
            Add estimates now, or continue to income details
          </h3>
          <p className="mb-3 text-sm text-slate-600">
            These fields are optional. You can enter complete figures on the next screen.
          </p>
          <QuickEstimateForm
            values={estimateValues}
            onChange={setEstimateValues}
            showBusiness={hasBusinessChips}
          />
        </div>
      )}

      {/* Capital Gains / F&O Dashboard Section */}
      {!requirementsStep && importMode === "capital_gains" && (
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
      {importMode === "form16" && (
        <div
          id="form16-upload-section"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid scroll-mt-24 gap-6 border-t border-slate-100 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start"
        >
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
            capitalGains={capitalGains}
            lastParseResult={lastParseResult}
            connectedConnectors={connectedConnectors}
            aiSummary={aiSummary}
            aiLoading={aiLoading}
            aiEnabled={aiEnabled}
            taxSnapshot={taxSnapshot}
          />
        </div>
      )}

      {requirementsStep && (
        <div className="mt-6">
          <Banner variant={collectionComplete ? "success" : "warning"}>
            <div className="space-y-3">
              <div>
                <strong>
                  {collectionComplete
                    ? "Document step complete."
                    : "Complete these items before moving ahead."}
                </strong>{" "}
                {collectionComplete
                  ? "You will not be sent back here for a hidden document requirement."
                  : "Upload what you have, or choose manual entry. Documents can be added later for verification."}
              </div>
              {!collectionComplete &&
                collectionRequirements.some(
                  (requirement) =>
                    ["form16", "ais", "form26as"].includes(requirement.id) &&
                    !requirement.complete
                ) && (
                  <button
                    type="button"
                    className="w-fit rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-950 shadow-sm hover:bg-amber-50"
                    onClick={() => {
                      setQuestionAnswer("document_form16_manual", true);
                      setQuestionAnswer("document_ais_manual", true);
                      setQuestionAnswer("document_form26as_manual", true);
                      setFilingMode("estimate");
                    }}
                  >
                    I don&apos;t have these documents — continue manually
                  </button>
                )}
              <ul className="space-y-2">
                {collectionRequirements.map((requirement) => (
                  <li
                    key={requirement.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex size-5 items-center justify-center rounded-full text-xs font-bold",
                          requirement.complete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {requirement.complete ? "✓" : "!"}
                      </span>
                      <span>{requirement.label}</span>
                    </span>
                    {!requirement.complete && requirement.allowManual && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary underline underline-offset-2"
                        onClick={() => {
                          setQuestionAnswer(
                            `document_${requirement.id}_manual`,
                            true
                          );
                          setFilingMode("estimate");
                        }}
                      >
                        {requirement.id === "ais" ||
                        requirement.id === "form26as"
                          ? "I don’t have this document"
                          : "I’ll enter this manually next"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {!collectionComplete && (
                <p className="text-xs">
                  Your calculation will be marked as an estimate until the
                  entered income and TDS are checked against available records.
                </p>
              )}
            </div>
          </Banner>
        </div>
      )}

      {/* Continue Action */}
      {(importMode !== null || requirementsStep) && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          {effectiveImportMode === "form16" &&
          !requirementsStep &&
          !form16Connected ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center sm:p-5">
              <h3 className="font-semibold text-slate-900">
                How would you like to continue?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Upload Form 16 if you have it, or enter the same details
                manually on the next screen.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    document
                      .getElementById("form16-upload-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="w-full"
                >
                  Upload Form 16
                </Button>
                <Button
                  onClick={() => handleModeSelect("manual")}
                  className="w-full"
                >
                  Continue without Form 16
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
            {continueHref &&
            effectiveImportMode !== "manual" &&
            effectiveImportMode !== "capital_gains" ? (
              <Button
                onClick={handleContinue}
                disabled={continueDisabled}
                className="w-full sm:w-auto sm:min-w-[280px]"
              >
                {requirementsStep ? "Continue to Income Details" : "Next Step"}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleContinue}
                disabled={continueDisabled}
                className="w-full sm:w-auto sm:min-w-[280px]"
              >
                Continue to Income Details
                <ChevronRight className="ml-1 size-4" />
              </Button>
            )}
            </div>
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
