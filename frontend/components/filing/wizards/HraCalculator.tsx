"use client";

import { computeHraExemption, type CityTier } from "@/lib/tax/hra";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface HraCalculatorProps {
  hraReceived: number;
  basicSalary: number;
  actualRentPaid: number;
  cityTier: CityTier;
  onChange: (patch: {
    hraReceived?: number;
    actualRentPaid?: number;
    cityTier?: CityTier;
  }) => void;
  className?: string;
}

/**
 * Plain-English HRA least-of-three wizard for CONFIRM / review.
 */
export function HraCalculator({
  hraReceived,
  basicSalary,
  actualRentPaid,
  cityTier,
  onChange,
  className,
}: HraCalculatorProps) {
  const breakdown = computeHraExemption({
    hraReceived,
    basicSalary,
    actualRentPaid,
    cityTier,
  });

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 space-y-4",
        className
      )}
      aria-labelledby="hra-calc-title"
    >
      <div>
        <h3 id="hra-calc-title" className="text-base font-semibold text-foreground">
          House Rent Allowance (HRA)
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We take the smallest of three amounts — that is your tax-free HRA in the Old
          regime. New regime does not allow HRA exemption.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted-foreground">HRA in your salary (yearly)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            value={hraReceived || ""}
            onChange={(e) =>
              onChange({ hraReceived: Math.max(0, Number(e.target.value) || 0) })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Rent you paid (yearly)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            value={actualRentPaid || ""}
            onChange={(e) =>
              onChange({
                actualRentPaid: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </label>
      </div>

      <div className="flex gap-2" role="group" aria-label="City type">
        {(["metro", "non_metro"] as const).map((tier) => (
          <button
            key={tier}
            type="button"
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition",
              cityTier === tier
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
            onClick={() => onChange({ cityTier: tier })}
          >
            {tier === "metro" ? "Metro (50% of basic)" : "Non-metro (40% of basic)"}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Basic used for calculation: {formatINR(basicSalary)} (we use ~50% of gross when
        Form 16 does not split basic).
      </p>

      <ul className="space-y-1.5 text-sm">
        <li className="flex justify-between gap-2">
          <span>1. Actual HRA received</span>
          <span className="font-medium">{formatINR(breakdown.limb1ActualHra)}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>
            2. {Math.round(breakdown.metroFactor * 100)}% of basic
          </span>
          <span className="font-medium">
            {formatINR(breakdown.limb2PercentOfBasic)}
          </span>
        </li>
        <li className="flex justify-between gap-2">
          <span>3. Rent − 10% of basic</span>
          <span className="font-medium">
            {formatINR(breakdown.limb3RentMinus10PctBasic)}
          </span>
        </li>
      </ul>

      <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
        Tax-free HRA (least of three): {formatINR(breakdown.exemption)}
      </div>
    </section>
  );
}
