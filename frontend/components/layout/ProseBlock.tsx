import { cn } from "@/lib/utils";
import { LEGAL_PROSE_MAX } from "@/lib/design/layout";

interface ProseBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function ProseBlock({ children, className }: ProseBlockProps) {
  return <div className={cn("prose-legal", LEGAL_PROSE_MAX, className)}>{children}</div>;
}
