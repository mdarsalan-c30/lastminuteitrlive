"use client";

import { useEffect, useRef } from "react";
import { useDraftStore } from "@/lib/store/draft";
import { useProfileStore } from "@/lib/store/profile";
import { ensureFreshBrowserSession } from "@/lib/store/sessionInit";
import { draftSnapshotForLog, logSessionEvent } from "@/lib/sessionLogClient";
import {
  getActiveProfileId,
  loadDraftFromProfile,
  restoreWorkspace,
  saveDraftToProfile,
  setActiveProfileId,
} from "@/lib/family/client";
import type { PlanId } from "@/lib/payments/plans";

const DEBOUNCE_MS = 5000;
const AUTOSAVE_MS = 8000;

export function SessionBootstrap({ session }: { session: { name: string; email: string } | null }) {
  const resetDraft = useDraftStore((s) => s.reset);
  const setPaymentVerified = useDraftStore((s) => s.setPaymentVerified);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const draft = useDraftStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    const isFresh = ensureFreshBrowserSession(Boolean(session));
    if (isFresh && !session) {
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
        meta: { freshSession: isFresh, loggedIn: Boolean(session) },
      });
    }

    const onPageLeave = () => {
      void logSessionEvent("page_leave", {
        draft: draftSnapshotForLog(useDraftStore.getState()),
      });
      const profileId = getActiveProfileId();
      if (session && profileId) {
        void saveDraftToProfile(profileId);
      }
    };

    window.addEventListener("pagehide", onPageLeave);
    return () => window.removeEventListener("pagehide", onPageLeave);
  }, [resetDraft, clearProfile, session]);

  useEffect(() => {
    if (!session || restoredRef.current) return;
    restoredRef.current = true;

    void (async () => {
      try {
        const workspace = await restoreWorkspace();
        const profileId =
          getActiveProfileId() ?? workspace.activeProfileId ?? workspace.selfProfileId;
        if (profileId) {
          setActiveProfileId(profileId);
          await loadDraftFromProfile(profileId);
        }
        if (workspace.activeProfileUnlocked && workspace.activeUnlockedPlanId) {
          setPaymentVerified(workspace.activeUnlockedPlanId as PlanId);
        } else if (workspace.companionAccess && workspace.paymentSession?.planId) {
          setPaymentVerified(workspace.paymentSession.planId as PlanId);
        }
      } catch {
        // Guest or first visit — continue with local draft
      }
    })();
  }, [session, setPaymentVerified]);

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

  useEffect(() => {
    if (!session) return;
    const profileId = getActiveProfileId();
    if (!profileId) return;

    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      void saveDraftToProfile(profileId);
    }, AUTOSAVE_MS);

    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [
    session,
    draft.name,
    draft.income,
    draft.deductions,
    draft.houseProperty,
    draft.regime,
    draft.recommendedForm,
    draft.enginePhase,
    draft.paidPlanId,
  ]);

  return null;
}
