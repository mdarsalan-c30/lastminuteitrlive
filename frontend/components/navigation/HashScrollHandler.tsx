"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HASH_TARGETS = new Set([
  "pricing",
  "regime-compare",
  "final-check",
  "how-it-works",
  "filing-progress",
]);

function scrollToHashTarget(hash: string) {
  if (!HASH_TARGETS.has(hash)) return;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const attemptScroll = (attempt = 0) => {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      return;
    }
    if (attempt < 20) {
      window.setTimeout(() => attemptScroll(attempt + 1), 75);
    }
  };

  attemptScroll();
}

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const run = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      scrollToHashTarget(hash);
    };

    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, [pathname]);

  return null;
}
