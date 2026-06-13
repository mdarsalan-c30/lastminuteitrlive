import { cn } from "@/lib/utils";
import { CONTENT_MAX } from "@/lib/design/layout";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageShell({ children, className, contentClassName }: PageShellProps) {
  return (
    <main className={cn("w-full px-4 sm:px-6 lg:px-8", className)}>
      <div className={cn("mx-auto w-full min-w-0", CONTENT_MAX, contentClassName)}>{children}</div>
    </main>
  );
}
