import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getDisplayPricing } from "@/lib/marketing/pricing";
import { absoluteUrl, getSiteUrl, OG_IMAGE_PATH } from "@/lib/seo";
import { BRAND_LOGO_PATH } from "@/lib/brand";

export function LandingJsonLd() {
  const aiSmart = getDisplayPricing("ai_smart");
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const siteId = `${siteUrl}/#website`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_TAGLINE,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(BRAND_LOGO_PATH),
        },
        image: absoluteUrl(OG_IMAGE_PATH),
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: "en-IN",
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        url: siteUrl,
        image: absoluteUrl(OG_IMAGE_PATH),
        publisher: { "@id": orgId },
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "2499",
          priceCurrency: "INR",
          offers: [
            {
              "@type": "Offer",
              name: "AI Smart",
              price: String(aiSmart.current),
              priceCurrency: "INR",
            },
          ],
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
