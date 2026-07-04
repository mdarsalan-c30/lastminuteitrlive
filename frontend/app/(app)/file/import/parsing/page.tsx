import { redirect } from "next/navigation";

/** EXTRACT is inline on COLLECT — parsing route dies (doc 40). */
export default async function ParsingRedirect({
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
  redirect(q ? `/file/import/documents?${q}` : "/file/import/documents");
}
