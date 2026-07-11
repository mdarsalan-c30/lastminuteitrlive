"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDraftStore } from "@/lib/store/draft";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { resolveRecommendedForm } from "@/lib/filing/case-matrix";
import type { AgeBand, IncomeBand } from "@/lib/filing/case-matrix";
import { isForm16FastPath } from "@/lib/filing/routes";
import {
  evaluateScopeGate,
  scopeGateToQuery,
} from "@/lib/filing/scopeGate";
import { STATE_ROUTES } from "@/lib/filing/stateMachine";
import { SelectInput } from "@/components/filing/ui";
import {
  Check,
  ChevronRight,
  FileCheck2,
  Briefcase,
  Building2,
  TrendingUp,
  Globe,
  Plane,
  Bitcoin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPLEX_CASE_ESCALATION_BODY,
  COMPLEX_CASE_ESCALATION_TITLE,
  COMPLEX_CASE_FLAG,
  SELF_FILE_ELIGIBLE,
} from "@/lib/copy/trust";
import {
  AI_CA_CONFIDENCE_BODY,
  AI_CA_CONFIDENCE_HEADLINE,
  FNO_GUIDED_BODY,
  FNO_GUIDED_HEADLINE,
} from "@/lib/copy/itrForms";
import { ItrFormGuideTable } from "@/components/filing/ItrFormGuideTable";

const FORM_PLAIN_LABELS: Record<string, string> = {
  "ITR-1": "Simple return for salaried employees",
  "ITR-2": "For gains from shares/property, foreign income, or income above ₹50L",
  "ITR-3": "Business income where you track full accounts",
  "ITR-4": "Small business or freelancer — simplified flat-rate tax",
  "ITR-5": "Partnership firms and LLPs — CA-assisted filing",
  "ITR-6": "Companies — CA-assisted filing",
  BLOCK: "Parent must file for minor",
};

function profileAgeToMatrixAge(ageBand: string): AgeBand {
  // Age bands: "15-20", "20-25", "25-35", "35-60", "60+"
  if (ageBand === "60+") return "b"; // senior
  return "a";
}

export function GateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form16FastPath = isForm16FastPath(searchParams);
  
  const {
    matrix,
    incomeChips,
    profile,
    itrConfirmed,
    setName,
    setMatrix,
    setProfile,
    toggleIncomeChip,
    ensureIncomeChip,
    setRecommendedForm,
    setItrConfirmed,
    setSeniorMode,
  } = useDraftStore();

  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const [localAgeBand, setLocalAgeBand] = useState("25-35");

  useEffect(() => {
    const landingName = searchParams.get("name");
    if (landingName) setName(landingName);
  }, [searchParams, setName]);

  useEffect(() => {
    if (!form16FastPath) return;
    ensureIncomeChip("salary");
  }, [form16FastPath, ensureIncomeChip]);

  useEffect(() => {
    setMatrix({ age: profileAgeToMatrixAge(localAgeBand) });
    setSeniorMode(localAgeBand === "60+");
  }, [localAgeBand, setMatrix, setSeniorMode]);

  const chips = useMemo(() => new Set(incomeChips), [incomeChips]);
  const mostlySalary = chips.has("salary");
  const hasRent = chips.has("rent_received");
  const soldAssets = chips.has("capital_gains");
  const hasBusiness = chips.has("freelance") || chips.has("business_presumptive");
  const hasFO = chips.has("fno");
  const hasForeign = chips.has("foreign");
  const hasNRI = chips.has("nri");
  const hasCrypto = chips.has("crypto");
  const hasEntity = chips.has("firm_llp") || chips.has("company");

  const rec = useMemo(() => resolveRecommendedForm(matrix, chips), [matrix, chips]);

  const { form, reason } = useMemo(() => {
    let nextForm = rec.form;
    let nextReason = rec.reason;

    if (hasEntity) {
      nextForm = chips.has("company") ? "ITR-6" : "ITR-5";
      nextReason =
        "Firms, LLPs, and companies file entity returns — our partner CA files it with you.";
    } else if (hasNRI || hasForeign || hasCrypto) {
      nextForm = hasBusiness || hasFO ? "ITR-3" : "ITR-2";
      nextReason = hasNRI
        ? "NRI / RNOR filing needs residential-status checks and Schedule FA — we guide you step by step."
        : "Foreign income or crypto requires complex ITR forms — we guide you through the schedules.";
    }

    return { form: nextForm, reason: nextReason };
  }, [rec, chips, hasEntity, hasNRI, hasForeign, hasCrypto, hasBusiness, hasFO]);

  useEffect(() => {
    setRecommendedForm(form, rec.caseId);
  }, [form, rec.caseId, setRecommendedForm]);

  const scope = useMemo(
    () =>
      evaluateScopeGate({
        incomeChips,
        recommendedForm: form,
        incomeBand: matrix.income,
      }),
    [incomeChips, form, matrix.income]
  );

  const showExpert =
    scope.verdict === "blocked" ||
    rec.expert ||
    form === "BLOCK" ||
    hasFO ||
    hasForeign ||
    hasNRI ||
    hasCrypto ||
    hasEntity;

  const plainFormLabel = FORM_PLAIN_LABELS[form] ?? form;

  const toggleSource = (
    sourceId: string,
    isBusiness: boolean = false,
    isCapitalGains: boolean = false,
    isComplex: boolean = false
  ) => {
    const wasSelected = chips.has(sourceId);
    const nextChips = new Set(chips);
    if (wasSelected) nextChips.delete(sourceId);
    else nextChips.add(sourceId);

    toggleIncomeChip(sourceId);

    const hasBusinessChip =
      nextChips.has("freelance") ||
      nextChips.has("business_presumptive") ||
      nextChips.has("fno");

    if (isBusiness || sourceId === "fno") {
      if (nextChips.has("fno")) {
        setMatrix({ business: "w" });
      } else if (!hasBusinessChip) {
        setMatrix({ business: "x" });
      }
    }

    if (isCapitalGains || isComplex) {
      if (nextChips.has(sourceId)) {
        setMatrix({ business: "z" });
      } else if (!hasBusinessChip) {
        setMatrix({ business: "x" });
      }
    }
  };

  const handleContinue = () => {
    setSeniorMode(localAgeBand === "60+");
    setRecommendedForm(form, rec.caseId);

    // Finding 5: hard-gate unsupported personas — honest exit, no mis-file.
    if (scope.verdict === "blocked") {
      router.push(`${STATE_ROUTES.BLOCKED}?${scopeGateToQuery(scope)}`);
      return;
    }

    // EXTRACT is inline on COLLECT — parsing route is dead (doc 40).
    const docsUrl = form16FastPath
      ? `${STATE_ROUTES.COLLECT}?source=form16`
      : STATE_ROUTES.COLLECT;
    router.push(docsUrl);
  };

  return (
    <FilingLayout
      mirrorText={AI_CA_CONFIDENCE_HEADLINE}
    >
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
        <p className="text-sm text-slate-600 mb-6 leading-relaxed border border-blue-100 bg-blue-50/60 rounded-xl px-4 py-3">
          {AI_CA_CONFIDENCE_BODY}
        </p>
        {/* Section 1: Basics */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sec 1: Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
          <div className="flex items-center justify-between border border-slate-200 p-3 rounded-xl bg-slate-50">
            <span className="text-sm font-semibold text-slate-700">PAN Number</span>
            <input 
              className="bg-transparent text-right font-medium text-slate-900 outline-none w-32 uppercase" 
              value={pan}
              onChange={e => setPan(e.target.value)}
              placeholder="ABCDE1234F"
            />
          </div>
          <div className="flex items-center justify-between border border-slate-200 p-3 rounded-xl bg-slate-50">
            <span className="text-sm font-semibold text-slate-700">Mobile Number</span>
            <input 
              className="bg-transparent text-right font-medium text-slate-900 outline-none w-32" 
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="9876543210"
            />
          </div>
          <SelectInput
            label="Annual Income Range"
            value={matrix.income}
            onChange={(v) => setMatrix({ income: v as IncomeBand })}
            options={[
              { value: "1", label: "Up to ₹2.5 lakh" },
              { value: "2", label: "₹2.5L – ₹5L" },
              { value: "3", label: "₹5L – ₹10L" },
              { value: "4", label: "₹10L – ₹25L" },
              { value: "5", label: "₹25L – ₹50L" },
              { value: "6", label: "₹50L – ₹1Cr" },
              { value: "7", label: "Above ₹1Cr" },
            ]}
          />
          <SelectInput
            label="Age Band"
            value={localAgeBand}
            onChange={(v) => setLocalAgeBand(v)}
            options={[
              { value: "15-20", label: "15-20" },
              { value: "20-25", label: "20-25" },
              { value: "25-35", label: "25-35" },
              { value: "35-60", label: "35-60" },
              { value: "60+", label: "60+" },
            ]}
          />
        </div>

        {/* Form 16 fast path returns here to ask "anything else this year?" */}
        {searchParams.get("step") === "additional-income" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={3} />
            <p className="text-sm text-emerald-900">
              <strong>Form 16 imported.</strong> One more thing — did you earn
              anything else this year? Tick everything that applies below, then
              continue. It keeps your return safe from AIS mismatch notices.
            </p>
          </div>
        )}

        {/* Section 2: Income Sources */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sec 2: Select your Income Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-8">
          {[
            { id: "salary", icon: Briefcase, label: "Salary / Pension", desc: "Form 16 from employer", active: mostlySalary },
            { id: "rent_received", icon: Building2, label: "House Property", desc: "Received rent or home loan", active: hasRent },
            { id: "freelance", icon: TrendingUp, label: "Business & Freelance", desc: "Consulting, 44AD/44ADA", active: hasBusiness, isBusiness: true },
            { id: "capital_gains", icon: TrendingUp, label: "Capital Gains", desc: "Sold shares, MF", active: soldAssets, isCG: true },
            { id: "fno", icon: TrendingUp, label: "Futures and Option", desc: "F&O trading", active: hasFO, isBusiness: true },
            { id: "foreign", icon: Globe, label: "Resident Having Foreign Income", desc: "RSUs, foreign dividend", active: hasForeign, isComplex: true },
            { id: "nri", icon: Plane, label: "Non Resident (NRI) Filing", desc: "NRI status", active: hasNRI, isComplex: true },
            { id: "crypto", icon: Bitcoin, label: "Cryptocurrency", desc: "VDA trades", active: hasCrypto, isComplex: true },
            { id: "firm_llp", icon: Building2, label: "Partnership Firm / LLP", desc: "ITR-5 · CA-assisted", active: chips.has("firm_llp"), isComplex: true },
            { id: "company", icon: Building2, label: "Company", desc: "ITR-6 · CA-assisted", active: chips.has("company"), isComplex: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSource(item.id, item.isBusiness, item.isCG, item.isComplex)}
              className={cn(
                "relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left",
                item.active ? "border-blue-600 bg-blue-50/80 ring-1 ring-blue-600" : "border-slate-100 bg-white hover:border-blue-200"
              )}
            >
              {item.active && (
                <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="size-3" strokeWidth={3} />
                </div>
              )}
              <div className={cn("rounded-full p-2.5 text-white shrink-0", item.active ? "bg-blue-600" : "bg-slate-300")}>
                <item.icon className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{item.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Section 3: Recommendation */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sec 3: Recommended ITR</h2>
        <div className="pt-4 border-t border-slate-100">
          {showExpert ? (
            <div className="animate-in fade-in duration-500 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
              <div className="bg-amber-50/80 px-5 py-4 border-b border-amber-100 flex items-start gap-4">
                <div className="bg-amber-100 p-2.5 rounded-xl shrink-0 mt-0.5">
                  <FileCheck2 className="size-6 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Recommended: {form}</h3>
                    <span className="bg-amber-200 text-amber-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">
                      {COMPLEX_CASE_FLAG}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-amber-900/80">
                    {plainFormLabel}
                  </p>
                </div>
              </div>
              
              <div className="p-5 bg-white">
                <div className="mb-5 space-y-3">
                  {hasFO ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3">
                      <h4 className="text-sm font-bold text-blue-900 mb-1">
                        {FNO_GUIDED_HEADLINE}
                      </h4>
                      <p className="text-[13px] text-blue-900/80 leading-relaxed">
                        {FNO_GUIDED_BODY}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {COMPLEX_CASE_ESCALATION_TITLE}
                      </h4>
                      <p className="text-[13px] text-slate-600 leading-relaxed">
                        {COMPLEX_CASE_ESCALATION_BODY}
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="text-slate-800 font-bold">Why?</span> {reason}
                    </p>
                  </div>
                  {scope.guidance.length > 0 && (
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {scope.guidance.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleContinue}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                  >
                    {scope.verdict === "blocked"
                      ? "See my guided path"
                      : hasFO
                        ? "Continue — guided ITR-3"
                        : "Continue with our guide"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
              <div className="bg-blue-50/80 px-5 py-4 border-b border-blue-100 flex items-start gap-4">
                <div className="bg-blue-100 p-2.5 rounded-xl shrink-0 mt-0.5">
                  <FileCheck2 className="size-6 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Recommended: {form}</h3>
                    <span className="bg-blue-200 text-blue-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">
                      {SELF_FILE_ELIGIBLE}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-900/80">
                    {plainFormLabel}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-white space-y-4">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itrConfirmed}
                    onChange={(e) => setItrConfirmed(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    I confirm to proceed with <strong className="text-slate-900">{form}</strong> for this filing.
                  </span>
                </label>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleContinue}
                    disabled={!itrConfirmed}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                  >
                    Start Filing <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Which ITR form applies to you?
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            India has seven ITR forms — we support guided self-filing for ITR-1 to
            ITR-4 and partner filing for ITR-5 to ITR-7.
          </p>
          <ItrFormGuideTable />
        </div>
      </div>
    </FilingLayout>
  );
}

