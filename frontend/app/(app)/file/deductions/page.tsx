import { redirect } from "next/navigation";

/** Merged into CONFIRM deductions tab (doc 40). SmartSavingsFinder lives there. */
export default function DeductionsRedirect() {
  redirect("/file/review?tab=deductions");
}
