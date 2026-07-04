import { redirect } from "next/navigation";

/** Server-component helper for doc 40 kill/merge redirects. */
export function permanentRouteRedirect(to: string): never {
  redirect(to);
}
