import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  companionStepCountForForm,
  PORTAL_STEP_COUNTS,
} from "../portalStepCounts";

const CLIENT_ROOTS = ["app", "components", "lib/hooks"];

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      collectSourceFiles(full, acc);
      continue;
    }
    if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith(".server.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

describe("portalStepCounts", () => {
  it("matches generated portal_steps.json lengths", () => {
    const steps = JSON.parse(
      readFileSync(join(process.cwd(), "data/portal_steps.json"), "utf8")
    ) as Record<string, unknown[]>;

    for (const [form, count] of Object.entries(PORTAL_STEP_COUNTS)) {
      expect(steps[form]?.length).toBe(count);
    }
  });

  it("returns default for unknown forms", () => {
    expect(companionStepCountForForm("ITR-9")).toBe(47);
  });

  it("client bundle sources do not import portal_steps.json", () => {
    const offenders: string[] = [];
    for (const root of CLIENT_ROOTS) {
      const base = join(process.cwd(), root);
      for (const file of collectSourceFiles(base)) {
        if (file.includes("portalStepsData.server.ts")) continue;
        const text = readFileSync(file, "utf8");
        if (text.includes('portal_steps.json')) {
          offenders.push(file.replace(`${process.cwd()}/`, ""));
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
