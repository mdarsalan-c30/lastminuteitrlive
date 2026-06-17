import { HeroNameForm } from "@/components/marketing/HeroNameForm";
import { COMPANION_ITD_DISCLAIMER } from "@/lib/copy/companion";
import { cn } from "@/lib/utils";

type CompanionModeCalloutVariant = "steps" | "disclaimer";

interface CompanionModeCalloutProps {
  variant?: CompanionModeCalloutVariant;
  className?: string;
}

export function CompanionModeCallout({
  variant = "steps",
  className,
}: CompanionModeCalloutProps) {
  if (variant === "disclaimer") {
    return (
      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          className
        )}
      >
        {COMPANION_ITD_DISCLAIMER}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <HeroNameForm showForm16Cta={false} className="mx-0 max-w-none" />

      <p className="text-center text-[10px] leading-snug text-muted-foreground lg:text-left">
        {COMPANION_ITD_DISCLAIMER}
      </p>
    </div>
  );
}
