import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type SessionLogEvent =
  | "session_start"
  | "draft_snapshot"
  | "compute_complete"
  | "companion_open"
  | "presubmit_green"
  | "page_leave";

export interface SessionLogEntry {
  id: string;
  sessionId: string;
  event: SessionLogEvent;
  timestamp: string;
  path?: string;
  draft?: Record<string, unknown>;
  computeResult?: Record<string, unknown> | null;
  meta?: Record<string, unknown>;
}

const memoryStore: SessionLogEntry[] = [];

function sessionLogFilePath(): string {
  return path.join(process.cwd(), "data", "session_logs.jsonl");
}

export async function appendSessionLog(
  entry: Omit<SessionLogEntry, "id" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  }
): Promise<SessionLogEntry> {
  const record: SessionLogEntry = {
    id: entry.id ?? randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    sessionId: entry.sessionId,
    event: entry.event,
    path: entry.path,
    draft: entry.draft,
    computeResult: entry.computeResult ?? null,
    meta: entry.meta,
  };

  const filePath = sessionLogFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf-8");
  memoryStore.push(record);
  return record;
}

export async function listSessionLogs(limit = 100): Promise<SessionLogEntry[]> {
  try {
    const raw = await fs.readFile(sessionLogFilePath(), "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as SessionLogEntry);
  } catch {
    return memoryStore.slice(-limit);
  }
}
