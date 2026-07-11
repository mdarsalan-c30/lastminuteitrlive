import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BANNED_PHRASES,
  ESTIMATE_CHIP,
  FILED,
  GATE,
  NOT_GOVERNMENT,
  RECONCILE,
  SELF_FILE_POSITIONING,
} from "../strings";

const COPY_DIR = join(__dirname, "..");

/** Lines that mention a banned phrase to *deny* it are fine. */
function isNegatedContext(line: string): boolean {
  return /\bno\b|\bnot\b|\bnever\b|\bwithout\b|banned/i.test(line);
}

describe("copy/strings — banned-words lint (doc 42 §1, §6)", () => {
  it("no copy module contains a banned promise", () => {
    const files = readdirSync(COPY_DIR).filter((f) => f.endsWith(".ts"));
    for (const file of files) {
      const lines = readFileSync(join(COPY_DIR, file), "utf8").split("\n");
      lines.forEach((line, i) => {
        if (isNegatedContext(line)) return;
        // The banned list itself defines the patterns; skip its own source.
        if (line.includes("BANNED_PHRASES") || line.trimStart().startsWith("/")) return;
        for (const pattern of BANNED_PHRASES) {
          expect(
            pattern.test(line),
            `${file}:${i + 1} contains banned phrase ${pattern}: "${line.trim()}"`
          ).toBe(false);
        }
      });
    }
  });

  it("keeps the honesty invariants intact", () => {
    expect(NOT_GOVERNMENT).toContain("not affiliated");
    expect(NOT_GOVERNMENT).toContain("incometax.gov.in");
    expect(SELF_FILE_POSITIONING).toContain("file it yourself");
    expect(ESTIMATE_CHIP).toContain("Estimate");
    expect(ESTIMATE_CHIP).toContain("FY 2025-26");
  });

  it("never scolds and never guarantees (voice spot-checks)", () => {
    // Blocked state never says no — it routes to an expert with confidence.
    expect(GATE.blockedTitle).toContain("expert");
    expect(GATE.blockedBody.toLowerCase()).not.toContain("sorry");
    // Mismatch copy reassures before asking.
    expect(RECONCILE.mismatchReassure).toContain("normal");
    // Verified copy is honest about whose timeline the refund is on.
    expect(FILED.verifiedDone).toContain("tax department's timeline");
    for (const pattern of BANNED_PHRASES) {
      expect(pattern.test(FILED.verifiedDone)).toBe(false);
    }
  });

  it("reconcile actions are the fixed three-button vocabulary", () => {
    expect(RECONCILE.actionAdd).toBe("Add it");
    expect(RECONCILE.actionKeep).toBe("Keep mine");
    expect(RECONCILE.actionDispute).toBe("This is wrong");
  });
});
