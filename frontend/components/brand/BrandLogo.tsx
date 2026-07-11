import Image from "next/image";
import Link from "next/link";
import {
  BRAND_ICON_PATH,
  BRAND_LOGO_ALT,
  BRAND_LOGO_PATH,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg";
type BrandLogoVariant = "full" | "icon" | "wordmark";

const ICON_SIZE_CLASS: Record<BrandLogoSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-9",
  lg: "size-11",
};

const FULL_HEIGHT_CLASS: Record<BrandLogoSize, string> = {
  xs: "h-7 w-auto",
  sm: "h-9 w-auto",
  md: "h-11 w-auto",
  lg: "h-14 w-auto",
};

const ICON_PX: Record<BrandLogoSize, number> = {
  xs: 28,
  sm: 32,
  md: 36,
  lg: 44,
};

const FULL_WIDTH: Record<BrandLogoSize, number> = {
  xs: 84,
  sm: 108,
  md: 132,
  lg: 168,
};

interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  href = "/",
  size = "md",
  variant = "full",
  className,
  priority = false,
}: BrandLogoProps) {
  const isWordmark = variant === "wordmark";
  const isIconOnly = variant === "icon" || isWordmark;

  const image = isIconOnly ? (
    <Image
      src={BRAND_ICON_PATH}
      alt={BRAND_LOGO_ALT}
      width={ICON_PX[size]}
      height={ICON_PX[size]}
      className={cn(ICON_SIZE_CLASS[size], "shrink-0 object-contain", className)}
      priority={priority}
    />
  ) : (
    <Image
      src={BRAND_LOGO_PATH}
      alt={BRAND_LOGO_ALT}
      width={FULL_WIDTH[size]}
      height={FULL_WIDTH[size]}
      className={cn(FULL_HEIGHT_CLASS[size], "object-contain object-left", className)}
      priority={priority}
    />
  );

  const content = isWordmark ? (
    <span className="inline-flex items-center gap-2.5 font-manrope font-extrabold text-[18px] tracking-[-0.01em] text-[#0B1220] max-[560px]:text-base">
      {image}
      <span>
        Lastminute<span className="text-[#0e5f63]">ITR</span>
      </span>
    </span>
  ) : (
    image
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={BRAND_LOGO_ALT}>
      {content}
    </Link>
  );
}
