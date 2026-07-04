import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ERROR_STATE_DEFAULT } from "@/lib/copy/strings";

/**
 * Empty and error states (doc 41 §5: all 7 component states designed —
 * "no screen ships without its empty and error state").
 */

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border p-8 text-center", className)}>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/**
 * Error pattern per doc 42 §4: what happened → your data is safe → the way out.
 * Never blames the user, never dead-ends.
 */
export function ErrorState({
  title = ERROR_STATE_DEFAULT.title,
  body = ERROR_STATE_DEFAULT.body,
  action,
  className,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border border-destructive/20 bg-destructive/5 p-6", className)}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
