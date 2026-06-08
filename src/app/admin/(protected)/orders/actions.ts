"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().trim().max(500).optional(),
});

export type OrderStatusState = { error?: string; success?: string };

export async function updateOrderStatus(
  orderId: string,
  _prev: OrderStatusState,
  formData: FormData,
): Promise<OrderStatusState> {
  await requireSession();
  const parsed = schema.safeParse({
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please choose a valid status." };
  }
  const { status, note } = parsed.data;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId, status, note: note ?? null },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: "Order status updated." };
}
