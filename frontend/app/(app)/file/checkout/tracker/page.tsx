import { redirect } from "next/navigation";

/** Merged into companion footer (P2-5). */
export default function TrackerPage() {
  redirect("/file/companion#filing-progress");
}
