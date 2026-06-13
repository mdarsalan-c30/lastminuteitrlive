import { getLearnArticle } from "@/lib/content/learn-articles";

export interface SeoLandingPage {
  slug: string;
  learnSlug: string;
  path: string;
  ctaHref: string;
  ctaLabel: string;
}

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: "itr-deadline-2026",
    learnSlug: "itr-deadline-2026",
    path: "/itr-deadline-2026",
    ctaHref: "/file/import/documents?source=form16",
    ctaLabel: "Start filing before the deadline",
  },
  {
    slug: "old-vs-new-regime",
    learnSlug: "old-vs-new-regime",
    path: "/old-vs-new-regime",
    ctaHref: "/file/regime",
    ctaLabel: "Compare regimes on your numbers",
  },
  {
    slug: "form-16-filing",
    learnSlug: "form-16-guide",
    path: "/form-16-filing",
    ctaHref: "/file/import/documents?source=form16",
    ctaLabel: "Upload Form 16 — free estimate",
  },
];

export function getSeoLandingPage(slug: string): SeoLandingPage | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug);
}

export function getLandingLearnContent(learnSlug: string) {
  return getLearnArticle(learnSlug);
}
