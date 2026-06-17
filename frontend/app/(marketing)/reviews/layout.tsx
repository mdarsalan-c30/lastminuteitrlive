import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Reviews",
  description: "What filers say about LastMinute ITR — and share your experience.",
  path: "/reviews",
});

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
