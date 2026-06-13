import { cn } from "@/lib/utils";
import { SECTION_PADDING, TYPOGRAPHY_SCALE } from "@/lib/design/layout";

interface SectionBlockProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function SectionBlock({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionBlockProps) {
  return (
    <section className={cn("section-shell", SECTION_PADDING, className)}>
      <header className={cn("space-y-3", headerClassName)}>
        <h2 className={cn("font-semibold text-foreground", TYPOGRAPHY_SCALE.headline)}>{title}</h2>
        {subtitle ? (
          <p className={cn("max-w-3xl text-muted-foreground", TYPOGRAPHY_SCALE.body)}>{subtitle}</p>
        ) : null}
      </header>
      <div className={cn("mt-8", contentClassName)}>{children}</div>
    </section>
  );
}
