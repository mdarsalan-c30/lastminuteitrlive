import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  label?: string;
  aspectRatio?: "16/9" | "4/3" | "3/2" | "1/1";
  className?: string;
  /** When true, renders nothing — use when no image asset is available yet. */
  hidden?: boolean;
  src?: string | null;
}

const ASPECT_RATIO_CLASS: Record<NonNullable<ImagePlaceholderProps["aspectRatio"]>, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
};

export function ImagePlaceholder({
  label = "Add illustration",
  aspectRatio = "16/9",
  className,
  hidden = false,
  src,
}: ImagePlaceholderProps) {
  if (hidden || !src) return null;

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-2xl border border-dashed border-border/90 bg-muted/30 px-4 text-center text-sm font-medium text-muted-foreground",
        ASPECT_RATIO_CLASS[aspectRatio],
        className
      )}
    >
      <span>{label}</span>
    </div>
  );
}
