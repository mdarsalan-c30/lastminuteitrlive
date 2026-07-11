import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASS: Record<BrandLogoSize, string> = {
  xs: "h-7 w-auto",
  sm: "h-9 w-auto",
  md: "h-11 w-auto",
  lg: "h-14 w-auto",
};

const WIDTH_BY_SIZE: Record<BrandLogoSize, number> = {
  xs: 84,
  sm: 108,
  md: 132,
  lg: 168,
};

interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  href = "/",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const image = (
    <Image
      src={BRAND_LOGO_PATH}
      alt={BRAND_LOGO_ALT}
      width={WIDTH_BY_SIZE[size]}
      height={WIDTH_BY_SIZE[size]}
      className={cn(SIZE_CLASS[size], "object-contain object-left", className)}
      priority={priority}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={BRAND_LOGO_ALT}>
      {image}
    </Link>
  );
}
