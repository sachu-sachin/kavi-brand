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
import { OrderStatusBadge } from "./orders/_components/order-status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    productCount,
    categoryCount,
    orderCount,
    pendingOrders,
    lowStockCount,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.productVariant.count({ where: { stock: { lt: 10 } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Categories", value: categoryCount, href: "/admin/categories" },
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Pending orders", value: pendingOrders, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {lowStockCount > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Badge className="bg-amber-500">Low stock</Badge>
            <span className="text-sm text-amber-900">
              {lowStockCount} variant{lowStockCount === 1 ? "" : "s"} below 10
              units.{" "}
              <Link href="/admin/products" className="font-medium underline">
                Review products
              </Link>
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.orderStatus} />
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
