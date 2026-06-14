import { Hand, Scale, Shield, ShieldCheck } from "lucide-react";
import {
  UniformBadgeGrid,
  type UniformBadgeItem,
} from "@/components/ui/UniformBadgeGrid";
import { cn } from "@/lib/utils";

const TRUST_BADGES: UniformBadgeItem[] = [
  {
    iconNode: <span className="text-[10px] font-semibold text-foreground">₹</span>,
    label: "Salary-first calculations",
  },
  { icon: Scale, label: "Lawful optimization" },
  { icon: ShieldCheck, label: "DPDP compliant" },
  { icon: Hand, label: "No auto-submit" },
];

interface TrustBarProps {
  variant?: "light" | "dark" | "compact";
  showBetaBadge?: boolean;
  className?: string;
}

export function TrustBar({
  variant = "light",
  showBetaBadge = true,
  className,
}: TrustBarProps) {
  const isDark = variant === "dark";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showBetaBadge && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium",
            isDark ? "text-white/90" : "text-foreground"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Shield
              className={cn("size-4", isDark ? "text-blue-300" : "text-primary")}
              aria-hidden
            />
            Early beta: real filer metrics coming soon
          </span>
        </div>
      )}

      <UniformBadgeGrid
        items={TRUST_BADGES}
        variant={isDark ? "dark" : "light"}
        className="w-full"
      />
    </div>
  );
}
