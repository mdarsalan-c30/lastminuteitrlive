import Link from "next/link";
import type { ReactNode } from "react";

/** Renders inline markdown: links, bold, and italic. */
export function renderInlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const href = match[3];
      if (href.startsWith("/")) {
        parts.push(
          <Link key={match.index} href={href} className="text-primary hover:underline">
            {match[2]}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={href}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[2]}
          </a>
        );
      }
    } else if (match[4]) {
      parts.push(<strong key={match.index}>{match[4]}</strong>);
    } else if (match[5]) {
      parts.push(<em key={match.index}>{match[5]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) return text;
  if (parts.length === 1) return parts[0];
  return parts;
}
