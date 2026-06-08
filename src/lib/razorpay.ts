import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

export function isRazorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(id && secret && !id.includes("xxxx"));
}

let client: Razorpay | null = null;

function getClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured.");
  }
  if (!client) {
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

export async function createRazorpayOrder(
  amountInInr: number,
  receipt: string,
): Promise<{ id: string }> {
  const order = await getClient().orders.create({
    amount: Math.round(amountInInr * 100), // paise
    currency: "INR",
    receipt,
  });
  return { id: order.id };
}

/** Timing-safe HMAC-SHA256 verification of a Razorpay webhook payload. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
