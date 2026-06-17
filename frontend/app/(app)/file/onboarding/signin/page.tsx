import { redirect } from "next/navigation";

/** Merged into eligibility "About you" screen (P2-5). */
export default function SignInPage() {
  redirect("/file/onboarding/eligibility?step=about-you");
}
