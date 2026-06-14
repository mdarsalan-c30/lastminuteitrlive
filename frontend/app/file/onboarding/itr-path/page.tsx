import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function eligibilityUrl(searchParams: SearchParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  return `/file/onboarding/eligibility${query ? `?${query}` : ""}`;
}

export default async function ItrPathRedirectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  redirect(eligibilityUrl(await searchParams));
}
