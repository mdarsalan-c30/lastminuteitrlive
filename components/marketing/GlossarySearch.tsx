"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { GlossaryTerm } from "@/lib/content/glossary";
import { Search } from "lucide-react";

interface GlossarySearchProps {
  terms: GlossaryTerm[];
}

export function GlossarySearch({ terms }: GlossarySearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (term) =>
        term.label.toLowerCase().includes(q) ||
        term.explanation.toLowerCase().includes(q) ||
        term.slug.includes(q)
    );
  }, [query, terms]);

  return (
    <>
      <div className="mt-6 rounded-2xl border border-border/70 bg-white/85 p-4 shadow-sm sm:p-5">
        <label htmlFor="glossary-search" className="text-sm font-medium text-foreground">
          Find terms quickly
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="glossary-search"
            type="search"
            placeholder="Search terms like TDS, 80C, HRA..."
            className="h-11 w-full rounded-xl border-border/80 bg-background pl-9 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search glossary terms"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} of {terms.length} terms
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No terms match &ldquo;{query}&rdquo;. Try a shorter keyword like &ldquo;TDS&rdquo; or
            &ldquo;regime&rdquo;.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((term) => (
            <li key={term.id} className="h-full">
              <Link
                href={`/glossary/${term.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/40 hover:shadow-sm"
              >
                <span className="text-base font-semibold leading-6 tracking-tight text-foreground group-hover:text-primary">
                  {term.label}
                </span>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {term.explanation}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
