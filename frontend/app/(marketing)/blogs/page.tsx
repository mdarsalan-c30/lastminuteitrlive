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
import { getAllBlogPosts, type BlogPost } from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Tax & Finance Blog | LastMinute ITR",
  description:
    "Expert articles on last-minute ITR filing, tax regimes, AIS mismatches, and lawful wealth optimization.",
  path: "/blogs",
});

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="block h-full">
      <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${featured ? 'border-primary/20' : ''}`}>
        {/* Placeholder thumbnail for modern look */}
        <div className={`w-full bg-muted overflow-hidden relative ${featured ? 'h-64' : 'h-48'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/30 mix-blend-multiply" />
          {/* We can replace this with actual post.thumbnailUrl later if added to BlogPost type */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl">
            {post.tags[0] || "Blog"}
          </div>
        </div>
        <CardHeader className="flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 mb-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className={`font-manrope ${featured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'} mb-2`}>
            {post.title}
          </CardTitle>
          <CardDescription className={featured ? 'text-base' : 'text-sm line-clamp-3'}>
            {post.excerpt}
          </CardDescription>
          <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{post.readMinutes} min read</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  // Categorize for modern layout
  const trending = posts.slice(0, 1); // 1 Featured post
  const latest = posts.slice(1, 7); // Next 6
  
  const tutorials = posts.filter(p => p.tags.some(t => t.toLowerCase().includes('guide') || t.toLowerCase().includes('tutorial'))).slice(0, 3);
  const finance = posts.filter(p => p.tags.some(t => t.toLowerCase().includes('finance') || t.toLowerCase().includes('tax'))).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <PageShell className="py-12 sm:py-16 bg-white" contentClassName="max-w-6xl">
        {/* Header section */}
        <ScrollReveal delay={0} className="text-center mb-16">
          <h1 className={`font-manrope font-extrabold text-foreground ${TYPOGRAPHY_SCALE.headline}`}>
            Lastminute <span className="text-primary">Insights</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay ahead with expert guides on tax filing, regime optimization, and personal finance strategies for Indian professionals.
          </p>
        </ScrollReveal>

        {/* Trending / Featured */}
        {trending.length > 0 && (
          <ScrollReveal delay={1} className="mb-20">
            <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Trending Now
            </h2>
            <div className="w-full">
              {trending.map(post => (
                <BlogCard key={post.slug} post={post} featured={true} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Latest */}
        {latest.length > 0 && (
          <ScrollReveal delay={2} className="mb-20">
            <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-secondary rounded-full"></span>
              Latest Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map(post => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Categories Grid (Tutorials & Finance side by side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {tutorials.length > 0 && (
            <ScrollReveal delay={3}>
              <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary/60 rounded-full"></span>
                Tutorials & Guides
              </h2>
              <div className="flex flex-col gap-6">
                {tutorials.map(post => (
                  <Link key={post.slug} href={`/blogs/${post.slug}`} className="group flex gap-4 items-center p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-24 h-24 rounded-lg bg-secondary/30 shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl opacity-30">#</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{post.readMinutes} min read · {new Date(post.publishedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          )}

          {finance.length > 0 && (
            <ScrollReveal delay={4}>
              <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-accent rounded-full"></span>
                Personal Finance
              </h2>
              <div className="flex flex-col gap-6">
                {finance.map(post => (
                  <Link key={post.slug} href={`/blogs/${post.slug}`} className="group flex gap-4 items-center p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-24 h-24 rounded-lg bg-primary/10 shrink-0 overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl opacity-30">$</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{post.readMinutes} min read · {new Date(post.publishedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>

      </PageShell>
      <SiteFooter />
    </>
  );
}
