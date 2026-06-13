import { beforeEach, describe, expect, it, vi } from "vitest";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("ensureFreshBrowserSession", () => {
  beforeEach(async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("sessionStorage", createStorage());
    vi.stubGlobal("crypto", { randomUUID: () => "test-session-uuid" });
    vi.resetModules();
  });

  it("clears persisted stores on first call in a tab session", async () => {
    const { DRAFT_STORAGE_KEY, PROFILE_STORAGE_KEY, ensureFreshBrowserSession } =
      await import("../sessionInit");

    localStorage.setItem(DRAFT_STORAGE_KEY, '{"state":{"income":{"grossSalary":999}}}');
    localStorage.setItem(PROFILE_STORAGE_KEY, '{"state":{"name":"Old"}}');

    expect(ensureFreshBrowserSession()).toBe(true);
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem("lastminute-itr-session-active")).toBeTruthy();
  });

  it("does not clear again within the same tab session", async () => {
    const { DRAFT_STORAGE_KEY, ensureFreshBrowserSession } = await import("../sessionInit");

    ensureFreshBrowserSession();
    localStorage.setItem(DRAFT_STORAGE_KEY, "keep-me");

    expect(ensureFreshBrowserSession()).toBe(false);
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe("keep-me");
  });

  it("returns a stable browser session id", async () => {
    const { ensureFreshBrowserSession, getBrowserSessionId } = await import(
      "../sessionInit"
    );

    ensureFreshBrowserSession();
    expect(getBrowserSessionId()).toBe("test-session-uuid");
    expect(getBrowserSessionId()).toBe("test-session-uuid");
  });
});
