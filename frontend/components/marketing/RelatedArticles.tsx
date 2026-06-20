import Link from "next/link";
import { getRelatedArticles } from "@/lib/content/article-clusters";
import { ArrowRight } from "lucide-react";

interface RelatedArticlesProps {
  slug: string;
  basePath?: "/learn" | "/blogs";
}

export function RelatedArticles({ slug, basePath = "/learn" }: RelatedArticlesProps) {
  const related = getRelatedArticles(slug, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-lg font-semibold">Related guides</h2>
      <ul className="mt-4 space-y-3">
        {related.map((article) => (
          <li key={article.slug}>
            <Link
              href={`${basePath}/${article.slug}`}
              className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors hover:border-primary/30 hover:bg-blue-100/90"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary">
                  {article.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {article.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {article.readMinutes} min read
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
