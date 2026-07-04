"use client";

import { useEffect, useRef } from "react";
import { useDraftStore } from "@/lib/store/draft";
import { useProfileStore } from "@/lib/store/profile";
import { ensureFreshBrowserSession } from "@/lib/store/sessionInit";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";

const DEBOUNCE_MS = 5000;

export function SessionBootstrap({ session }: { session: { name: string; email: string } | null }) {
  const resetDraft = useDraftStore((s) => s.reset);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const draft = useDraftStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const isFresh = ensureFreshBrowserSession();
    if (isFresh) {
      resetDraft();
    }

    if (session) {
      useProfileStore.getState().setProfile({
        name: session.name,
        email: session.email,
      });
    } else {
      clearProfile();
    }

    if (!startedRef.current) {
      startedRef.current = true;
      void logSessionEvent("session_start", {
        draft: draftSnapshotForLog(useDraftStore.getState()),
        meta: { freshSession: isFresh },
      });
    }

    const onPageLeave = () => {
      void logSessionEvent("page_leave", {
        draft: draftSnapshotForLog(useDraftStore.getState()),
      });
    };

    window.addEventListener("pagehide", onPageLeave);
    return () => window.removeEventListener("pagehide", onPageLeave);
  }, [resetDraft, clearProfile]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void logSessionEvent("draft_snapshot", {
        draft: draftSnapshotForLog(useDraftStore.getState()),
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    draft.name,
    draft.income,
    draft.deductions,
    draft.houseProperty,
    draft.regime,
    draft.recommendedForm,
    draft.enginePhase,
  ]);

  return null;
}
