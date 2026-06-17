import { LEARN_ARTICLES, type LearnArticle } from "./learn-articles";

export type ArticleCluster =
  | "last-minute"
  | "regime"
  | "form-16"
  | "ais"
  | "salaried"
  | "senior"
  | "deductions"
  | "mistakes"
  | "general";

const CLUSTER_PRIORITY: ArticleCluster[] = [
  "last-minute",
  "form-16",
  "ais",
  "regime",
  "salaried",
  "senior",
  "deductions",
  "mistakes",
  "general",
];

/** Related articles by shared cluster, then shared tags, excluding current slug. */
export function getRelatedArticles(slug: string, limit = 3): LearnArticle[] {
  const current = LEARN_ARTICLES.find((a) => a.slug === slug);
  if (!current) return [];

  const scored = LEARN_ARTICLES.filter((a) => a.slug !== slug).map((article) => {
    let score = 0;
    if (current.cluster && article.cluster === current.cluster) score += 10;
    if (current.tags && article.tags) {
      const overlap = current.tags.filter((t) => article.tags?.includes(t)).length;
      score += overlap * 3;
    }
    return { article, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime();
  });

  const picked: LearnArticle[] = [];
  for (const { article, score } of scored) {
    if (score === 0 && picked.length >= limit) break;
    if (picked.length >= limit) break;
    picked.push(article);
  }

  if (picked.length < limit) {
    for (const article of LEARN_ARTICLES) {
      if (article.slug === slug || picked.some((p) => p.slug === article.slug)) continue;
      picked.push(article);
      if (picked.length >= limit) break;
    }
  }

  return picked.slice(0, limit);
}

export function getArticlesByCluster(cluster: ArticleCluster): LearnArticle[] {
  return LEARN_ARTICLES.filter((a) => a.cluster === cluster);
}

export { CLUSTER_PRIORITY };
