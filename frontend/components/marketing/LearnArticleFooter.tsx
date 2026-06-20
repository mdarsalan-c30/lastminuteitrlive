import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGlossaryTerm } from "@/lib/content/glossary";
import { ArrowRight } from "lucide-react";

interface LearnArticleFooterProps {
  relatedGlossarySlugs: string[];
}

export function LearnArticleFooter({ relatedGlossarySlugs }: LearnArticleFooterProps) {
  const terms = relatedGlossarySlugs
    .map((slug) => getGlossaryTerm(slug))
    .filter((term): term is NonNullable<typeof term> => term !== undefined);

  return (
    <footer className="mt-12 space-y-8 border-t border-border pt-8">
      {terms.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Related glossary terms</h2>
          <ul className="mt-3 space-y-2">
            {terms.map((term) => (
              <li key={term.slug}>
                <Link
                  href={`/glossary/${term.slug}`}
                  className="text-primary hover:underline"
                >
                  {term.label}
                </Link>
                <span className="text-muted-foreground"> — {term.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-blue-300/70 bg-blue-100/90 p-6">
        <h2 className="text-lg font-semibold">Start your return</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Import Form 16 and AIS, compare old vs new regime, and catch mismatches before you reach
          the government portal.
        </p>
        <Link
          href="/file/import/documents?source=form16"
          className={cn(buttonVariants(), "mt-4")}
        >
          Import Form 16 — free estimate
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </footer>
  );
}
