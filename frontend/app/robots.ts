import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * Public marketing surfaces are indexable.
 * Filing, auth, admin, and APIs stay out of the index.
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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
