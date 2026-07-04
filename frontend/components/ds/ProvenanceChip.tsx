import { cn } from "@/lib/utils";

export type FactSource =
  | "form16"
  | "ais"
  | "26as"
  | "user"
  | "bank"
  | "estimate";

const SOURCE_LABELS: Record<FactSource, string> = {
  form16: "From your Form 16",
  ais: "From your AIS",
  "26as": "From your 26AS",
  user: "You told us",
  bank: "From your bank statement",
  estimate: "Estimated",
};

/**
 * Provenance chip (doc 41 §4): every displayed fact says where it came from.
 * This is the visible edge of the evidence graph (doc 21).
 */
export function ProvenanceChip({
  source,
  className,
}: {
  source: FactSource;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
        className
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}
