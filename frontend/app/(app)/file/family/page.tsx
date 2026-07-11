"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Banner, Button, Card, ScreenTitle } from "@/components/filing/ui";
import {
  createFamilyProfile,
  deleteFamilyProfile,
  fetchFamilyProfiles,
  getActiveProfileId,
  saveDraftToProfile,
  switchToProfile,
  type FamilyProfileSummary,
  restoreWorkspace,
  setActiveProfileId,
} from "@/lib/family/client";
import { FilingSessionControls } from "@/components/filing/FilingSessionControls";
import { Plus, Users, Trash2, ArrowRight, Check, Loader2 } from "lucide-react";
import { useDraftStore } from "@/lib/store/draft";
import type { PlanId } from "@/lib/payments/plans";

const RELATIONSHIP_OPTIONS = [
  { id: "self", label: "Myself" },
  { id: "client", label: "Client / someone else" },
  { id: "spouse", label: "Spouse" },
  { id: "father", label: "Father" },
  { id: "mother", label: "Mother" },
  { id: "son", label: "Son" },
  { id: "daughter", label: "Daughter" },
  { id: "sibling", label: "Brother / Sister" },
  { id: "other", label: "Other family" },
];

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  not_started: { text: "Not started", className: "bg-slate-100 text-slate-600" },
  in_progress: { text: "In progress", className: "bg-amber-50 text-amber-700" },
  filed: { text: "Filed", className: "bg-emerald-50 text-emerald-700" },
};

function relationshipLabel(id: string): string {
  return RELATIONSHIP_OPTIONS.find((r) => r.id === id)?.label ?? "Family";
}

function maskPan(pan: string | null): string {
  if (!pan) return "PAN not added";
  return `${pan.slice(0, 3)}•••${pan.slice(-2)}`;
}

export default function FamilyPortalPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<FamilyProfileSummary[] | null>(null);
  const [limit, setLimit] = useState(50);
  const [filingsRemaining, setFilingsRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: "self", pan: "", dob: "" });
  const [adding, setAdding] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchFamilyProfiles();
      setProfiles(data.profiles);
      setLimit(data.limit);
      setActiveId(getActiveProfileId());
      try {
        const ws = await restoreWorkspace();
        setFilingsRemaining(ws.filingsRemaining);
      } catch {
        setFilingsRemaining(0);
      }
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not load profiles";
      if (/log in/i.test(message)) setNeedsLogin(true);
      else setError(message);
      setProfiles([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await createFamilyProfile({
        name: form.name,
        relationship: form.relationship,
        pan: form.pan || undefined,
        dob: form.dob || undefined,
      });
      setForm({ name: "", relationship: "self", pan: "", dob: "" });
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add family member");
    } finally {
      setAdding(false);
    }
  };

  const handleSwitch = async (profile: FamilyProfileSummary) => {
    setBusyId(profile.id);
    setError(null);
    try {
      await switchToProfile(profile.id);
      setActiveProfileId(profile.id);
      setActiveId(profile.id);
      const ws = await restoreWorkspace();
      if (ws.activeProfileUnlocked && ws.activeUnlockedPlanId) {
        useDraftStore
          .getState()
          .setPaymentVerified(ws.activeUnlockedPlanId as PlanId);
      } else {
        useDraftStore.setState({ paidPlanId: null, paymentVerifiedAt: null });
      }
      router.push(profile.hasDraft || profile.unlocked ? "/file/review" : "/file/start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not switch profile");
      setBusyId(null);
    }
  };

  const handleSaveCurrent = async () => {
    if (!activeId) return;
    setBusyId(activeId);
    try {
      await saveDraftToProfile(activeId);
      setSavedNote("Progress saved to this member's profile.");
      setTimeout(() => setSavedNote(null), 4000);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (profile: FamilyProfileSummary) => {
    if (
      !window.confirm(
        `Remove ${profile.name}'s profile? Their saved draft will be deleted too.`
      )
    ) {
      return;
    }
    setBusyId(profile.id);
    try {
      await deleteFamilyProfile(profile.id);
      if (activeId === profile.id) {
        setActiveProfileId(null);
        setActiveId(null);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove profile");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <FilingLayout mirrorText="One login, many people. Add each individual once — switch between them and file one by one.">
      <ScreenTitle
        title="People I file for"
        subtitle={`Your account can handle up to ${limit} individuals. Each person has their own saved draft and payment unlock.`}
      />

      <div className="mb-4">
        <FilingSessionControls />
      </div>

      {filingsRemaining > 0 && (
        <Banner variant="info">
          You have <strong>{filingsRemaining}</strong> filing credit
          {filingsRemaining === 1 ? "" : "s"} in your wallet. Use one per person at checkout.
        </Banner>
      )}

      {needsLogin && (
        <Banner variant="info">
          Please{" "}
          <a href="/auth/login" className="font-semibold underline">
            log in
          </a>{" "}
          to manage family profiles. Your filing data will be saved to your
          account so you can come back anytime.
        </Banner>
      )}

      {error && <Banner variant="warning">{error}</Banner>}
      {savedNote && <Banner variant="info">{savedNote}</Banner>}

      {activeId && profiles?.some((p) => p.id === activeId) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3">
          <p className="text-sm text-blue-900">
            You&apos;re currently working on{" "}
            <strong>{profiles.find((p) => p.id === activeId)?.name}</strong>
            &apos;s return.
          </p>
          <Button
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={handleSaveCurrent}
            disabled={busyId === activeId}
          >
            {busyId === activeId ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Save progress now
          </Button>
        </div>
      )}

      {profiles === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((profile) => {
            const status = STATUS_LABELS[profile.filingStatus] ?? STATUS_LABELS.not_started;
            const isActive = profile.id === activeId;
            return (
              <Card
                key={profile.id}
                className={isActive ? "border-2 border-[#0e5f63]" : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {profile.name}
                      {isActive && (
                        <span className="ml-2 rounded-full bg-[#0e5f63]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#0e5f63]">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {relationshipLabel(profile.relationship)} · {maskPan(profile.pan)}
                      {profile.unlocked && (
                        <span className="ml-1 text-emerald-700">· Guide unlocked</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                  >
                    {status.text}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {profile.hasDraft
                    ? `Last saved ${new Date(profile.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                    : "No saved data yet"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    className="gap-1.5 text-xs px-3 py-1.5"
                    onClick={() => handleSwitch(profile)}
                    disabled={busyId === profile.id}
                  >
                    {busyId === profile.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="size-3.5" />
                    )}
                    {profile.hasDraft ? "Continue filing" : "Start filing"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-xs px-2"
                    onClick={() => handleDelete(profile)}
                    disabled={busyId === profile.id}
                    aria-label={`Remove ${profile.name}`}
                  >
                    <Trash2 className="size-3.5 text-slate-400" />
                  </Button>
                </div>
              </Card>
            );
          })}

          {!needsLogin && profiles.length < limit && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-[#0e5f63] hover:text-[#0e5f63]"
            >
              <Plus className="size-6" />
              <span className="text-sm font-medium">Add a family member</span>
              <span className="text-xs text-slate-400">
                {profiles.length} of {limit} used
              </span>
            </button>
          )}
        </div>
      )}

      {showAdd && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-4 text-[#0e5f63]" />
            <h3 className="font-semibold text-slate-900">Add a family member</h3>
          </div>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-600">
              Full name (as on PAN)
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. Sunita Sharma"
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Relationship
              <select
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              PAN (optional — add anytime)
              <input
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Date of birth (optional)
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add member
              </button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Each family member files their own return on incometax.gov.in with their
        own PAN login — we prepare everything for each person here, and you copy
        it across. Data stays private to your account.
      </p>
    </FilingLayout>
  );
}
