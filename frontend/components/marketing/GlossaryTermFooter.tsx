import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGlossaryTerm, type GlossaryTerm } from "@/lib/content/glossary";
import { ArrowRight } from "lucide-react";

interface GlossaryTermFooterProps {
  term: GlossaryTerm;
}

export function GlossaryTermFooter({ term }: GlossaryTermFooterProps) {
  const related =
    term.relatedSlugs
      ?.map((slug) => getGlossaryTerm(slug))
      .filter((t): t is GlossaryTerm => t !== undefined) ?? [];

  return (
    <footer className="mt-12 space-y-8 border-t border-border pt-8">
      {term.learnSlug && (
        <div>
          <h2 className="text-lg font-semibold">Deep dive guide</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href={`/learn/${term.learnSlug}`} className="text-primary hover:underline">
              Read the full article on {term.label}
            </Link>
          </p>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">See also</h2>
          <ul className="mt-3 space-y-2">
            {related.map((relatedTerm) => (
              <li key={relatedTerm.slug}>
                <Link
                  href={`/glossary/${relatedTerm.slug}`}
                  className="text-primary hover:underline"
                >
                  {relatedTerm.label}
                </Link>
                <span className="text-muted-foreground"> — {relatedTerm.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-blue-300/70 bg-blue-100/90 p-6">
        <h2 className="text-lg font-semibold">Check this on your return</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Import Form 16 and AIS — we flag mismatches and compare regimes before you file on
          incometax.gov.in.
        </p>
        <Link
          href="/file/import/documents?source=form16"
          className={cn(buttonVariants(), "mt-4")}
        >
          Start free estimate
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </footer>
  );
}
