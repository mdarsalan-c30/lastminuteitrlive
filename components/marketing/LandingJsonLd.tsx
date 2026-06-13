import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getDisplayPricing } from "@/lib/marketing/pricing";
import { getSiteUrl } from "@/lib/seo";

export function LandingJsonLd() {
  const aiSmart = getDisplayPricing("ai_smart");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
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
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: getSiteUrl(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
    </>
  );
}
