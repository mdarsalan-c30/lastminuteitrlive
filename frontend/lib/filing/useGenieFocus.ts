"use client";

import { useCallback, useRef } from "react";
import { useDraftStore } from "@/lib/store/draft";

/** Wire input focus → Genie field guidance (FloatingGenie + ActiveAiCompanion). */
export function useGenieFocus(fieldId: string) {
  const setActiveField = useDraftStore((s) => s.setActiveField);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFocus = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    setActiveField(fieldId);
  }, [fieldId, setActiveField]);

  const onBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setActiveField(null), 4000);
  }, [setActiveField]);

  return { onFocus, onBlur };
}
