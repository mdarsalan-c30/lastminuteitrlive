"use client";

import Link from "next/link";
import { profileInitials, useProfileStore } from "@/lib/store/profile";
import { cn } from "@/lib/utils";

export function ProfileNavLink({ className }: { className?: string }) {
  const name = useProfileStore((s) => s.name);
  const email = useProfileStore((s) => s.email);
  const hasProfile = Boolean(name.trim() || email.trim());

  if (!hasProfile) return null;

  const initials = profileInitials(name || email);

  return (
    <Link
      href="/profile"
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 sm:size-8 sm:text-xs",
        className
      )}
      aria-label="Your profile"
      title={name.trim() || "Profile"}
    >
      {initials}
    </Link>
  );
}
