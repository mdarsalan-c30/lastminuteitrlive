"use client";

import { useEffect, useState } from "react";

type Provider = "openai" | "groq";
type Status = {
  primaryConfigured: boolean;
  fallbackSlots: Array<{ slot: number; configured: boolean }>;
  updatedAt: string | null;
  updatedBy: string | null;
};
type StatusMap = Partial<Record<Provider, Status>>;

const PROVIDERS: Array<{ id: Provider; label: string; placeholder: string; priority: string }> = [
  { id: "openai", label: "OpenAI", placeholder: "sk-...", priority: "Primary AI provider" },
  { id: "groq", label: "Groq", placeholder: "gsk_...", priority: "Fallback if OpenAI is unavailable" },
];

const emptyKeys = (): Record<Provider, string[]> => ({
  openai: ["", "", "", ""],
  groq: ["", "", "", ""],
});

export function AiKeyManager() {
  const [status, setStatus] = useState<StatusMap>({});
  const [keys, setKeys] = useState(emptyKeys);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [message, setMessage] = useState<Partial<Record<Provider, string>>>({});

  async function load() {
    const response = await fetch("/api/admin/ai-keys", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setStatus(data.providers ?? {});
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(provider: Provider) {
    setBusy(provider);
    setMessage((current) => ({ ...current, [provider]: "" }));
    const response = await fetch("/api/admin/ai-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, keys: keys[provider].filter((key) => key.trim()) }),
    });
    const data = await response.json();
    if (response.ok) {
      setStatus((current) => ({ ...current, [provider]: data.status }));
      setKeys((current) => ({ ...current, [provider]: ["", "", "", ""] }));
      setMessage((current) => ({
        ...current,
        [provider]: `${PROVIDERS.find((item) => item.id === provider)?.label} keys updated securely.`,
      }));
    } else {
      setMessage((current) => ({ ...current, [provider]: data.error ?? "Unable to update keys." }));
    }
    setBusy(null);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">AI provider priority</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The Filing Assistant tries OpenAI first, then automatically tries Groq. Keys are encrypted
          before database storage and are never returned by this API.
        </p>
      </div>

      {PROVIDERS.map((provider) => {
        const providerStatus = status[provider.id];
        return (
          <section key={provider.id} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{provider.label}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {provider.priority} · Environment primary:{" "}
                  {providerStatus?.primaryConfigured ? "configured" : "not configured"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Available slots:{" "}
                {providerStatus?.fallbackSlots.filter((slot) => slot.configured).length ?? 0}/4
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {keys[provider.id].map((key, index) => {
                const configured = providerStatus?.fallbackSlots[index]?.configured;
                return (
                  <label key={index} className="text-sm font-medium">
                    API key {index + 1}
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={key}
                      onChange={(event) =>
                        setKeys((current) => ({
                          ...current,
                          [provider.id]: current[provider.id].map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          ),
                        }))
                      }
                      placeholder={configured ? "Configured — enter to replace" : provider.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
                    />
                  </label>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Saving replaces this provider&apos;s database-managed list only. Leave all four fields
              empty and save to clear its database keys; environment keys are not changed.
            </p>
            {message[provider.id] && <p className="mt-3 text-sm">{message[provider.id]}</p>}
            <button
              type="button"
              onClick={() => save(provider.id)}
              disabled={busy !== null}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy === provider.id ? "Saving..." : `Save ${provider.label} keys`}
            </button>
          </section>
        );
      })}
    </div>
  );
}
