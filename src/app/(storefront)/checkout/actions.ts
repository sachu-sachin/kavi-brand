"use server";

import { z } from "zod";
import {
  reserveOrder,
  attachRazorpayOrder,
  cancelReservation,
  CheckoutError,
} from "@/lib/checkout";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Enter your name."),
    email: z.string().email("Enter a valid email."),
    phone: z.string().trim().min(7, "Enter a valid phone number."),
  }),
  address: z.object({
    line1: z.string().trim().min(3, "Enter your address."),
    city: z.string().trim().min(2, "Enter your city."),
    state: z.string().trim().min(2, "Enter your state."),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        qty: z.number().int().positive(),
      }),
    )
    .min(1, "Your cart is empty."),
});

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      razorpayOrderId: string;
      amount: number;
      keyId: string;
      prefill: { name: string; email: string; contact: string };
    }
  | { ok: false; error: string };

export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  const ip = await getClientIp();
  const limit = rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.success) {
    return {
      ok: false,
      error: "Too many checkout attempts. Please wait a moment and try again.",
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  if (!isRazorpayConfigured()) {
    return {
      ok: false,
      error:
        "Payments are not configured. Add your Razorpay keys to .env to accept orders.",
    };
  }

  const input = parsed.data;

  let orderId: string;
  let amount: number;
  try {
    const reserved = await reserveOrder(input);
    orderId = reserved.orderId;
    amount = reserved.amount;
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    throw e;
  }

  try {
    const rp = await createRazorpayOrder(amount, orderId);
    await attachRazorpayOrder(orderId, rp.id);
    return {
      ok: true,
      orderId,
      razorpayOrderId: rp.id,
      amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      prefill: {
        name: input.customer.name,
        email: input.customer.email,
        contact: input.customer.phone,
      },
    };
  } catch {
    await cancelReservation(orderId, "Failed to create Razorpay order.");
    return {
      ok: false,
      error: "Could not start the payment. Please try again.",
    };
  }
}
