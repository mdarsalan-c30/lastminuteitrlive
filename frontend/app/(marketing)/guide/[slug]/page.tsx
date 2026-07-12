import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { renderInlineMarkdown } from "@/lib/content/render-inline-markdown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.landingPage.findUnique({ where: { slug } });
  
  if (!page || !page.published) return { title: "Page not found" };
  
  return pageMetadata({
    title: page.title,
    description: page.seoDescription || page.description || "",
    keywords: page.seoKeywords ? page.seoKeywords.split(",").map(k => k.trim()) : undefined,
    path: `/guide/${slug}`,
  });
}

function renderMarkdownBody(body: string) {
  const blocks = body.trim().split("\n\n");
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-3 text-xl font-semibold">
          {block.replace(/^## /, "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-lg font-semibold">
          {block.replace(/^### /, "")}
        </h3>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n");
      return (
        <ul key={i} className="mb-4 ml-6 list-disc space-y-1 text-muted-foreground">
          {items.map((item, li) => (
            <li key={li}>{renderInlineMarkdown(item.replace(/^-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
        {renderInlineMarkdown(block)}
      </p>
    );
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await prisma.landingPage.findUnique({ where: { slug } });

  if (!page || !page.published) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-[104px]">
      <div className="mx-auto max-w-[800px] px-8 max-[560px]:px-5 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">{page.title}</h1>
        {page.description && (
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {page.description}
          </p>
        )}
        <div className="prose prose-slate max-w-none mt-10 border-t pt-8">
          {renderMarkdownBody(page.bodyMarkdown)}
        </div>
      </div>
    </main>
  );
}
