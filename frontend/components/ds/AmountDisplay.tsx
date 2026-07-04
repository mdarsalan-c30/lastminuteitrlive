import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

export type AmountTone = "refund" | "payable" | "neutral";

/**
 * The ONLY way rupee amounts render on filing surfaces (doc 41 §4).
 * One formatter, one tone system — structurally prevents the dual-price
 * and mixed-format bugs found in the product audit.
 */
export function AmountDisplay({
  amount,
  tone = "neutral",
  size = "md",
  estimate = false,
  className,
}: {
  amount: number;
  /** refund = success green, payable = calm foreground (never alarm red). */
  tone?: AmountTone;
  size?: "sm" | "md" | "lg" | "hero";
  /** Shows the Estimate chip (doc 42 honesty invariant). */
  estimate?: boolean;
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm font-semibold",
    md: "text-lg font-semibold",
    lg: "text-2xl font-bold",
    hero: "text-4xl font-bold tracking-tight",
  }[size];
  const toneClass = {
    refund: "text-success",
    // Payable is a fact, not a failure — never rendered in alarm red (doc 41).
    payable: "text-foreground",
    neutral: "text-foreground",
  }[tone];

  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn(sizeClass, toneClass)}>{formatINR(Math.round(amount))}</span>
      {estimate && (
        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
          Estimate
        </span>
      )}
    </span>
  );
}
