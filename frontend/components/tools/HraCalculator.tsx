"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { computeHraExemption, type CityTier } from "@/lib/calculators/hra";
import { formatINR } from "@/lib/format";
import { useDraftStore } from "@/lib/store/draft";
import { Home, Info } from "lucide-react";

const LIMB_LABEL: Record<string, string> = {
  actual_hra: "Actual HRA received is the smallest",
  percent_of_basic: "Percentage of basic salary is the smallest",
  rent_minus_10pct: "Rent paid minus 10% of basic is the smallest",
  none: "No exemption — needs HRA received and rent paid",
};

function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  tooltip,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  tooltip?: string;
}) {
  return (
    <label htmlFor={id} className="block relative">
      <span className="text-sm font-medium text-foreground flex items-center gap-1.5 w-max">
        {label}
        {tooltip && (
          <span className="group relative flex items-center">
            <Info className="size-4 text-slate-500 hover:text-[#0e5f63] transition-colors cursor-help" />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 z-10 whitespace-normal text-center leading-relaxed">
              {tooltip}
              <svg className="absolute left-1/2 top-full h-1.5 w-3 -translate-x-1/2 text-slate-800" viewBox="0 0 12 6" fill="currentColor">
                <path d="M0 0l6 6 6-6z" />
              </svg>
            </span>
          </span>
        )}
      </span>
      <div className="mt-1 flex items-center rounded-lg border border-border/70 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        <span className="text-sm text-muted-foreground">₹</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={Number.isFinite(value) && value !== 0 ? value : value === 0 ? "" : ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          placeholder="0"
          className="w-full bg-transparent py-2.5 pl-1 text-sm tabular-nums text-foreground outline-none"
        />
      </div>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function HraCalculator() {
  const [basicSalary, setBasicSalary] = useState(0);
  const [hraReceived, setHraReceived] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [cityTier, setCityTier] = useState<CityTier>("metro");
  const [saved, setSaved] = useState(false);

  const setIncome = useDraftStore((s) => s.setIncome);

  const result = useMemo(
    () => computeHraExemption({ basicSalary, hraReceived, rentPaid, cityTier }),
    [basicSalary, hraReceived, rentPaid, cityTier]
  );

  const hasInput = basicSalary > 0 || hraReceived > 0 || rentPaid > 0;

  const handleSave = () => {
    setIncome({ hraReceived, actualRentPaid: rentPaid, cityTier });
    setSaved(true);
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm" id="hra-calculator" style={{ backgroundColor: "#bfe9e0" }}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-xl p-3 bg-white/60 shadow-sm">
          <Home className="size-6" style={{ color: "#0e5f63" }} aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#0e5f63" }}>HRA exemption calculator</h2>
          <p className="mt-1 text-sm font-medium opacity-80" style={{ color: "#0e5f63" }}>
            Section 10(13A) — exemption is the least of three limbs. Allowed under the old regime
            only (the new regime uses the higher ₹75,000 standard deduction instead).
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NumberField
          id="hra-basic"
          label="Annual basic salary (+ DA)"
          value={basicSalary}
          onChange={setBasicSalary}
          hint="Basic + dearness allowance forming part of pay"
          tooltip="This is your fixed basic pay plus dearness allowance (if it forms part of retirement benefits). Check your payslip or Form 16."
        />
        <NumberField
          id="hra-received"
          label="Annual HRA received"
          value={hraReceived}
          onChange={setHraReceived}
          hint="From Form 16 Part B / salary slips"
          tooltip="The actual House Rent Allowance given by your employer over the financial year."
        />
        <NumberField
          id="hra-rent"
          label="Annual rent paid"
          value={rentPaid}
          onChange={setRentPaid}
          hint="Total rent paid in the financial year"
          tooltip="The total amount of rent you actually paid to your landlord during the year."
        />
        <div>
          <span className="text-sm font-medium text-slate-800">City type</span>
          <div className="mt-1 inline-flex rounded-lg border border-white/50 bg-white/40 p-0.5">
            {(["metro", "non_metro"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setCityTier(tier)}
                aria-pressed={cityTier === tier}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  cityTier === tier
                    ? "text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                style={cityTier === tier ? { backgroundColor: "#0e5f63" } : {}}
              >
                {tier === "metro" ? "Metro (50%)" : "Non-metro (40%)"}
              </button>
            ))}
          </div>
          <span className="mt-1 block text-xs text-slate-600">
            Metro: Delhi, Mumbai, Kolkata, Chennai
          </span>
        </div>
      </div>

      {hasInput && (
        <div className="mt-6 rounded-xl border border-white/50 bg-white/60 p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "#0e5f63" }}>Exempt HRA</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: "#0e5f63" }}>
              {formatINR(result.exemption)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm font-medium opacity-80" style={{ color: "#0e5f63" }}>Taxable HRA</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "#0e5f63" }}>
              {formatINR(result.taxable)}
            </span>
          </div>

          <ul className="mt-4 space-y-2 border-t border-white/60 pt-4 text-xs font-medium opacity-80" style={{ color: "#0e5f63" }}>
            <li className="flex justify-between">
              <span>1. Actual HRA received</span>
              <span className="tabular-nums">{formatINR(result.limbs.actualHraReceived)}</span>
            </li>
            <li className="flex justify-between">
              <span>2. {cityTier === "metro" ? "50%" : "40%"} of basic</span>
              <span className="tabular-nums">{formatINR(result.limbs.percentOfBasic)}</span>
            </li>
            <li className="flex justify-between">
              <span>3. Rent paid − 10% of basic</span>
              <span className="tabular-nums">{formatINR(result.limbs.rentMinusTenPercent)}</span>
            </li>
          </ul>
          <p className="mt-2 text-xs font-medium opacity-80" style={{ color: "#0e5f63" }}>{LIMB_LABEL[result.bindingLimb]}.</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "#0e5f63" }}
            >
              Save rent details to draft
            </button>
            {saved && (
              <Link
                href="/file/review?tab=deductions"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Saved — open in filing flow →
              </Link>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Estimate only. Confirm the exempt amount against your salary records before filing on
            incometax.gov.in.
          </p>
        </div>
      )}
    </div>
  );
}
