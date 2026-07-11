/**
 * Build-time-style index of all Genie knowledge: articles, help, glossary, FAQs, field tips.
 */

import { LEARN_ARTICLES } from "@/lib/content/learn-articles";
import { HELP_ARTICLES } from "@/lib/content/help-articles";
import { GLOSSARY_TERMS } from "@/lib/content/glossary";
import { LANDING_FAQS } from "@/lib/content/faqs";
import { ITR_MISTAKES, NEED_CA } from "@/lib/content/hooks";
import {
  FIELD_GUIDANCE,
  LOCAL_TAX_ANSWERS,
  STEP_GUIDANCE,
} from "@/lib/filing/genieKnowledge";
import { AY_2026_27_RULES_BLOCKS } from "@/lib/filing/ay2026Rules";

export type GenieChunkSource =
  | "local"
  | "learn"
  | "help"
  | "glossary"
  | "faq"
  | "field"
  | "rules"
  | "step"
  | "pain";

export interface GenieKnowledgeChunk {
  id: string;
  title: string;
  text: string;
  keywords: string[];
  href?: string;
  cluster?: string;
  source: GenieChunkSource;
}

function stripMarkdown(md: string, maxLen = 1000): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLen);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[?.,!'"]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function buildIndex(): GenieKnowledgeChunk[] {
  const chunks: GenieKnowledgeChunk[] = [];

  for (const entry of LOCAL_TAX_ANSWERS) {
    chunks.push({
      id: `local_${entry.keys[0].replace(/\s+/g, "_")}`,
      title: entry.keys[0],
      text: entry.answer,
      keywords: entry.keys,
      source: "local",
    });
  }

  for (const [fieldId, g] of Object.entries(FIELD_GUIDANCE)) {
    chunks.push({
      id: `field_${fieldId}`,
      title: g.title,
      text: `• ${g.tip}\n• Tax impact: ${g.impact}`,
      keywords: [fieldId, g.title.toLowerCase(), ...tokenize(g.tip)],
      source: "field",
    });
  }

  for (const [step, g] of Object.entries(STEP_GUIDANCE)) {
    chunks.push({
      id: `step_${step}`,
      title: step,
      text: `${g.banner}\n${g.tips.map((t) => `• ${t}`).join("\n")}`,
      keywords: [step, ...tokenize(g.banner)],
      cluster: step,
      source: "step",
    });
  }

  for (const article of LEARN_ARTICLES) {
    const faqText =
      article.faqs?.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n") ?? "";
    chunks.push({
      id: `learn_${article.slug}`,
      title: article.title,
      text: [
        article.description,
        stripMarkdown(article.body, 900),
        faqText,
      ]
        .filter(Boolean)
        .join("\n\n"),
      keywords: [
        article.slug.replace(/-/g, " "),
        ...(article.tags ?? []),
        ...(article.cluster ? [article.cluster] : []),
        ...tokenize(article.title),
      ],
      href: `/learn/${article.slug}`,
      cluster: article.cluster,
      source: "learn",
    });
  }

  for (const article of HELP_ARTICLES) {
    if (!article.body) continue;
    chunks.push({
      id: `help_${article.slug}`,
      title: article.title,
      text: `${article.summary}\n\n${stripMarkdown(article.body, 800)}`,
      keywords: [...article.keywords, article.pillar, ...tokenize(article.title)],
      href: article.href.startsWith("/") ? article.href : `/help/${article.slug}`,
      cluster: article.pillar,
      source: "help",
    });
  }

  for (const term of GLOSSARY_TERMS) {
    const body = term.extendedBody
      ? stripMarkdown(term.extendedBody, 600)
      : term.explanation;
    chunks.push({
      id: `glossary_${term.slug}`,
      title: term.label,
      text: body,
      keywords: [term.slug.replace(/-/g, " "), term.label.toLowerCase(), ...(term.category ? [term.category] : [])],
      href: `/glossary/${term.slug}`,
      source: "glossary",
    });
  }

  for (const [i, faq] of LANDING_FAQS.entries()) {
    chunks.push({
      id: `faq_${i}`,
      title: faq.question,
      text: `• ${faq.answer}`,
      keywords: tokenize(faq.question),
      source: "faq",
    });
  }

  for (const block of AY_2026_27_RULES_BLOCKS) {
    chunks.push({
      id: `rules_${block.id}`,
      title: block.topic,
      text: block.bullets.map((b) => `• ${b}`).join("\n"),
      keywords: block.keywords,
      source: "rules",
    });
  }

  for (const item of ITR_MISTAKES.items) {
    chunks.push({
      id: `pain_${item.learnHref}`,
      title: item.mistake,
      text: `Common mistake: ${item.mistake}. Read our guide for how to fix it before filing.`,
      keywords: tokenize(item.mistake),
      href: item.learnHref,
      source: "pain",
    });
  }

  chunks.push({
    id: "pain_need_ca",
    title: NEED_CA.headline,
    text: [
      `Simple cases: ${NEED_CA.simpleCases.items.join("; ")}`,
      `Complex cases (get a CA): ${NEED_CA.complexCases.items.join("; ")}`,
      NEED_CA.footnote,
    ].join("\n"),
    keywords: ["ca", "chartered accountant", "need ca", "complex", "audit"],
    source: "pain",
  });

  return chunks;
}

let cachedIndex: GenieKnowledgeChunk[] | null = null;

export function getGenieContentIndex(): GenieKnowledgeChunk[] {
  if (!cachedIndex) {
    cachedIndex = buildIndex();
  }
  return cachedIndex;
}

export function getGenieIndexStats(): { chunks: number; sources: Record<string, number> } {
  const index = getGenieContentIndex();
  const sources: Record<string, number> = {};
  for (const c of index) {
    sources[c.source] = (sources[c.source] ?? 0) + 1;
  }
  return { chunks: index.length, sources };
}
