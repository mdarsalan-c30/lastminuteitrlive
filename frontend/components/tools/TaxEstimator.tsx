"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Info } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useTaxCompute } from "@/lib/hooks/useTaxCompute";
import {
  describeNetPayable,
  regimeSavingsHeadline,
  summarizeRegimeComparison,
} from "@/lib/regimeDisplay";
import { useDraftStore } from "@/lib/store/draft";
import type { UserInput } from "@/lib/engine/types";

interface EstimatorInputs {
  age: number;
  grossSalary: number; // In simple mode this represents total income, in detailed mode it's just Salary
  housePropertyRent: number;
  capitalGain: number;
  businessIncome: number;
  section80C: number;
  section80D: number;
  npsExtra: number;
  fdInterest: number; // Other Sources
  tds: number;
}

const DEFAULTS: EstimatorInputs = {
  age: 30,
  grossSalary: 1200000,
  housePropertyRent: 0,
  capitalGain: 0,
  businessIncome: 0,
  section80C: 150000,
  section80D: 25000,
  npsExtra: 0,
  fdInterest: 0,
  tds: 0,
};

function buildUserInput(v: EstimatorInputs, mode: "simple" | "detailed"): UserInput {
  const isDetailed = mode === "detailed";
  return {
    age: v.age,
    mode: "estimate",
    salary: {
      gross_salary: v.grossSalary,
      basic_salary: Math.round(v.grossSalary * 0.5),
    },
    house_property: isDetailed ? {
      property_type: "let_out",
      annual_rent_received: v.housePropertyRent,
    } : undefined,
    other_income: { fd_interest: v.fdInterest },
    capital_gains: isDetailed ? {
      stcg_other: v.capitalGain,
    } : undefined,
    business: isDetailed ? {
      business_type: "regular_books",
      actual_gross_receipts: v.businessIncome,
      actual_expenses: 0, // Engine will treat gross receipts as net income
    } : undefined,
    deductions: {
      epf: v.section80C,
      health_insurance_self: v.section80D,
      nps_self: v.npsExtra,
    },
    taxes_paid: { tds_salary: v.tds },
  };
}

function NumberField({
  id,
  label,
  value,
  onChange,
  prefix = "₹",
  note,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  note?: string;
  tooltip?: string;
}) {
  return (
    <label htmlFor={id} className="block relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5 w-max">
          {label}
          {tooltip && (
            <span className="group relative flex items-center">
              <Info className="size-4 text-slate-500 hover:text-[#0e5f63] transition-colors cursor-help" />
              <span className="pointer-events-none absolute bottom-full left-0 mb-2 w-max max-w-[200px] rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-normal text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 z-10 whitespace-normal leading-relaxed">
                {tooltip}
                <svg className="absolute left-2 top-full h-1.5 w-3 text-slate-800" viewBox="0 0 12 6" fill="currentColor">
                  <path d="M0 0l6 6 6-6z" />
                </svg>
              </span>
            </span>
          )}
        </span>
        {note && <span className="text-[10px] uppercase font-bold text-muted-foreground bg-white/50 px-2 py-0.5 rounded-full">{note}</span>}
      </div>
      <div className="flex items-center rounded-lg border border-border/70 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        {prefix && <span className="text-sm text-muted-foreground mr-1">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          placeholder="0"
          className="w-full bg-transparent py-2.5 pl-1 text-sm tabular-nums text-foreground outline-none"
        />
      </div>
    </label>
  );
}

export function TaxEstimator() {
  const [inputs, setInputs] = useState<EstimatorInputs>(DEFAULTS);
  const [incomeMode, setIncomeMode] = useState<"simple" | "detailed">("simple");
  const [saved, setSaved] = useState(false);
  const { loading, error, result, compute } = useTaxCompute();
  const setIncome = useDraftStore((s) => s.setIncome);
  const setDeductions = useDraftStore((s) => s.setDeductions);

  const patch = useCallback(
    (key: keyof EstimatorInputs) => (v: number) => {
      setInputs((prev) => ({ ...prev, [key]: v }));
      setSaved(false);
    },
    []
  );

  const summary = useMemo(
    () => (result?.regime_comparison ? summarizeRegimeComparison(result.regime_comparison) : null),
    [result]
  );

  const handleCalculate = () => {
    void compute(buildUserInput(inputs, incomeMode));
  };

  const handleSaveToDraft = () => {
    setIncome({
      grossSalary: inputs.grossSalary,
      tds: inputs.tds,
      fdInterest: inputs.fdInterest,
    });
    setDeductions({
      section80C: inputs.section80C,
      section80D: inputs.section80D,
      npsExtra: inputs.npsExtra,
    });
    setSaved(true);
  };

  const oldDisplay = summary ? describeNetPayable(summary.oldNetPayable) : null;
  const newDisplay = summary ? describeNetPayable(summary.newNetPayable) : null;

  return (
    <div className="rounded-2xl p-6 shadow-sm" id="tax-estimator" style={{ backgroundColor: "#bfe9e0" }}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-xl p-3 bg-white/60 shadow-sm">
          <Calculator className="size-6" style={{ color: "#0e5f63" }} aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0e5f63" }}>
            Income tax estimator &amp; regime compare
          </h2>
          <p className="mt-1 text-sm font-medium opacity-80" style={{ color: "#0e5f63" }}>
            Rule-based estimate using the same engine as the filing flow. Old vs new regime, before
            you commit anything on incometax.gov.in.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex bg-white/40 p-1 rounded-xl w-fit mb-6 shadow-sm border border-white/60">
          <button 
            onClick={() => setIncomeMode("simple")} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${incomeMode === "simple" ? "bg-white text-[#0e5f63] shadow-sm" : "text-[#0e5f63]/70 hover:bg-white/50"}`}
          >
            Option 1: Gross Income
          </button>
          <button 
            onClick={() => setIncomeMode("detailed")} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${incomeMode === "detailed" ? "bg-white text-[#0e5f63] shadow-sm" : "text-[#0e5f63]/70 hover:bg-white/50"}`}
          >
            Option 2: Detailed Breakup
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {incomeMode === "simple" ? (
             <NumberField id="est-salary" label="Gross annual salary" value={inputs.grossSalary} onChange={patch("grossSalary")} note="Total Income" tooltip="Your total salary income before any deductions like EPF." />
          ) : (
            <>
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2 p-4 bg-white/40 rounded-xl border border-white/60">
                 <div className="sm:col-span-2 text-sm font-bold text-[#0e5f63]">Detailed Income Heads</div>
                 <NumberField id="est-salary" label="Salary Income" value={inputs.grossSalary} onChange={patch("grossSalary")} note="Engine ded. 75K" tooltip="Your salary income (the engine will automatically deduct ₹75,000 standard deduction for you)." />
                 <NumberField id="est-hp" label="House Property (Rent)" value={inputs.housePropertyRent} onChange={patch("housePropertyRent")} note="Engine ded. 30%" tooltip="Total rent you received if you let out a property. We will auto-deduct 30% for standard deductions." />
                 <NumberField id="est-cg" label="Capital Gains" value={inputs.capitalGain} onChange={patch("capitalGain")} tooltip="Profits from the sale of mutual funds, stocks, or property." />
                 <NumberField id="est-fd" label="Other Sources (Interest)" value={inputs.fdInterest} onChange={patch("fdInterest")} tooltip="Interest earned from Fixed Deposits, Savings Accounts, or Dividends." />
                 <NumberField id="est-biz" label="Business Income" value={inputs.businessIncome} onChange={patch("businessIncome")} tooltip="Income or receipts from your business or freelance profession." />
              </div>
            </>
          )}

          <div className="sm:col-span-2 h-px bg-[#0e5f63]/10 my-2"></div>
          
          <NumberField id="est-age" label="Age (years)" value={inputs.age} onChange={patch("age")} prefix="" tooltip="Your age determines your basic exemption limit and senior citizen benefits." />
          {incomeMode === "simple" && <NumberField id="est-fd" label="FD / interest income" value={inputs.fdInterest} onChange={patch("fdInterest")} tooltip="Interest earned from Fixed Deposits, Savings Accounts, or Dividends." />}
          <NumberField id="est-80c" label="80C investments (max ₹1.5L)" value={inputs.section80C} onChange={patch("section80C")} tooltip="Includes EPF, PPF, ELSS mutual funds, Life Insurance, and Principal repayment of home loans. Max deduction is ₹1.5 Lakhs." />
          <NumberField id="est-80d" label="80D health insurance" value={inputs.section80D} onChange={patch("section80D")} tooltip="Premiums paid for health/medical insurance for yourself, family, or parents." />
          <NumberField id="est-nps" label="80CCD(1B) extra NPS" value={inputs.npsExtra} onChange={patch("npsExtra")} tooltip="Additional ₹50,000 deduction allowed specifically for National Pension System (NPS) contributions." />
          <NumberField id="est-tds" label="TDS already deducted" value={inputs.tds} onChange={patch("tds")} tooltip="Tax already deducted at source by your employer (check Form 16) or banks." />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={loading}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#0e5f63" }}
      >
        {loading ? "Calculating…" : "Calculate tax"}
      </button>

      {error && !loading && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-bold text-red-950">Couldn&apos;t calculate right now</p>
          <p className="mt-1 text-sm font-medium text-red-900">
            The tax engine didn&apos;t respond. Try again in a moment, or import Form 16 to compare
            inside the filing flow.
          </p>
        </div>
      )}

      {summary && oldDisplay && newDisplay && !loading && (
        <div className="mt-6 rounded-xl border border-white/50 bg-white/60 p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { key: "old", label: "Old regime", display: oldDisplay },
                { key: "new", label: "New regime", display: newDisplay },
              ] as const
            ).map(({ key, label, display }) => (
              <div
                key={key}
                className={`rounded-2xl border p-5 text-center ${
                  summary.recommended === key
                    ? "border-[#0e5f63]/40 bg-[#0e5f63]/5 ring-2 ring-[#0e5f63]/20"
                    : "border-white/60 bg-white"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide opacity-80" style={{ color: "#0e5f63" }}>
                  {label}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold tabular-nums ${
                    display.isRefund ? "text-emerald-700" : ""
                  }`}
                  style={!display.isRefund ? { color: "#0e5f63" } : {}}
                >
                  {display.isRefund ? "Refund " : ""}
                  {formatINR(display.amount)}
                </p>
                {summary.recommended === key && (
                  <span className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase text-white shadow-sm" style={{ backgroundColor: "#0e5f63" }}>
                    Lower tax
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-base font-bold" style={{ color: "#0e5f63" }}>
            {regimeSavingsHeadline(summary.recommended, summary.savings)}
          </p>
          <p className="mt-1 text-xs font-medium opacity-80" style={{ color: "#0e5f63" }}>
            Estimate only — ITD confirms the final figure when you file. Compare with your AIS before
            filing.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveToDraft}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "#0e5f63" }}
            >
              Save figures to draft
            </button>
            {saved && (
              <Link
                href="/file/review?tab=summary"
                className="text-sm font-bold hover:underline"
                style={{ color: "#0e5f63" }}
              >
                Saved — continue in filing flow →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
