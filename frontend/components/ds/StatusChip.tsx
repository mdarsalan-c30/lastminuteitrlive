import { cn } from "@/lib/utils";

export type ChipStatus =
  | "confirmed"
  | "estimate"
  | "mismatch"
  | "blocked"
  | "verified";

const STYLES: Record<ChipStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-success/10 text-success" },
  estimate: { label: "Estimate", cls: "bg-warning/10 text-warning" },
  mismatch: { label: "Needs a look", cls: "bg-warning/10 text-warning" },
  blocked: { label: "Blocked", cls: "bg-destructive/10 text-destructive" },
  verified: { label: "Verified", cls: "bg-success/10 text-success" },
};

/**
 * Fact/case status chip (doc 41 §4). Fixed vocabulary — status is never
 * conveyed by color alone (WCAG 1.4.1): each chip always carries its word.
 */
export function StatusChip({
  status,
  label,
  className,
}: {
  status: ChipStatus;
  /** Optional label override; the status word set is the default. */
  label?: string;
  className?: string;
}) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style.cls,
        className
      )}
    >
      {label ?? style.label}
    </span>
  );
}
