import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR, formatUnit, decimalToNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusPoller } from "@/components/storefront/status-poller";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order received — Kavi",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { variant: { include: { product: true } } } },
      },
    })
    : null;

  const paid = order?.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <StatusPoller active={Boolean(order) && !paid} />

      {paid ? (
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
      ) : (
        <Clock className="mx-auto h-14 w-14 text-amber-500" />
      )}

      <h1 className="mt-4 font-display text-3xl font-bold">
        {paid ? "Order confirmed!" : "Order received"}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {paid
          ? "Thank you — your payment was successful and a confirmation email is on its way."
          : "We've received your order and are confirming your payment. This page will update automatically."}
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border bg-card p-6 text-left">
          <p className="text-sm text-muted-foreground">
            Order{" "}
            <span className="font-mono text-foreground">
              #{order.id.slice(0, 8)}
            </span>
          </p>
          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-sm">
                <span>
                  {item.variant.product.name}{" "}
                  <span className="text-muted-foreground">
                    ({formatUnit(item.variant.unitValue, item.variant.unitType)})
                    × {item.qty}
                  </span>
                </span>
                <span className="font-medium">
                  {formatINR((decimalToNumber(item.price) ?? 0) * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
            <span>Total</span>
            <span>{formatINR(decimalToNumber(order.total) ?? 0)}</span>
          </div>
        </div>
      )}

      <Button
        className="mt-8 bg-brand-red text-white hover:bg-brand-red/90"
        render={<Link href="/products" />}
        nativeButton={false}
      >
        Continue shopping
      </Button>
    </div>
  );
}
