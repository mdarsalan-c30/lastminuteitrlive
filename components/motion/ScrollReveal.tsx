"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const STAGGER_MS = [0, 80, 160, 240, 320] as const;

type ScrollRevealDelay = 0 | 1 | 2 | 3 | 4;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: ScrollRevealDelay;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const isInViewport = () => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    };

    if (isInViewport()) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal",
        visible && "scroll-reveal-visible",
        className
      )}
      style={
        visible && !reducedMotion
          ? { transitionDelay: `${STAGGER_MS[delay]}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
