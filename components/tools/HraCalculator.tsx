"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { computeHraExemption, type CityTier } from "@/lib/calculators/hra";
import { formatINR } from "@/lib/format";
import { useDraftStore } from "@/lib/store/draft";
import { Home } from "lucide-react";

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
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
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
    <div className="card-premium p-5" id="hra-calculator">
      <div className="flex items-start gap-2">
        <Home className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-foreground">HRA exemption calculator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Section 10(13A) — exemption is the least of three limbs. Allowed under the old regime
            only (the new regime uses the higher ₹75,000 standard deduction instead).
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField
          id="hra-basic"
          label="Annual basic salary (+ DA)"
          value={basicSalary}
          onChange={setBasicSalary}
          hint="Basic + dearness allowance forming part of pay"
        />
        <NumberField
          id="hra-received"
          label="Annual HRA received"
          value={hraReceived}
          onChange={setHraReceived}
          hint="From Form 16 Part B / salary slips"
        />
        <NumberField
          id="hra-rent"
          label="Annual rent paid"
          value={rentPaid}
          onChange={setRentPaid}
          hint="Total rent paid in the financial year"
        />
        <div>
          <span className="text-sm font-medium text-foreground">City type</span>
          <div className="mt-1 inline-flex rounded-lg border border-border/70 bg-white p-0.5">
            {(["metro", "non_metro"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setCityTier(tier)}
                aria-pressed={cityTier === tier}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  cityTier === tier
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tier === "metro" ? "Metro (50%)" : "Non-metro (40%)"}
              </button>
            ))}
          </div>
          <span className="mt-1 block text-xs text-muted-foreground">
            Metro: Delhi, Mumbai, Kolkata, Chennai
          </span>
        </div>
      </div>

      {hasInput && (
        <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">Exempt HRA</span>
            <span className="text-xl font-bold tabular-nums text-emerald-700">
              {formatINR(result.exemption)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Taxable HRA</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatINR(result.taxable)}
            </span>
          </div>

          <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
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
          <p className="mt-2 text-xs text-muted-foreground">{LIMB_LABEL[result.bindingLimb]}.</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
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
