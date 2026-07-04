import { redirect } from "next/navigation";

/** Merged into CONFIRM (doc 40). */
export default function IncomeRedirect() {
  redirect("/file/review?tab=income");
}
