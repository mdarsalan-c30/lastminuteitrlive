"use client";

import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export function MarkdownArticleBody({ body }: { body: string }) {
  // If the body contains HTML tags (legacy TipTap or hardcoded), render it directly.
  const isHtml = /<[a-z][\s\S]*>/i.test(body);

  if (isHtml) {
    return (
      <div 
        className="html-article-body prose max-w-none"
        dangerouslySetInnerHTML={{ __html: body }} 
      />
    );
  }

  return (
    <div data-color-mode="light" className="w-full bg-white">
      <MarkdownPreview 
        source={body} 
        style={{ backgroundColor: 'transparent', color: 'inherit' }}
        className="prose prose-lg sm:prose-xl max-w-none prose-headings:font-manrope prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80"
      />
    </div>
  );
}
