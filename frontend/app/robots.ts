import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * Public marketing surfaces are indexable.
 * Filing, auth, admin, and APIs stay out of the index.
 * AEO Foundation: explicitly manage AI crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/file/",
          "/api/",
          "/admin/",
          "/auth/",
          "/ca/",
          "/profile",
        ],
      },
      // --- AI Search-Augmented Crawlers (allow — these drive citations) ---
      {
        userAgent: ["PerplexityBot", "ClaudeBot", "GPTBot", "Google-Extended", "Applebot-Extended"],
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
