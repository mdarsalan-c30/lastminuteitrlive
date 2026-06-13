import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/sessions/log/route";
import { listSessionLogs } from "@/lib/sessionLog";

describe("POST /api/sessions/log", () => {
  it("appends a session log entry", async () => {
    const sessionId = `test-${Date.now()}`;
    const request = new NextRequest("http://localhost/api/sessions/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        event: "draft_snapshot",
        draft: { income: { grossSalary: 500000 } },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(typeof data.id).toBe("string");

    const logs = await listSessionLogs(5);
    expect(logs.some((entry) => entry.sessionId === sessionId)).toBe(true);
  });

  it("rejects missing sessionId", async () => {
    const request = new NextRequest("http://localhost/api/sessions/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "session_start" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
