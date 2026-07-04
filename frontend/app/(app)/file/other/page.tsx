import { redirect } from "next/navigation";

/** Merged into CONFIRM (doc 40). */
export default function OtherIncomeRedirect() {
  redirect("/file/review?tab=income");
}
