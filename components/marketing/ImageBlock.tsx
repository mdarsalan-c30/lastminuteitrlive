import Image from "next/image";
import { cn } from "@/lib/utils";
import fs from "fs";
import path from "path";

interface ImageBlockProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Set true only for above-the-fold hero images */
  priority?: boolean;
  loading?: "lazy" | "eager";
}

function marketingAssetExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/** Renders a marketing image when the file exists; otherwise returns null (no empty box). */
export function ImageBlock({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  loading = "lazy",
}: ImageBlockProps) {
  if (!marketingAssetExists(src)) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("h-auto w-full rounded-xl", className)}
      priority={priority}
      loading={priority ? undefined : loading}
    />
  );
}
