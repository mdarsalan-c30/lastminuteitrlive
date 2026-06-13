"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Profile merged into eligibility (P1-9). Keep route as redirect for bookmarks. */
export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/file/onboarding/eligibility");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-12 text-slate-600">
      Redirecting…
    </div>
  );
}
