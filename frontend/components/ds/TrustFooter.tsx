import { cn } from "@/lib/utils";
import { NOT_GOVERNMENT, YOUR_DATA_LINE } from "@/lib/copy/strings";

/**
 * Trust footer (doc 41 §4): the honest one — appears on GATE, upload, and
 * checkout surfaces. States what we are and are not. Copy is canonical
 * (lib/copy/strings.ts) so the "not affiliated" line can never drift.
 */
export function TrustFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "space-y-1 border-t border-border pt-4 text-center text-xs text-muted-foreground",
        className
      )}
    >
      <p>{NOT_GOVERNMENT}</p>
      <p>{YOUR_DATA_LINE}</p>
    </footer>
  );
}
