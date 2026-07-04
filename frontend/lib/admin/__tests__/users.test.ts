import { afterEach, describe, expect, it, vi } from "vitest";

// The store is Prisma-backed in production; keep these unit tests hermetic
// with an in-memory implementation so no database state leaks across runs.
vi.mock("@/lib/db/store", () => {
  const collections = new Map<string, any[]>();
  const rows = (name: string) => {
    if (!collections.has(name)) collections.set(name, []);
    return collections.get(name)!;
  };
  return {
    genId: (prefix: string) =>
      `${prefix}_${Math.random().toString(36).slice(2, 18)}`,
    all: async (name: string) => [...rows(name)],
    insert: async (name: string, row: any) => {
      rows(name).push(row);
      return row;
    },
    update: async (name: string, id: string, patch: any) => {
      const row = rows(name).find((r) => r.id === id);
      if (!row) return null;
      Object.assign(row, patch);
      return row;
    },
    remove: async (name: string, id: string) => {
      const list = rows(name);
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) return false;
      list.splice(idx, 1);
      return true;
    },
    replaceAll: async (name: string, newRows: any[]) => {
      collections.set(name, [...newRows]);
    },
    resetCache: () => collections.clear(),
  };
});

import { resetCache } from "@/lib/db/store";
import {
  createAdminUser,
  createCustomRole,
  resolveRolePermissions,
  setRolePermissions,
  updateAdminUser,
  verifyAdminCredentials,
} from "@/lib/admin/users";

describe("self-serve team management", () => {
  afterEach(() => resetCache());

  it("creates a user and authenticates it; disabled users cannot log in", async () => {
    resetCache();
    const { user, error } = await createAdminUser({
      email: "Ops@LastMinuteITR.com",
      password: "supersecret",
      role: "ops",
      createdBy: "ceo@lastminuteitr.com",
    });
    expect(error).toBeUndefined();
    expect(user?.email).toBe("ops@lastminuteitr.com");

    const ok = await verifyAdminCredentials("ops@lastminuteitr.com", "supersecret");
    expect(ok).toEqual({ email: "ops@lastminuteitr.com", role: "ops" });

    const bad = await verifyAdminCredentials("ops@lastminuteitr.com", "wrong");
    expect(bad).toBeNull();

    await updateAdminUser(user!.id, { status: "disabled" });
    const disabled = await verifyAdminCredentials(
      "ops@lastminuteitr.com",
      "supersecret"
    );
    expect(disabled).toBeNull();
  });

  it("rejects duplicate emails and short passwords", async () => {
    resetCache();
    await createAdminUser({
      email: "dupe@lastminuteitr.com",
      password: "longenough",
      role: "ops",
    });
    const dup = await createAdminUser({
      email: "dupe@lastminuteitr.com",
      password: "longenough",
      role: "ops",
    });
    expect(dup.error).toMatch(/already exists/i);

    const short = await createAdminUser({
      email: "new@lastminuteitr.com",
      password: "short",
      role: "ops",
    });
    expect(short.error).toMatch(/8 characters/i);
  });

  it("editing the matrix overrides built-in role permissions", async () => {
    resetCache();
    const before = await resolveRolePermissions();
    expect(before.engineering).not.toContain("editPricing");

    await setRolePermissions("engineering", ["viewDashboard", "editPricing"]);
    const after = await resolveRolePermissions();
    expect(after.engineering).toContain("editPricing");
    expect(after.engineering).not.toContain("viewAudit");
  });

  it("supports custom roles with their own permission set", async () => {
    resetCache();
    const { role, error } = await createCustomRole({
      key: "finance",
      label: "Finance",
      permissions: ["viewDashboard", "refundPayment"],
    });
    expect(error).toBeUndefined();
    expect(role?.key).toBe("finance");

    const map = await resolveRolePermissions();
    expect(map.finance).toEqual(
      expect.arrayContaining(["viewDashboard", "refundPayment"])
    );

    // A user can be assigned the custom role and authenticate.
    await createAdminUser({
      email: "fin@lastminuteitr.com",
      password: "longenough",
      role: "finance",
    });
    const ok = await verifyAdminCredentials("fin@lastminuteitr.com", "longenough");
    expect(ok?.role).toBe("finance");
  });
});
