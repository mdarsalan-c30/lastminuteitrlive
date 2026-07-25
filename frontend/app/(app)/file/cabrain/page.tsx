import { redirect } from "next/navigation";

/** Guided checks live inside journey states, not as a separate destination. */
export default function CaBrainRedirect() {
  redirect("/file/regime");
}
