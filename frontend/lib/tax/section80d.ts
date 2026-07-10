/**
 * 80D cash payment hard-block (medical insurance / expenses).
 * Cash payments for 80D are not allowed — only non-cash modes.
 */

export function is80DCashPaymentBlocked(paymentMode: string): boolean {
  const mode = paymentMode.trim().toLowerCase();
  return mode === "cash" || mode === "in_cash" || mode === "in cash";
}

export const SECTION_80D_CASH_MESSAGE =
  "Section 80D does not allow cash payments for health insurance or medical expenses. Use bank transfer, UPI, card, or cheque.";
