export const DRAFT_STORAGE_KEY = "lastminute-itr-draft";
export const PROFILE_STORAGE_KEY = "lastminute-itr-profile";
const SESSION_ACTIVE_KEY = "lastminute-itr-session-active";
const SESSION_ID_KEY = "lastminute-itr-session-id";

/** Clear persisted draft/profile on first load of each browser tab session. */
export function ensureFreshBrowserSession(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(SESSION_ACTIVE_KEY)) return false;

  localStorage.removeItem(DRAFT_STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  sessionStorage.setItem(SESSION_ACTIVE_KEY, String(Date.now()));
  if (!sessionStorage.getItem(SESSION_ID_KEY)) {
    sessionStorage.setItem(SESSION_ID_KEY, crypto.randomUUID());
  }
  return true;
}

export function getBrowserSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}
