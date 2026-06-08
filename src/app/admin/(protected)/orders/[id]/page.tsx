import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate, decimalToNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "../_components/order-status-badge";
import { OrderStatusForm } from "../_components/order-status-form";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      address: true,
      items: { include: { variant: { include: { product: true } } } },
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Order{" "}
            <span className="font-mono text-lg">{order.id.slice(0, 8)}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <Button
          render={<Link href="/admin/orders" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => {
                    const price = decimalToNumber(item.price) ?? 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.variant.product.name}
                          <span className="ml-1 text-muted-foreground">
                            ({item.variant.unitValue}
                            {item.variant.unitType.toLowerCase()})
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.variant.sku}
                        </TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">
                          {formatINR(price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatINR(price * item.qty)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end border-t pt-4 text-lg font-semibold">
                Total: {formatINR(decimalToNumber(order.total) ?? 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No status changes recorded yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {order.statusHistory.map((h) => (
                    <li key={h.id} className="flex items-start gap-3 text-sm">
                      <OrderStatusBadge status={h.status} />
                      <div>
                        <span className="text-muted-foreground">
                          {formatDate(h.changedAt)}
                        </span>
                        {h.note && <p>{h.note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order status</span>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Refund</span>
                <Badge variant="outline">{order.refundStatus}</Badge>
              </div>
              {order.razorpayOrderId && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Razorpay order</span>
                  <span className="font-mono text-xs">
                    {order.razorpayOrderId}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
              {order.address && (
                <p className="pt-2 text-muted-foreground">
                  {order.address.line1}, {order.address.city},{" "}
                  {order.address.state} - {order.address.pincode}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm orderId={order.id} current={order.orderStatus} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
