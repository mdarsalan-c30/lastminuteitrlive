import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WhyWeAskHintProps {
  children: ReactNode;
  className?: string;
}

/** One-line why-we-ask microcopy — uses Phase 3 typography tier. */
export function WhyWeAskHint({ children, className }: WhyWeAskHintProps) {
  return (
    <p className={cn("text-tier-feature text-muted-foreground", className)}>
      {children}
    </p>
  );
}
