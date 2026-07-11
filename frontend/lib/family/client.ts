"use client";

import { useDraftStore } from "@/lib/store/draft";

/** Which family member the in-browser draft currently belongs to. */
const ACTIVE_PROFILE_KEY = "lastminute-itr-active-family-profile";

export interface FamilyProfileSummary {
  id: string;
  name: string;
  relationship: string;
  pan: string | null;
  dob: string | null;
  filingStatus: "not_started" | "in_progress" | "filed";
  hasDraft: boolean;
  unlocked?: boolean;
  unlockedPlanId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilingWorkspace {
  selfProfileId: string;
  activeProfileId: string;
  profiles: FamilyProfileSummary[];
  limit: number;
  filingsRemaining: number;
  companionAccess: boolean;
  activeProfileUnlocked: boolean;
  activeUnlockedPlanId: string | null;
  paymentSession?: { verified: boolean; planId?: string } | null;
}

export function getActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  else localStorage.removeItem(ACTIVE_PROFILE_KEY);
}

export async function fetchFamilyProfiles(): Promise<{
  profiles: FamilyProfileSummary[];
  limit: number;
}> {
  const res = await fetch("/api/family/profiles");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not load family profiles");
  }
  return res.json();
}

export async function createFamilyProfile(input: {
  name: string;
  relationship: string;
  pan?: string;
  dob?: string;
}): Promise<FamilyProfileSummary> {
  const res = await fetch("/api/family/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Could not add family member");
  return body.profile;
}

export async function deleteFamilyProfile(id: string): Promise<void> {
  const res = await fetch(`/api/family/profiles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not remove profile");
  }
}

/** Snapshot the current in-browser draft and save it against a profile. */
export async function saveDraftToProfile(profileId: string): Promise<void> {
  const state = useDraftStore.getState();
  // Strip functions — keep only serializable draft data.
  const draft = JSON.parse(JSON.stringify(state));
  const filingStatus =
    state.filingOutcome?.status === "filed" || state.filingOutcome?.status === "verified"
      ? "filed"
      : undefined;
  const res = await fetch(`/api/family/profiles/${profileId}/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft, filingStatus }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not save progress");
  }
}

/** Load a profile's saved draft into the in-browser store (replaces it). */
export async function loadDraftFromProfile(profileId: string): Promise<boolean> {
  const res = await fetch(`/api/family/profiles/${profileId}/draft`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not load saved data");
  }
  const body = await res.json();
  if (body.draft && typeof body.draft === "object") {
    useDraftStore.setState(body.draft, false);
    setActiveProfileId(profileId);
    return true;
  }
  // No saved draft yet — start this member fresh.
  useDraftStore.getState().reset();
  setActiveProfileId(profileId);
  return false;
}

/**
 * Switch the workspace to another family member:
 * save the current member's progress first, then load the target's draft.
 */
export async function switchToProfile(targetProfileId: string): Promise<void> {
  const current = getActiveProfileId();
  if (current && current !== targetProfileId) {
    try {
      await saveDraftToProfile(current);
    } catch {
      // Saving the outgoing draft is best-effort; never block the switch.
    }
  }
  await loadDraftFromProfile(targetProfileId);
}

export async function restoreWorkspace(): Promise<FilingWorkspace> {
  const profileId = getActiveProfileId();
  const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : "";
  const res = await fetch(`/api/filings/workspace${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not load workspace");
  }
  const data = (await res.json()) as FilingWorkspace;
  if (!getActiveProfileId() && data.activeProfileId) {
    setActiveProfileId(data.activeProfileId);
  }
  return data;
}

export async function clearFilingWorkspace(profileId?: string): Promise<void> {
  const res = await fetch("/api/filings/clear-all", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, clearDraft: true }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Could not clear session");
  }
}

export async function useFilingCredit(profileId: string, planId: string): Promise<void> {
  const res = await fetch("/api/filings/use-credit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, planId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Could not use filing credit");
}
