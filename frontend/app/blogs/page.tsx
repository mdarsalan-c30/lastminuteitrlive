import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";
import { getAllBlogPosts } from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Blogs — ITR tips & guides",
  description:
    "Articles on last-minute ITR filing, tax regimes, AIS mismatches, and lawful optimization.",
  path: "/blogs",
});

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-12" contentClassName="max-w-4xl">
        <ScrollReveal delay={0}>
          <h1 className={`font-semibold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>Blogs</h1>
          <p className={`mt-2 text-muted-foreground ${TYPOGRAPHY_SCALE.body}`}>
            Short, conversational articles for Indian salaried filers — job changes, FD interest in
            AIS, HRA, senior citizens, and the mistakes that cause notices. {posts.length} guides and
            counting. When one clicks,{" "}
            <Link href="/file" className="text-primary hover:underline">
              start your free estimate
            </Link>{" "}
            and file on the government portal yourself.
          </p>
        </ScrollReveal>
        <ul className="mt-8 space-y-4 sm:mt-10">
          {posts.map((post) => (
            <li key={post.slug} className="min-w-0">
              <ScrollReveal delay={1}>
                <Link href={`/blogs/${post.slug}`} className="block">
                  <Card className="w-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <CardTitle className="text-lg sm:text-xl">{post.title}</CardTitle>
                        {post.source === "upload" && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{post.excerpt}</CardDescription>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {post.readMinutes} min read · {post.publishedAt}
                        </span>
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </PageShell>
      <SiteFooter />
    </>
  );
}
