"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeroParallaxProps = {
  children: ReactNode;
  className?: string;
};

const MAX_OFFSET_PX = 20;
const SCROLL_FACTOR = 0.06;

export function HeroParallax({ children, className }: HeroParallaxProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;

    const update = () => {
      setOffsetY(Math.min(window.scrollY * SCROLL_FACTOR, MAX_OFFSET_PX));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        "will-change-transform",
        !reducedMotion && "transition-transform duration-150 ease-out",
        className
      )}
      style={
        reducedMotion ? undefined : { transform: `translate3d(0, ${offsetY}px, 0)` }
      }
    >
      {children}
    </div>
  );
}
