import { redirect } from "next/navigation";

/** Merged into GATE (doc 40). */
export default function ProfileOnboardingRedirect() {
  redirect("/file/start");
}
