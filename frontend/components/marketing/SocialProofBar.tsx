import { TrustBar } from "@/components/marketing/TrustBar";
import { cn } from "@/lib/utils";

interface SocialProofBarProps {
  variant?: "light" | "dark";
  trustVariant?: "light" | "dark" | "compact";
  showBetaBadge?: boolean;
  className?: string;
}

export function SocialProofBar({
  variant = "light",
  trustVariant,
  showBetaBadge = true,
  className,
}: SocialProofBarProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <TrustBar
        variant={trustVariant ?? variant}
        showBetaBadge={showBetaBadge}
      />
      <p className="text-tier-legal text-center lg:text-left">
        Secure checkout via Razorpay. We never store card or UPI details.
      </p>
    </div>
  );
}
