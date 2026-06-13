"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
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
  grossSalary: number;
  section80C: number;
  section80D: number;
  npsExtra: number;
  fdInterest: number;
  tds: number;
}

const DEFAULTS: EstimatorInputs = {
  age: 30,
  grossSalary: 1200000,
  section80C: 150000,
  section80D: 25000,
  npsExtra: 0,
  fdInterest: 0,
  tds: 0,
};

function buildUserInput(v: EstimatorInputs): UserInput {
  return {
    age: v.age,
    mode: "estimate",
    salary: {
      gross_salary: v.grossSalary,
      basic_salary: Math.round(v.grossSalary * 0.5),
    },
    other_income: { fd_interest: v.fdInterest },
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
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="mt-1 flex items-center rounded-lg border border-border/70 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <span className="text-sm text-muted-foreground">₹</span>
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
    void compute(buildUserInput(inputs));
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
    <div className="card-premium p-5" id="tax-estimator">
      <div className="flex items-start gap-2">
        <Calculator className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Income tax estimator &amp; regime compare
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rule-based estimate using the same engine as the filing flow. Old vs new regime, before
            you commit anything on incometax.gov.in.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id="est-salary" label="Gross annual salary" value={inputs.grossSalary} onChange={patch("grossSalary")} />
        <NumberField id="est-age" label="Age (years)" value={inputs.age} onChange={patch("age")} />
        <NumberField id="est-80c" label="80C investments (max ₹1.5L)" value={inputs.section80C} onChange={patch("section80C")} />
        <NumberField id="est-80d" label="80D health insurance" value={inputs.section80D} onChange={patch("section80D")} />
        <NumberField id="est-nps" label="80CCD(1B) extra NPS" value={inputs.npsExtra} onChange={patch("npsExtra")} />
        <NumberField id="est-fd" label="FD / interest income" value={inputs.fdInterest} onChange={patch("fdInterest")} />
        <NumberField id="est-tds" label="TDS already deducted" value={inputs.tds} onChange={patch("tds")} />
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={loading}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Calculating…" : "Calculate tax"}
      </button>

      {error && !loading && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4" role="alert">
          <p className="text-sm font-semibold text-amber-950">Couldn&apos;t calculate right now</p>
          <p className="mt-1 text-sm text-amber-900">
            The tax engine didn&apos;t respond. Try again in a moment, or import Form 16 to compare
            inside the filing flow.
          </p>
        </div>
      )}

      {summary && oldDisplay && newDisplay && !loading && (
        <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "old", label: "Old regime", display: oldDisplay },
                { key: "new", label: "New regime", display: newDisplay },
              ] as const
            ).map(({ key, label, display }) => (
              <div
                key={key}
                className={`rounded-2xl border p-4 text-center ${
                  summary.recommended === key
                    ? "border-primary/40 bg-primary/5 ring-2 ring-primary/15"
                    : "border-border/70 bg-white"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p
                  className={`mt-1 text-xl font-bold tabular-nums ${
                    display.isRefund ? "text-emerald-700" : "text-foreground"
                  }`}
                >
                  {display.isRefund ? "Refund " : ""}
                  {formatINR(display.amount)}
                </p>
                {summary.recommended === key && (
                  <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Lower tax
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {regimeSavingsHeadline(summary.recommended, summary.savings)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimate only — ITD confirms the final figure when you file. Compare with your AIS before
            filing.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveToDraft}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Save figures to draft
            </button>
            {saved && (
              <Link
                href="/file/review?tab=summary"
                className="text-sm font-semibold text-primary hover:underline"
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
