import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate, decimalToNumber } from "@/lib/format";
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
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./_components/order-status-badge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet. Orders will appear here once checkout is live
              (Phase 4).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {order._count.items}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(decimalToNumber(order.total) ?? 0)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
