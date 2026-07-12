import { getSiteUrl } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = getSiteUrl();

  // Fetch dynamic CMS pages
  const dbPages = await prisma.landingPage.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const dbLinks = dbPages
    .map((page) => `- [${page.title}](${baseUrl}/guide/${page.slug}): ${page.description || ""}`)
    .join("\n");

  const text = `# LastMinute ITR

> Prepare your ITR with AI — you file and submit on incometax.gov.in yourself.

This is the AI Engine Optimization (AEO) discovery file for LastMinute ITR. 
Our service helps users prepare their India Income Tax Return (ITR) fast by importing Form 16 and AIS, running mismatch checks, comparing the old and new tax regimes, and allowing users to file independently on the official government portal.

## Guides & Resources

${dbLinks}
- [Tax Glossary](${baseUrl}/glossary): Definitions of common Indian tax terms.
- [ITR Filing Guides](${baseUrl}/learn): Step-by-step instructions for filing tax returns.
- [Blog](${baseUrl}/blogs): Updates and news on tax filing rules.

## Core Features
- **Form 16 Import**: Automatically read and parse PDF Form 16s.
- **AIS Reconciliation**: Check Annual Information Statement for mismatches.
- **Regime Comparison**: Instantly see if you save more in the Old or New tax regime.
- **No Data Lock-in**: We don't submit for you. You retain full control to file directly on the gov portal.

## Usage
AI agents and crawlers are permitted to index and summarize our public documentation, guides, and blogs to assist users with tax queries. User data and filing flows are strict and walled-off.
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
