/**
 * filings.ts
 * ==========
 * Append-only filing storage: save, resume, and audit computed ITRs.
 *
 * Ports the design of backend/engine's persistence.py to Postgres/Prisma
 * (the Python module's raw-sqlite-file approach can't run on Vercel's
 * ephemeral serverless filesystem):
 *
 * 1. APPEND-ONLY. A filing row is never updated or deleted. Corrections are
 *    new rows linked via parentId (a revision chain), mirroring how the ITD
 *    itself treats returns (original -> revised).
 * 2. REPRODUCIBILITY. Every row stores the full input JSON, the full result
 *    JSON, the rulesetId used, and an engineVersion string.
 * 3. INTEGRITY. Each row carries sha256 hashes of its input and result
 *    payloads, computed over canonical JSON (sorted keys). verifyIntegrity
 *    re-hashes and compares, so silent DB edits/corruption are detectable.
 * 4. Lifecycle status is never stored mutably — it's derived from the latest
 *    "status:*" FilingAuditEvent for a filing (append-only, same as the
 *    Python design).
 *
 * KNOWN LIMITATION (inherited from persistence.py's own docstring): no
 * application-level PII encryption at rest for PAN/names in inputJson —
 * add field-level encryption before this stores real taxpayer identities
 * outside of what Postgres-at-rest encryption already covers.
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/db/store";

export const FILING_STATUSES = [
  "computed",
  "reviewed",
  "filed_on_portal",
  "superseded",
] as const;
export type FilingStatus = (typeof FILING_STATUSES)[number];

export interface FilingSummary {
  id: string;
  parentId: string | null;
  assessmentYear: string;
  status: FilingStatus;
  rulesetId: string;
  engineVersion: string;
  notes: string | null;
  createdAt: string;
}

export interface FilingRecord extends FilingSummary {
  userId: string;
  familyProfileId: string | null;
  userInput: unknown;
  result: unknown;
  inputSha256: string;
  resultSha256: string;
}

/** Canonical JSON: recursively sorted keys, no whitespace variance — stable hashes. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf-8").digest("hex");
}

async function currentStatus(filingId: string): Promise<FilingStatus> {
  const latest = await prisma.filingAuditEvent.findFirst({
    where: { filingId, event: { startsWith: "status:" } },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return "computed";
  return latest.event.split(":", 2)[1] as FilingStatus;
}

async function requireFiling(filingId: string, userId: string) {
  const row = await prisma.filing.findFirst({ where: { id: filingId, userId } });
  if (!row) throw new NotFoundError(`filing ${filingId} not found`);
  return row;
}

export class NotFoundError extends Error {}

// ── Write path ──────────────────────────────────────────────────────────

export async function saveFiling(params: {
  userId: string;
  familyProfileId?: string | null;
  assessmentYear: string;
  userInput: unknown;
  result: unknown;
  rulesetId: string;
  engineVersion: string;
  parentId?: string | null;
  notes?: string | null;
}): Promise<string> {
  const {
    userId,
    familyProfileId = null,
    assessmentYear,
    userInput,
    result,
    rulesetId,
    engineVersion,
    parentId = null,
    notes = null,
  } = params;

  const inputJsonText = canonicalJson(userInput);
  const resultJsonText = canonicalJson(result);

  if (parentId) {
    const parent = await prisma.filing.findFirst({
      where: { id: parentId, userId },
      select: { id: true },
    });
    if (!parent) throw new NotFoundError(`parentId ${parentId} does not exist`);
  }

  const filing = await prisma.$transaction(async (tx) => {
    const created = await tx.filing.create({
      data: {
        parentId,
        userId,
        familyProfileId,
        assessmentYear,
        inputJson: userInput as object,
        resultJson: result as object,
        inputSha256: sha256(inputJsonText),
        resultSha256: sha256(resultJsonText),
        rulesetId,
        engineVersion,
        notes,
      },
    });
    await tx.filingAuditEvent.create({
      data: {
        filingId: created.id,
        event: "created",
        detail: `ruleset=${rulesetId} engine=${engineVersion}`,
      },
    });
    if (parentId) {
      await tx.filingAuditEvent.create({
        data: {
          filingId: parentId,
          event: "status:superseded",
          detail: `superseded by ${created.id}`,
        },
      });
    }
    return created;
  });

  return filing.id;
}

/** Record a lifecycle transition as an audit event (append-only — never mutates the row). */
export async function setStatus(
  filingId: string,
  userId: string,
  status: FilingStatus,
  detail?: string | null
): Promise<void> {
  if (!FILING_STATUSES.includes(status)) {
    throw new Error(`status must be one of ${FILING_STATUSES.join(", ")}`);
  }
  await requireFiling(filingId, userId);
  await prisma.filingAuditEvent.create({
    data: { filingId, event: `status:${status}`, detail: detail ?? null },
  });
}

// ── Read path ───────────────────────────────────────────────────────────

export async function getFiling(filingId: string, userId: string): Promise<FilingRecord> {
  const row = await requireFiling(filingId, userId);
  const status = await currentStatus(filingId);
  return {
    id: row.id,
    parentId: row.parentId,
    userId: row.userId,
    familyProfileId: row.familyProfileId,
    assessmentYear: row.assessmentYear,
    status,
    rulesetId: row.rulesetId,
    engineVersion: row.engineVersion,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    userInput: row.inputJson,
    result: row.resultJson,
    inputSha256: row.inputSha256,
    resultSha256: row.resultSha256,
  };
}

/** Newest-first summaries (no payloads) for a user. */
export async function listFilings(
  userId: string,
  assessmentYear?: string,
  limit = 50
): Promise<FilingSummary[]> {
  const rows = await prisma.filing.findMany({
    where: { userId, ...(assessmentYear ? { assessmentYear } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      parentId: row.parentId,
      assessmentYear: row.assessmentYear,
      status: await currentStatus(row.id),
      rulesetId: row.rulesetId,
      engineVersion: row.engineVersion,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
    }))
  );
}

/** Walk parent/child links, returns the full chain original -> latest. */
export async function getRevisionChain(
  filingId: string,
  userId: string
): Promise<FilingRecord[]> {
  await requireFiling(filingId, userId);

  const ids = new Set<string>([filingId]);

  // Walk backwards to the original.
  let cur: string | null = filingId;
  while (cur) {
    const row: { parentId: string | null } | null = await prisma.filing.findFirst({
      where: { id: cur, userId },
      select: { parentId: true },
    });
    cur = row?.parentId ?? null;
    if (cur) ids.add(cur);
  }

  // Walk forwards from every known node to pick up any children.
  let frontier = Array.from(ids);
  while (frontier.length > 0) {
    const kids = await prisma.filing.findMany({
      where: { parentId: { in: frontier }, userId },
      select: { id: true },
    });
    const fresh = kids.map((k) => k.id).filter((id) => !ids.has(id));
    fresh.forEach((id) => ids.add(id));
    frontier = fresh;
  }

  const rows = await prisma.filing.findMany({
    where: { id: { in: Array.from(ids) }, userId },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      parentId: row.parentId,
      userId: row.userId,
      familyProfileId: row.familyProfileId,
      assessmentYear: row.assessmentYear,
      status: await currentStatus(row.id),
      rulesetId: row.rulesetId,
      engineVersion: row.engineVersion,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      userInput: row.inputJson,
      result: row.resultJson,
      inputSha256: row.inputSha256,
      resultSha256: row.resultSha256,
    }))
  );
}

export async function getAuditTrail(
  filingId: string,
  userId: string
): Promise<{ event: string; detail: string | null; createdAt: string }[]> {
  await requireFiling(filingId, userId);
  const rows = await prisma.filingAuditEvent.findMany({
    where: { filingId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    event: r.event,
    detail: r.detail,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ── Integrity ───────────────────────────────────────────────────────────

/** Re-hash stored payloads against recorded digests. */
export async function verifyIntegrity(
  filingId: string,
  userId: string
): Promise<{ ok: boolean; detail: string }> {
  const row = await requireFiling(filingId, userId);
  const problems: string[] = [];
  if (sha256(canonicalJson(row.inputJson)) !== row.inputSha256) {
    problems.push("input payload hash mismatch");
  }
  if (sha256(canonicalJson(row.resultJson)) !== row.resultSha256) {
    problems.push("result payload hash mismatch");
  }
  if (problems.length > 0) return { ok: false, detail: problems.join("; ") };
  return { ok: true, detail: "ok" };
}
