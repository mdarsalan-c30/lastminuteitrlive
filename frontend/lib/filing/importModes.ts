export type ImportStartMode = "form16" | "capital_gains" | "manual";

export const IMPORT_START_MODES: Record<
  ImportStartMode,
  { title: string; description: string; small?: string }
> = {
  form16: {
    title: "Upload Form 16",
    description: "~5 min · PDF from employer",
  },
  capital_gains: {
    title: "Capital Gains / F & O",
    description: "~5 min · Upload CAMS or enter estimates",
    small: "Auto calculation coming soon",
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
      return "/file/start?source=form16&step=additional-income";
    }
    // Once Form 16 is in, the next state is RECONCILE — never loop back
    // to the documents screen.
    return options.form16Connected
      ? "/file/import/mismatch"
      : "/file/import/documents";
  }
  if (mode === "manual") {
    return "/file/regime";
  }
  if (mode === "capital_gains") {
    return "/file/review";
  }
  return null;
}
