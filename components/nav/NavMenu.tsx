"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavMenuItem {
  href: string;
  label: string;
}

/**
 * Shared calm dropdown (Mercury-style quiet chevron) used by both the marketing
 * SiteHeader and the filing FilingLayout so navigation feels like one system.
 */
export function NavMenu({
  label,
  items,
  triggerClassName,
}: {
  label: string;
  items: readonly NavMenuItem[];
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-0.5",
          triggerClassName,
          open && "bg-muted/60 text-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
      >
        {label}
        <ChevronDown
          className={cn(
            "size-3.5 opacity-60 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div id={menuId} role="menu" className="nav-menu-panel">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="nav-menu-item"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
