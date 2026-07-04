import { writeFileSync } from "fs";
import { PHASE6_LEARN_ARTICLES } from "../lib/content/learn-articles-phase6";

const articles = PHASE6_LEARN_ARTICLES.map((a) => ({
  slug: a.slug,
  title: a.title,
  description: a.description,
  readMinutes: a.readMinutes,
  publishedAt: a.publishedAt,
  cluster: a.cluster ?? "general",
  tags: a.tags ?? [],
  body: a.body,
  faqs: a.faqs ?? [],
}));

writeFileSync(
  "scripts/blogs-export.json",
  JSON.stringify(articles, null, 2),
  "utf8"
);

console.log(`Exported ${articles.length} articles to scripts/blogs-export.json`);
