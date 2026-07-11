"use client";

import { useCallback, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { useDraftStore } from "@/lib/store/draft";
import { usePaymentSession } from "@/lib/hooks/usePaymentSession";
import {
  clearFilingWorkspace,
  getActiveProfileId,
  loadDraftFromProfile,
  restoreWorkspace,
  saveDraftToProfile,
} from "@/lib/family/client";
import { Button } from "@/components/filing/ui";

/** Refresh saved progress or clear everything and start over. */
export function FilingSessionControls({ compact = false }: { compact?: boolean }) {
  const { refresh: refreshPayment } = usePaymentSession();
  const resetDraft = useDraftStore((s) => s.reset);
  const [busy, setBusy] = useState<"refresh" | "clear" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setBusy("refresh");
    setMessage(null);
    try {
      const workspace = await restoreWorkspace();
      const profileId =
        getActiveProfileId() ?? workspace.activeProfileId ?? workspace.selfProfileId;
      if (profileId) {
        await loadDraftFromProfile(profileId);
      }
      await refreshPayment();
      const paid = workspace.activeProfileUnlocked || workspace.companionAccess;
      if (paid && workspace.activeUnlockedPlanId) {
        useDraftStore
          .getState()
          .setPaymentVerified(workspace.activeUnlockedPlanId as "normal" | "pro");
      }
      setMessage("Progress restored from your account.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not refresh");
    } finally {
      setBusy(null);
    }
  }, [refreshPayment]);

  const handleClearAll = useCallback(async () => {
    if (
      !window.confirm(
        "Clear all saved progress and payment unlock for this person? You can start fresh or switch to someone else."
      )
    ) {
      return;
    }
    setBusy("clear");
    setMessage(null);
    try {
      const profileId = getActiveProfileId();
      await clearFilingWorkspace(profileId ?? undefined);
      resetDraft();
      await refreshPayment();
      setMessage("Cleared. You can add a new person or start again.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not clear");
    } finally {
      setBusy(null);
    }
  }, [refreshPayment, resetDraft]);

  const handleSaveNow = useCallback(async () => {
    const profileId = getActiveProfileId();
    if (!profileId) {
      setMessage("Log in and pick who you are filing for first.");
      return;
    }
    setBusy("refresh");
    try {
      await saveDraftToProfile(profileId);
      setMessage("Saved to your account.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }, []);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`size-3.5 ${busy === "refresh" ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => void handleClearAll()}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" />
          Clear all
        </button>
        {message && <span className="text-xs text-slate-500">{message}</span>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
      <p className="text-xs font-semibold text-slate-700">Your filing session</p>
      <p className="text-xs text-slate-500">
        Refresh pulls your saved draft and payment status. Clear all starts over for the
        active person.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="text-sm py-2"
          onClick={() => void handleRefresh()}
          disabled={busy !== null}
        >
          <RefreshCw className={`mr-1.5 size-3.5 ${busy === "refresh" ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="secondary"
          className="text-sm py-2"
          onClick={() => void handleSaveNow()}
          disabled={busy !== null}
        >
          Save now
        </Button>
        <Button
          variant="secondary"
          className="text-sm py-2 text-red-700 border-red-200 hover:bg-red-50"
          onClick={() => void handleClearAll()}
          disabled={busy !== null}
        >
          <Trash2 className="mr-1.5 size-3.5" />
          Clear all
        </Button>
      </div>
      {message && <p className="text-xs text-slate-600">{message}</p>}
    </div>
  );
}
