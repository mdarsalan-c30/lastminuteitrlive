"""
persistence.py
==============
Filing storage for the ITR engine: save, resume, and audit computations.

Design principles
-----------------
1. APPEND-ONLY. A filing row is never updated or deleted. Corrections are
   new rows linked via `parent_id` (a revision chain), mirroring how the
   ITD itself treats returns (original → revised). This is what makes the
   store an audit trail rather than just a cache.
2. REPRODUCIBILITY. Every row stores the full input JSON, the full result
   JSON, the `ruleset_id` used, and an `engine_version` string. Given a
   row, you can re-run the engine and diff — which is also how you detect
   whether an engine upgrade changed a past filing's numbers.
3. INTEGRITY. Each row carries sha256 hashes of its input and result
   payloads, computed over canonical JSON (sorted keys). `verify_integrity`
   re-hashes and compares, so silent DB corruption or manual edits are
   detectable.
4. ZERO DEPENDENCIES. stdlib sqlite3 in WAL mode — safe for the current
   FastAPI single-node deployment, thousands of filings/day is trivial
   load. The SQL is deliberately vanilla; migrating to Postgres later is a
   connection-string change plus swapping `?` placeholders for `%s`.

What this deliberately does NOT do
----------------------------------
- No PII encryption at rest (PAN, names). Add application-level encryption
  or SQLCipher before storing real taxpayer identities.
- No multi-node concurrency guarantees beyond SQLite WAL. Move to Postgres
  when the API layer scales past one node.

Usage
-----
    from persistence import FilingStore
    from dataclasses import asdict

    store = FilingStore("filings.db")
    fid = store.save_filing(
        user_ref="user_123",
        assessment_year=result.assessment_year,
        user_input=asdict(user),          # or the raw request dict
        result=asdict(result),
        ruleset_id="AY2026-27.r2",
        engine_version="engine@<git-sha>",
    )
    row = store.get_filing(fid)           # resume / display
    chain = store.get_revision_chain(fid) # original → latest revision
    ok, detail = store.verify_integrity(fid)
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

_SCHEMA = """
CREATE TABLE IF NOT EXISTS filings (
    id              TEXT PRIMARY KEY,
    parent_id       TEXT REFERENCES filings(id),
    user_ref        TEXT NOT NULL,
    assessment_year TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'computed',
    input_json      TEXT NOT NULL,
    result_json     TEXT NOT NULL,
    input_sha256    TEXT NOT NULL,
    result_sha256   TEXT NOT NULL,
    ruleset_id      TEXT NOT NULL,
    engine_version  TEXT NOT NULL,
    notes           TEXT,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_filings_user
    ON filings(user_ref, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_filings_ay
    ON filings(user_ref, assessment_year);
CREATE INDEX IF NOT EXISTS idx_filings_parent
    ON filings(parent_id);

CREATE TABLE IF NOT EXISTS audit_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    filing_id  TEXT NOT NULL REFERENCES filings(id),
    event      TEXT NOT NULL,
    detail     TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_filing
    ON audit_events(filing_id, created_at);
"""

# Filing lifecycle. Status changes are recorded as NEW audit events, never
# by mutating the filing row (the latest 'status:*' event wins).
VALID_STATUSES = ("computed", "reviewed", "filed_on_portal", "superseded")


def _canonical(payload: dict) -> str:
    """Canonical JSON: sorted keys, no whitespace variance — stable hashes."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=False, default=str)


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class FilingStore:
    def __init__(self, db_path: str = "filings.db") -> None:
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode=WAL;")
        self._conn.execute("PRAGMA foreign_keys=ON;")
        self._conn.executescript(_SCHEMA)
        self._conn.commit()

    # ── Write path ────────────────────────────────────────────────────

    def save_filing(
        self,
        user_ref: str,
        assessment_year: str,
        user_input: dict,
        result: dict,
        ruleset_id: str,
        engine_version: str,
        parent_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> str:
        """
        Persist one computation. Returns the new filing id.
        Pass `parent_id` to record a revision of an earlier filing; the
        parent is audit-marked 'superseded' (its row is untouched).
        """
        input_json = _canonical(user_input)
        result_json = _canonical(result)
        fid = uuid.uuid4().hex
        now = _now()

        with self._conn:  # one transaction
            if parent_id is not None:
                if self._conn.execute(
                    "SELECT 1 FROM filings WHERE id=?", (parent_id,)
                ).fetchone() is None:
                    raise ValueError(f"parent_id {parent_id!r} does not exist")

            self._conn.execute(
                """INSERT INTO filings
                   (id, parent_id, user_ref, assessment_year, status,
                    input_json, result_json, input_sha256, result_sha256,
                    ruleset_id, engine_version, notes, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (fid, parent_id, user_ref, assessment_year, "computed",
                 input_json, result_json, _sha256(input_json),
                 _sha256(result_json), ruleset_id, engine_version,
                 notes, now),
            )
            self._audit(fid, "created",
                        f"ruleset={ruleset_id} engine={engine_version}")
            if parent_id is not None:
                self._audit(parent_id, "status:superseded",
                            f"superseded by {fid}")
        return fid

    def set_status(self, filing_id: str, status: str,
                   detail: Optional[str] = None) -> None:
        """Record a lifecycle transition as an audit event (append-only)."""
        if status not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        self._require(filing_id)
        with self._conn:
            self._audit(filing_id, f"status:{status}", detail)

    # ── Read path ─────────────────────────────────────────────────────

    def get_filing(self, filing_id: str) -> dict:
        """Full filing row with parsed input/result and current status."""
        row = self._require(filing_id)
        out = dict(row)
        out["user_input"] = json.loads(out.pop("input_json"))
        out["result"] = json.loads(out.pop("result_json"))
        out["status"] = self._current_status(filing_id, row["status"])
        return out

    def list_filings(self, user_ref: str,
                     assessment_year: Optional[str] = None,
                     limit: int = 50) -> list[dict]:
        """Newest-first summaries (no payloads) for a user."""
        q = ("SELECT id, parent_id, assessment_year, status, ruleset_id, "
             "engine_version, notes, created_at FROM filings WHERE user_ref=?")
        args: list[Any] = [user_ref]
        if assessment_year:
            q += " AND assessment_year=?"
            args.append(assessment_year)
        q += " ORDER BY created_at DESC LIMIT ?"
        args.append(limit)
        rows = self._conn.execute(q, args).fetchall()
        return [
            {**dict(r), "status": self._current_status(r["id"], r["status"])}
            for r in rows
        ]

    def get_revision_chain(self, filing_id: str) -> list[dict]:
        """Walk parent links to the original, return original → latest."""
        self._require(filing_id)
        chain: list[str] = []
        cur: Optional[str] = filing_id
        while cur is not None:
            chain.append(cur)
            row = self._conn.execute(
                "SELECT parent_id FROM filings WHERE id=?", (cur,)
            ).fetchone()
            cur = row["parent_id"] if row else None
        # extend forward to any children of the requested filing
        frontier = [filing_id]
        while frontier:
            kids = self._conn.execute(
                "SELECT id FROM filings WHERE parent_id=? ORDER BY created_at",
                (frontier.pop(),),
            ).fetchall()
            for k in kids:
                chain.insert(0, k["id"])
                frontier.append(k["id"])
        ordered = list(reversed(chain)) if len(chain) > 1 else chain
        # de-dup preserving order (defensive)
        seen: set[str] = set()
        ordered = [c for c in ordered if not (c in seen or seen.add(c))]
        return [self.get_filing(c) for c in ordered]

    def get_audit_trail(self, filing_id: str) -> list[dict]:
        self._require(filing_id)
        rows = self._conn.execute(
            "SELECT event, detail, created_at FROM audit_events "
            "WHERE filing_id=? ORDER BY id",
            (filing_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    # ── Integrity ─────────────────────────────────────────────────────

    def verify_integrity(self, filing_id: str) -> tuple[bool, str]:
        """Re-hash stored payloads against recorded digests."""
        row = self._require(filing_id)
        problems = []
        if _sha256(row["input_json"]) != row["input_sha256"]:
            problems.append("input payload hash mismatch")
        if _sha256(row["result_json"]) != row["result_sha256"]:
            problems.append("result payload hash mismatch")
        if problems:
            return False, "; ".join(problems)
        return True, "ok"

    # ── Internals ─────────────────────────────────────────────────────

    def _require(self, filing_id: str) -> sqlite3.Row:
        row = self._conn.execute(
            "SELECT * FROM filings WHERE id=?", (filing_id,)
        ).fetchone()
        if row is None:
            raise KeyError(f"filing {filing_id!r} not found")
        return row

    def _current_status(self, filing_id: str, initial: str) -> str:
        row = self._conn.execute(
            "SELECT event FROM audit_events WHERE filing_id=? "
            "AND event LIKE 'status:%' ORDER BY id DESC LIMIT 1",
            (filing_id,),
        ).fetchone()
        return row["event"].split(":", 1)[1] if row else initial

    def _audit(self, filing_id: str, event: str,
               detail: Optional[str] = None) -> None:
        self._conn.execute(
            "INSERT INTO audit_events (filing_id, event, detail, created_at) "
            "VALUES (?,?,?,?)",
            (filing_id, event, detail, _now()),
        )

    def close(self) -> None:
        self._conn.close()
