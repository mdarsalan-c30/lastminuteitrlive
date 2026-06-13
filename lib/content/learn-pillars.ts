import type { ArticleCluster } from "./article-clusters";

export type LearnPillar = "prep" | "reconcile" | "regime" | "portal";

export const LEARN_PILLARS: {
  id: LearnPillar;
  label: string;
  description: string;
  clusters: ArticleCluster[];
}[] = [
  {
    id: "prep",
    label: "Prep",
    description: "Documents, deadlines, and choosing the right ITR form.",
    clusters: ["last-minute", "form-16", "salaried", "senior", "general"],
  },
  {
    id: "reconcile",
    label: "Reconcile",
    description: "Form 16 vs AIS vs 26AS — fix before portal upload.",
    clusters: ["ais"],
  },
  {
    id: "regime",
    label: "Regime & deductions",
    description: "Old vs new regime and proof-backed Chapter VI-A claims.",
    clusters: ["regime", "deductions"],
  },
  {
    id: "portal",
    label: "File on portal",
    description: "Submit and e-verify on incometax.gov.in yourself.",
    clusters: ["mistakes"],
  },
];

export function pillarForCluster(cluster?: ArticleCluster): LearnPillar {
  if (!cluster) return "prep";
  for (const pillar of LEARN_PILLARS) {
    if (pillar.clusters.includes(cluster)) return pillar.id;
  }
  return "prep";
}
