import { redirect } from "next/navigation";

/** Merged into risk review (P2-5) — keep URL for bookmarks and checkout gate links. */
export default function PresubmitPage() {
  redirect("/file/review/risk#final-check");
}
