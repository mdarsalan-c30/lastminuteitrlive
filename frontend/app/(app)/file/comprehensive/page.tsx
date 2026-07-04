import { redirect } from "next/navigation";

/** Product sprawl killed from V1 nav (doc 40). */
export default function ComprehensiveRedirect() {
  redirect("/file/regime");
}
