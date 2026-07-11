"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BlogPost } from "@/lib/content/blogs";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="block h-full">
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          featured && "border-primary/20"
        )}
      >
        <div
          className={cn(
            "w-full bg-muted overflow-hidden relative",
            featured ? "h-64" : "h-48"
          )}
        >
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/30 mix-blend-multiply" />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl">
                {post.tags[0] || "Blog"}
              </div>
            </>
          )}
        </div>
        <CardHeader className="flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 mb-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] uppercase font-bold tracking-wider"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle
            className={cn(
              "font-manrope mb-2",
              featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            )}
          >
            {post.title}
          </CardTitle>
          <CardDescription className={featured ? "text-base" : "text-sm line-clamp-3"}>
            {post.excerpt}
          </CardDescription>
          <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{post.readMinutes} min read</span>
            <span>·</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

function matchesQuery(post: BlogPost, query: string): boolean {
  const haystack = [post.title, post.excerpt, ...post.tags].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function BlogsExplorer({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => matchesQuery(post, q));
  }, [posts, query]);

  const trending = filtered.slice(0, 1);
  const latest = filtered.slice(1, 7);
  const tutorials = filtered
    .filter((p) =>
      p.tags.some(
        (t) =>
          t.toLowerCase().includes("guide") || t.toLowerCase().includes("tutorial")
      )
    )
    .slice(0, 3);
  const finance = filtered
    .filter((p) =>
      p.tags.some(
        (t) =>
          t.toLowerCase().includes("finance") || t.toLowerCase().includes("tax")
      )
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside className="w-full shrink-0 lg:w-72 xl:w-80">
        <div className="lg:sticky lg:top-24 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <label htmlFor="blog-search" className="sr-only">
            Search blogs
          </label>
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs…"
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
            />
          </div>

          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            All articles ({filtered.length})
          </p>

          <nav
            className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin"
            aria-label="All blog articles"
          >
            <ul className="space-y-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No articles match your search.
                </li>
              ) : (
                filtered.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="block rounded-lg px-2.5 py-2 text-sm leading-snug text-foreground/90 transition hover:bg-white hover:text-primary"
                    >
                      <span className="line-clamp-2 font-medium">{post.title}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {post.readMinutes} min ·{" "}
                        {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">No results found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different keyword — Form 16, regime, AIS, refund, and more.
            </p>
          </div>
        ) : (
          <>
            {trending.length > 0 && (
              <ScrollReveal delay={1} className="mb-16">
                <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full" />
                  Trending Now
                </h2>
                <div className="w-full">
                  {trending.map((post) => (
                    <BlogCard key={post.slug} post={post} featured />
                  ))}
                </div>
              </ScrollReveal>
            )}

            {latest.length > 0 && (
              <ScrollReveal delay={2} className="mb-16">
                <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-secondary rounded-full" />
                  Latest Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {latest.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              </ScrollReveal>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
              {tutorials.length > 0 && (
                <ScrollReveal delay={3}>
                  <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary/60 rounded-full" />
                    Tutorials & Guides
                  </h2>
                  <div className="flex flex-col gap-6">
                    {tutorials.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blogs/${post.slug}`}
                        className="group flex gap-4 items-center p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-24 h-24 rounded-lg bg-secondary/30 shrink-0 overflow-hidden relative">
                          {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl opacity-30">
                              #
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {post.readMinutes} min read ·{" "}
                            {new Date(post.publishedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {finance.length > 0 && (
                <ScrollReveal delay={4}>
                  <h2 className="text-2xl font-bold font-manrope mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded-full" />
                    Personal Finance
                  </h2>
                  <div className="flex flex-col gap-6">
                    {finance.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blogs/${post.slug}`}
                        className="group flex gap-4 items-center p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-24 h-24 rounded-lg bg-primary/10 shrink-0 overflow-hidden relative">
                          {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl opacity-30">
                              $
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {post.readMinutes} min read ·{" "}
                            {new Date(post.publishedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
