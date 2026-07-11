import { Fragment } from "react";

/** Highlights amounts, sections, and common tax terms in plain-English copy. */
const HIGHLIGHT_RE =
  /(₹[\d,]+(?:\.\d+)?|₹[\d.]+[LK]|\(₹[\d.]+\s*[LK]?\s*cap\)|under\s+Section\s+[\dA-Z()]+|Section\s+[\dA-Z()]+|PPF|ELSS|EPF|NPS|80C|80D|80CCD\(1B\)|Form\s+16|AIS|26AS)/gi;

export function highlightCopyText(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  const re = new RegExp(HIGHLIGHT_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <strong
        key={`${match.index}-${match[0]}`}
        className="font-semibold text-slate-900"
      >
        {match[0]}
      </strong>
    );
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : <Fragment>{nodes}</Fragment>;
}
