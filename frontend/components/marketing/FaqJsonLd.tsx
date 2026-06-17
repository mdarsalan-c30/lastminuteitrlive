import type { FaqItem } from "@/lib/content/faqs";

interface FaqJsonLdProps {
  faqs: FaqItem[];
}

/** FAQPage structured data for landing and article FAQ blocks. */
export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  if (faqs.length === 0) return null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
  );
}
