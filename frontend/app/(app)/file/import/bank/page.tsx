import { redirect } from "next/navigation";

/** Covered by RECONCILE cards (doc 40). */
export default function BankRedirect() {
  redirect("/file/import/mismatch");
}
