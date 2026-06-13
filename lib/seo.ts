import type { Metadata } from "next";

export const OG_IMAGE_PATH = "/og-default.png";
export const OG_IMAGE_ALT = "LastMinute ITR — File ITR before the deadline";

const DEFAULT_SITE_URL = "https://lastminute-itr.vercel.app";

/** Production base URL for canonicals, sitemap, and robots. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const url =
    configured && configured.length > 0
      ? configured
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : DEFAULT_SITE_URL;
  return url.replace(/\/$/, "");
}

export function canonicalPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? "/" : normalized.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${canonicalPath(path)}`;
}

export const defaultOpenGraphImages: NonNullable<Metadata["openGraph"]>["images"] = [
  {
    url: OG_IMAGE_PATH,
    width: 1200,
    height: 630,
    alt: OG_IMAGE_ALT,
  },
];

export function pageMetadata({
  title,
  description,
  path,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
}): Metadata {
  const canonical = canonicalPath(path);
  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "website",
      locale: "en_IN",
      images: defaultOpenGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}
