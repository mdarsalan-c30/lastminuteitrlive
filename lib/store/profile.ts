"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanId } from "@/lib/filing/types";
import { PROFILE_STORAGE_KEY } from "@/lib/store/sessionInit";

export interface UserProfile {
  name: string;
  email: string;
  panLast4: string;
  filingPlan: PlanId | "";
}

interface ProfileState extends UserProfile {
  setProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
  hasProfile: () => boolean;
}

const initialProfile: UserProfile = {
  name: "",
  email: "",
  panLast4: "",
  filingPlan: "",
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialProfile,
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),
      clearProfile: () => set(initialProfile),
      hasProfile: () => {
        const { name, email } = get();
        return Boolean(name.trim() || email.trim());
      },
    }),
    { name: PROFILE_STORAGE_KEY }
  )
);

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
