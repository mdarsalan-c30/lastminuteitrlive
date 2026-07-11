import { PageShell } from "@/components/layout/PageShell";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { BlogsExplorer } from "@/components/marketing/BlogsExplorer";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { getAllBlogPosts } from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Tax & Finance Blog | LastMinute ITR",
  description:
    "Expert articles on last-minute ITR filing, tax regimes, AIS mismatches, and lawful wealth optimization.",
  path: "/blogs",
});

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <SiteHeader />
      <PageShell className="py-12 sm:py-16 bg-white" contentClassName="max-w-7xl">
        <ScrollReveal delay={0} className="text-center mb-12">
          <h1 className={`font-manrope font-extrabold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>
            Lastminute <span className="text-primary">Insights</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay ahead with expert guides on tax filing, regime optimization, and personal finance
            strategies for Indian professionals.
          </p>
        </ScrollReveal>

        <BlogsExplorer posts={posts} />
      </PageShell>
      <SiteFooter />
    </>
  );
}
