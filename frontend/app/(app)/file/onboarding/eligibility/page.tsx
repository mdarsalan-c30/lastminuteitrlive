import { redirect } from "next/navigation";

/** Merged into GATE `/file/start` (doc 40 kill list). */
export default async function EligibilityRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const q = qs.toString();
  redirect(q ? `/file/start?${q}` : "/file/start");
}
