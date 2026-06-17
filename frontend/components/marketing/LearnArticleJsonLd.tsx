import type { LearnArticle } from "@/lib/content/learn-articles";
import { SITE_NAME } from "@/lib/constants";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import { FaqJsonLd } from "@/components/marketing/FaqJsonLd";

interface LearnArticleJsonLdProps {
  article: LearnArticle;
}

export function LearnArticleJsonLd({ article }: LearnArticleJsonLdProps) {
  const articleUrl = absoluteUrl(`/learn/${article.slug}`);
  const siteUrl = getSiteUrl();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Learn",
        item: absoluteUrl("/learn"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {article.faqs && article.faqs.length > 0 && <FaqJsonLd faqs={article.faqs} />}
    </>
  );
}
