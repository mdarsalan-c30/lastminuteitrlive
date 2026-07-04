import { redirect } from "next/navigation";

/** Merged into CONFIRM (doc 40). */
export default function HousePropertyRedirect() {
  redirect("/file/review?tab=income");
}
