"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const ctx = useContext(SheetContext);
  if (!ctx) {
    throw new Error("Sheet components must be used within Sheet");
  }
  return ctx;
}

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
}) {
  const { open, setOpen } = useSheetContext();

  return (
    <button
      type="button"
      {...props}
      className={className}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
    >
      {children}
    </button>
  );
}

export function SheetCloseLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { setOpen } = useSheetContext();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  );
}

export function SheetContent({
  children,
  className,
  side = "right",
}: {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const { open, setOpen } = useSheetContext();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const shouldRender = open || mounted;
  const panelShown = open || visible;

  useEffect(() => {
    if (open) {
      setMounted(true);
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) {
        setVisible(true);
        return;
      }
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [shouldRender, setOpen]);

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] isolate">
      <button
        type="button"
        className={cn(
          "sheet-backdrop absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out",
          panelShown ? "opacity-100" : "opacity-0"
        )}
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "sheet-panel absolute top-0 flex h-full w-[min(100%,20rem)] flex-col border-border bg-background shadow-xl transition-transform duration-200 ease-out",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          side === "right"
            ? panelShown
              ? "translate-x-0"
              : "translate-x-full"
            : panelShown
              ? "translate-x-0"
              : "-translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-end border-b border-border/60 p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
