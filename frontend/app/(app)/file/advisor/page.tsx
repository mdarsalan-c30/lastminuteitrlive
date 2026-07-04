import { redirect } from "next/navigation";

/** AI CA lives inside states, not as a destination (doc 40). */
export default function AdvisorRedirect() {
  redirect("/file/regime");
}
