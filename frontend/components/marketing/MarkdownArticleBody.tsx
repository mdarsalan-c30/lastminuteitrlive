"use client";

import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export function MarkdownArticleBody({ body }: { body: string }) {
  // If the body contains HTML tags (legacy TipTap or hardcoded), render it directly.
  const isHtml = /<[a-z][\s\S]*>/i.test(body);

  if (isHtml) {
    // Strip internal links from HTML string
    const noInternalLinksBody = body.replace(/<a\s+[^>]*href=["'](\/|#)[^"']*["'][^>]*>(.*?)<\/a>/gi, '$2');

    return (
      <div 
        className="html-article-body prose prose-sm sm:prose-base max-w-none"
        dangerouslySetInnerHTML={{ __html: noInternalLinksBody }} 
      />
    );
  }

  return (
    <div data-color-mode="light" className="w-full bg-white">
      <MarkdownPreview 
        source={body} 
        style={{ backgroundColor: 'transparent', color: 'inherit' }}
        className="prose prose-sm sm:prose-base max-w-none prose-headings:font-manrope prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed"
        components={{
          a: ({ node, ...props }) => {
            const isInternal = typeof props.href === "string" && (props.href.startsWith("/") || props.href.startsWith("#"));
            if (isInternal) {
              return <span className="font-semibold">{props.children}</span>;
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" />;
          }
        }}
      />
    </div>
  );
}
