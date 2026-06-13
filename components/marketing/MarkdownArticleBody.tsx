import { renderInlineMarkdown } from "@/lib/content/render-inline-markdown";

export function MarkdownArticleBody({ body }: { body: string }) {
  const blocks = body.trim().split("\n\n");
  return (
    <>
      {blocks.map((block, i) => {
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
        if (block.startsWith("|")) {
          const rows = block.split("\n").filter((r) => !r.includes("---"));
          return (
            <div key={i} className="my-4 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row, ri) => {
                    const cells = row.split("|").filter(Boolean);
                    const Tag = ri === 0 ? "th" : "td";
                    return (
                      <tr key={ri}>
                        {cells.map((cell, ci) => (
                          <Tag key={ci} className="border border-border px-3 py-2 text-left">
                            {cell.trim()}
                          </Tag>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        if (/^\d+\./.test(block)) {
          const items = block.split("\n");
          return (
            <ol key={i} className="mb-4 ml-6 list-decimal space-y-1 text-muted-foreground">
              {items.map((item, li) => (
                <li key={li}>{renderInlineMarkdown(item.replace(/^\d+\.\s*/, ""))}</li>
              ))}
            </ol>
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
      })}
    </>
  );
}
