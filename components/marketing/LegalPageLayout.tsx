import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ProseBlock } from "@/components/layout/ProseBlock";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { TYPOGRAPHY_SCALE } from "@/lib/design/layout";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <PageShell className="py-10 sm:py-14 lg:py-16" contentClassName="max-w-4xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-[length:var(--text-caption)] text-primary hover:underline"
        >
          ← Home
        </Link>
        <h1 className={`mt-5 font-semibold text-foreground ${TYPOGRAPHY_SCALE.display}`}>{title}</h1>
        <p className={`mt-3 text-muted-foreground ${TYPOGRAPHY_SCALE.caption}`}>
          Last updated: {lastUpdated}
        </p>
        <ProseBlock className="mt-10">
          {children}
        </ProseBlock>
      </PageShell>
      <SiteFooter />
    </>
  );
}
