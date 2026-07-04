/**
 * Resolve HMAC session secrets. Production must set an explicit secret —
 * never fall back to a known dev string.
 */
export function requireSessionSecret(options: {
  envKeys: string[];
  devFallback: string;
  label: string;
}): string {
  for (const key of options.envKeys) {
    const value = process.env[key];
    if (value && value.trim().length >= 16) return value.trim();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${options.label} secret missing. Set ${options.envKeys.join(" or ")} in production.`
    );
  }

  return options.devFallback;
}
