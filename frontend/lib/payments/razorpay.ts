import crypto from "crypto";

export function hasRazorpayKeys(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string | number | boolean> = {}
): Promise<{ id: string; amount: number; currency: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { product: "lastminute-itr", ...notes },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay order failed: ${error}`);
  }

  const data = (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
  };
  return data;
}

export async function fetchRazorpayOrder(orderId: string): Promise<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string | number | boolean | null>;
}> {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay order fetch failed: ${error}`);
  }

  return (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
    status: string;
    notes?: Record<string, string | number | boolean | null>;
  };
}
