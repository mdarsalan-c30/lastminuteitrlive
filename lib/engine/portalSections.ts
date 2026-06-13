/**
 * Maps companion footprint screens to the section order of the ITD ITR-1 online
 * filing flow on incometax.gov.in. This lets the wizard show a roadmap that
 * mirrors the official tabs (Personal Information → Gross Total Income →
 * Total Deductions → Tax Paid → Total Tax Liability → Preview & Verify) and
 * lets other screens deep-link the wizard to a pre-selected section.
 *
 * Pure functions only — no React, no engine calls — so they are unit-testable.
 */
import type { PortalFootprintScreen } from "./types";

export type PortalSectionId =
  | "personal"
  | "income"
  | "deductions"
  | "taxes-paid"
  | "tax-liability"
  | "verify";

export interface PortalSection {
  id: PortalSectionId;
  /** Tab label as it reads on the ITD ITR-1 online flow. */
  label: string;
  /** Lower-case keywords matched against a screen's portal title/path. */
  keywords: string[];
}

/** Ordered to mirror the ITD ITR-1 online filing tabs. */
export const PORTAL_ITR1_SECTIONS: PortalSection[] = [
  {
    id: "personal",
    label: "Personal Information",
    keywords: ["personal", "profile", "contact", "bank", "nature of employment", "filing status"],
  },
  {
    id: "income",
    label: "Gross Total Income",
    keywords: ["gross total income", "salary", "house property", "other sources", "income"],
  },
  {
    id: "deductions",
    label: "Total Deductions",
    keywords: ["deduction", "chapter vi-a", "80c", "80d", "80g", "exemption"],
  },
  {
    id: "taxes-paid",
    label: "Tax Paid",
    keywords: ["tax paid", "tds", "tcs", "advance tax", "self-assessment", "26as", "prepaid"],
  },
  {
    id: "tax-liability",
    label: "Total Tax Liability",
    keywords: ["tax liability", "payable", "refund", "rebate", "cess", "computation"],
  },
  {
    id: "verify",
    label: "Preview & Verify",
    keywords: ["preview", "validate", "confirm", "verify", "submit", "declaration"],
  },
];

const SECTION_BY_ID: Record<PortalSectionId, PortalSection> = PORTAL_ITR1_SECTIONS.reduce(
  (acc, section) => {
    acc[section.id] = section;
    return acc;
  },
  {} as Record<PortalSectionId, PortalSection>
);

export function getPortalSection(id: PortalSectionId): PortalSection | undefined {
  return SECTION_BY_ID[id];
}

export function isPortalSectionId(value: string | null | undefined): value is PortalSectionId {
  return value != null && value in SECTION_BY_ID;
}

/**
 * Best-effort section for a footprint screen. Matches the screen's portal title
 * then path against each section's keywords, scoring by number of hits. Falls
 * back to "income" (the bulk of ITR-1 screens) when nothing matches.
 */
export function portalSectionForScreen(screen: PortalFootprintScreen): PortalSection {
  const haystack = `${screen.portalScreenTitle} ${screen.portalPath} ${screen.title}`.toLowerCase();

  let best: PortalSection | null = null;
  let bestScore = 0;

  for (const section of PORTAL_ITR1_SECTIONS) {
    const score = section.keywords.reduce(
      (sum, keyword) => (haystack.includes(keyword) ? sum + 1 : sum),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = section;
    }
  }

  return best ?? SECTION_BY_ID.income;
}

/**
 * The ordered, de-duplicated sections actually present in a set of screens,
 * with the index of the first screen for each section (for jump-to navigation).
 */
export interface PortalSectionRoadmapEntry {
  section: PortalSection;
  firstScreenIndex: number;
}

export function buildPortalSectionRoadmap(
  screens: PortalFootprintScreen[]
): PortalSectionRoadmapEntry[] {
  const firstIndexBySection = new Map<PortalSectionId, number>();

  screens.forEach((screen, index) => {
    const section = portalSectionForScreen(screen);
    if (!firstIndexBySection.has(section.id)) {
      firstIndexBySection.set(section.id, index);
    }
  });

  return PORTAL_ITR1_SECTIONS.filter((section) => firstIndexBySection.has(section.id)).map(
    (section) => ({
      section,
      firstScreenIndex: firstIndexBySection.get(section.id) as number,
    })
  );
}

/** First screen index belonging to a given section id, or -1 when absent. */
export function firstScreenIndexForSection(
  screens: PortalFootprintScreen[],
  sectionId: PortalSectionId
): number {
  for (let i = 0; i < screens.length; i += 1) {
    if (portalSectionForScreen(screens[i]).id === sectionId) return i;
  }
  return -1;
}
