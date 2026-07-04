import { redirect } from "next/navigation";

/** Identity lives on GATE (doc 40). */
export default function ProfileRedirect() {
  redirect("/file/start");
}
