import "server-only";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatUnit } from "@/lib/format";

export const RESERVATION_MINUTES = 15;

export class CheckoutError extends Error {}

export type CheckoutInput = {
  customer: { name: string; email: string; phone: string };
  address: { line1: string; city: string; state: string; pincode: string };
  items: { variantId: string; qty: number }[];
};

/**
 * Validates stock, reserves it (atomic, oversell-safe), dedupes the customer,
 * and creates a PENDING order with a 15-minute reservation window.
 * Does NOT call Razorpay — that happens after, so no network call sits inside
 * the DB transaction.
 */
export async function reserveOrder(
  input: CheckoutInput,
): Promise<{ orderId: string; amount: number }> {
  if (input.items.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }

  return prisma.$transaction(async (tx) => {
    // Lazy cleanup: release stock from unpaid orders whose 15-min window
    // elapsed. No cron needed — this runs at the start of every checkout.
    const expired = await tx.order.findMany({
      where: {
        paymentStatus: "PENDING",
        reservationExpiresAt: { lt: new Date() },
      },
      include: { items: true },
    });
    for (const order of expired) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "CANCELLED",
          reservationExpiresAt: null,
          cancelReason: "Reservation expired",
        },
      });
    }

    const variants = await tx.productVariant.findMany({
      where: { id: { in: input.items.map((i) => i.variantId) } },
      include: { product: true },
    });
    const byId = new Map(variants.map((v) => [v.id, v]));

    let total = 0;
    const orderItems: { variantId: string; qty: number; price: number }[] = [];

    for (const item of input.items) {
      const variant = byId.get(item.variantId);
      if (!variant || !variant.product.active) {
        throw new CheckoutError("A product in your cart is no longer available.");
      }
      if (!Number.isInteger(item.qty) || item.qty <= 0) {
        throw new CheckoutError("Invalid quantity in cart.");
      }

      const unit =
        decimalToNumber(variant.salePrice) ?? decimalToNumber(variant.price) ?? 0;

      // Atomic conditional decrement: only succeeds if enough stock remains.
      const reserved = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      });
      if (reserved.count !== 1) {
        throw new CheckoutError(
          `Not enough stock for ${variant.product.name} (${formatUnit(
            variant.unitValue,
            variant.unitType,
          )}).`,
        );
      }

      total += unit * item.qty;
      orderItems.push({ variantId: variant.id, qty: item.qty, price: unit });
    }

    const email = input.customer.email.trim().toLowerCase();
    const customer = await tx.customer.upsert({
      where: { email },
      update: {
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim(),
      },
      create: {
        email,
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim(),
      },
    });

    const address = await tx.address.create({
      data: { customerId: customer.id, ...input.address },
    });

    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        addressId: address.id,
        total,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        reservationExpiresAt: new Date(Date.now() + RESERVATION_MINUTES * 60_000),
        items: { create: orderItems },
        statusHistory: {
          create: { status: "PENDING", note: "Order placed, awaiting payment." },
        },
      },
    });

    return { orderId: order.id, amount: total };
  });
}

export async function attachRazorpayOrder(
  orderId: string,
  razorpayOrderId: string,
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { razorpayOrderId },
  });
}

/** Restores reserved stock and cancels an unpaid order (e.g. Razorpay failure). */
export async function cancelReservation(
  orderId: string,
  reason: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.paymentStatus === "PAID" || order.reservationExpiresAt === null) {
      return;
    }
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.qty } },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        paymentStatus: "FAILED",
        reservationExpiresAt: null,
        cancelReason: reason,
      },
    });
  });
}

export type MarkPaidResult =
  | { status: "paid"; orderId: string }
  | { status: "already_paid" }
  | { status: "not_found" };

/**
 * Idempotently marks an order PAID. The conditional updateMany guarantees only
 * the first webhook delivery transitions the order (and triggers the email),
 * even if Razorpay retries or sends duplicates.
 */
export async function markOrderPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<MarkPaidResult> {
  const updated = await prisma.order.updateMany({
    where: { razorpayOrderId, paymentStatus: { not: "PAID" } },
    data: {
      paymentStatus: "PAID",
      orderStatus: "PAID",
      razorpayPaymentId,
      reservationExpiresAt: null,
    },
  });

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId },
    select: { id: true },
  });

  if (updated.count === 0) {
    return order ? { status: "already_paid" } : { status: "not_found" };
  }
  if (!order) return { status: "not_found" };

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "PAID",
      note: "Payment captured via Razorpay.",
    },
  });

  return { status: "paid", orderId: order.id };
}
