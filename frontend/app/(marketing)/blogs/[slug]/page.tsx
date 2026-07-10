import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCTA } from "@/components/marketing/BlogCTA";
import { LearnArticleFooter } from "@/components/marketing/LearnArticleFooter";
import { MarkdownArticleBody } from "@/components/marketing/MarkdownArticleBody";
import { RelatedArticles } from "@/components/marketing/RelatedArticles";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { getAllBlogPosts, getBlogPost } from "@/lib/content/blogs";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Blog not found" };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blogs/${slug}`,
  });
}

function SocialShare({ url, title }: { url: string; title: string }) {
  // Safe default for SSR
  const shareUrl = `https://lastminuteitr.com${url}`;
  
  return (
    <div className="flex items-center gap-3 py-4 border-y border-border/60 my-8">
      <span className="text-sm font-semibold text-muted-foreground mr-2">Share this article:</span>
      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
      </a>
      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path></svg>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
      </a>
    </div>
  );
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      
      {/* Hero Banner / Thumbnail */}
      <div className="w-full bg-muted relative min-h-[240px] sm:min-h-[360px] lg:min-h-[420px] overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/40 mix-blend-multiply" />
         <div className="relative flex min-h-[240px] flex-col items-center justify-center text-center p-6 sm:min-h-[360px] lg:min-h-[420px]">
            <Badge variant="secondary" className="mb-4 sm:mb-6 py-1 px-3 text-xs tracking-widest uppercase font-bold">{post.tags[0] || 'Article'}</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-manrope text-[#0B1220] max-w-4xl tracking-tight leading-tight [overflow-wrap:anywhere]">
               {post.title}
            </h1>
         </div>
      </div>

      <main className="mx-auto max-w-[800px] min-w-0 px-5 py-12 sm:px-8 sm:py-16 bg-white -mt-10 relative z-10 rounded-t-3xl shadow-sm border border-border/50">
        <div className="mb-8">
          <Link href="/blogs" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 w-fit mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to blogs
          </Link>
          
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
             {post.excerpt}
          </p>

          {/* Author & Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border/60">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                   TS
                </div>
                <div>
                   <p className="text-sm font-bold text-foreground">LastMinuteITR Editorial Team</p>
                   <p className="text-xs font-medium text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 py-1.5 px-3 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {post.readMinutes} min read
             </div>
          </div>
        </div>
        
        <SocialShare url={`/blogs/${slug}`} title={post.title} />

        <article className="prose prose-slate sm:prose-lg max-w-none prose-headings:font-manrope prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-primary">
          <MarkdownArticleBody body={post.body} />
        </article>
        
        <SocialShare url={`/blogs/${slug}`} title={post.title} />

        <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
               <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">#{tag}</span>
            ))}
        </div>

        <BlogCTA className="mt-16" />
        
        {post.relatedGlossarySlugs && (
          <LearnArticleFooter relatedGlossarySlugs={post.relatedGlossarySlugs} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
