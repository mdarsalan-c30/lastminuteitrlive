const BLOCKLIST_PATTERNS: RegExp[] = [
  /guarante(?:e|ed)\s+refund/i,
  /\bloophole\b/i,
  /file\s+for\s+you/i,
  /government\s+integrated/i,
];

export function containsBlocklistedPhrase(text: string): boolean {
  return BLOCKLIST_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateLlmTextFields(
  fields: string[]
): { valid: true } | { valid: false; reason: string } {
  for (const text of fields) {
    if (containsBlocklistedPhrase(text)) {
      return {
        valid: false,
        reason: "Output contained a disallowed phrase",
      };
    }
  }
  return { valid: true };
}

export function shouldEscalateToCaReview(flags: {
  caEscalationRecommended?: boolean;
  expertRequired?: boolean;
  complexityHigh?: boolean;
}): boolean {
  return Boolean(
    flags.caEscalationRecommended ||
      flags.expertRequired ||
      flags.complexityHigh
  );
}
