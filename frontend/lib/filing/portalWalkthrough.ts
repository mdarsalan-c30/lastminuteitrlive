/**
 * Few-page portal filing walkthrough (Option B).
 * ITR-1 is screenshot-complete; ITR-2/3/4 are text shells until intern Word packs land.
 */

import type { ITRResult, PortalForm, UserInput } from "@/lib/engine/types";
import { resolveEngineValue } from "@/lib/engine/mergeValues";
import itr1Walkthrough from "@/data/portalWalkthrough/itr1.json";
import itr2Walkthrough from "@/data/portalWalkthrough/itr2.json";
import itr3Walkthrough from "@/data/portalWalkthrough/itr3.json";
import itr4Walkthrough from "@/data/portalWalkthrough/itr4.json";

export type WalkthroughStepAction =
  | "click"
  | "verify"
  | "skip"
  | "enter"
  | "note";

export interface WalkthroughStep {
  id: string;
  title: string;
  clickPath: string;
  plainEnglish: string;
  hindiShort?: string;
  action: WalkthroughStepAction;
  image?: string;
  ourValueKey?: string;
  tip?: string;
  warning?: string;
}

export interface WalkthroughChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  heroImage?: string;
  portalPath: string;
  tips?: string[];
  warnings?: string[];
  steps: WalkthroughStep[];
}

export interface PortalWalkthrough {
  schemaVersion: string;
  form: PortalForm;
  assessmentYear: string;
  portalUrl: string;
  hasScreenshots: boolean;
  chapters: WalkthroughChapter[];
}

const BY_FORM: Record<PortalForm, PortalWalkthrough> = {
  "ITR-1": itr1Walkthrough as PortalWalkthrough,
  "ITR-2": itr2Walkthrough as PortalWalkthrough,
  "ITR-3": itr3Walkthrough as PortalWalkthrough,
  "ITR-4": itr4Walkthrough as PortalWalkthrough,
};

export const ITD_PORTAL_URL =
  "https://www.incometax.gov.in/iec/foportal/";

export function getPortalWalkthrough(form: PortalForm): PortalWalkthrough {
  return BY_FORM[form] ?? BY_FORM["ITR-1"];
}

export function walkthroughImageUrl(
  form: PortalForm,
  image?: string
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("/")) return image;
  const dir =
    form === "ITR-1"
      ? "itr1"
      : form === "ITR-2"
        ? "itr2"
        : form === "ITR-3"
          ? "itr3"
          : "itr4";
  return `/portal/${dir}/${image}`;
}

export function resolveWalkthroughValue(
  ourValueKey: string | undefined,
  result: ITRResult | null | undefined,
  userInput?: UserInput
): string | number | null {
  if (!ourValueKey || !result) return null;
  return resolveEngineValue(result, userInput, ourValueKey);
}
