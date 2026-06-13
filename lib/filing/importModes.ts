export type ImportStartMode = "form16" | "itd" | "manual";

export const IMPORT_START_MODES: Record<
  ImportStartMode,
  { title: string; description: string; small?: string }
> = {
  form16: {
    title: "Upload Form 16",
    description: "~5 min · PDF from employer",
  },
  itd: {
    title: "Import from ITD",
    description: "~3 min · ERI connect coming soon",
    small: "We'll notify you when live",
  },
  manual: {
    title: "Start with estimates",
    description: "~2 min · Rough salary & deductions",
    small: "No documents needed — refine later",
  },
};

export function getImportContinueHref(
  mode: ImportStartMode,
  options: { form16Connected: boolean; form16FastPath: boolean }
): string | null {
  if (mode === "form16") {
    if (options.form16FastPath) {
      return "/file/onboarding/eligibility?source=form16&step=additional-income";
    }
    return "/file/import/parsing";
  }
  if (mode === "manual") {
    return "/file/regime";
  }
  return null;
}
