import { redirect } from "next/navigation";

/** Covered by RECONCILE cards (doc 40). */
export default function TdsRedirect() {
  redirect("/file/import/mismatch");
}
