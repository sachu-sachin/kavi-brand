import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, decimalToNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/confirm-button";
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
import { deleteProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          render={<Link href="/admin/products/new" />}
          nativeButton={false}
        >
          Add product
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products yet.{" "}
              <Link href="/admin/products/new" className="underline">
                Add your first product
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Variants</TableHead>
                  <TableHead className="text-right">From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const prices = p.variants.map(
                    (v) =>
                      decimalToNumber(v.salePrice) ??
                      decimalToNumber(v.price) ??
                      0,
                  );
                  const from = prices.length ? Math.min(...prices) : null;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.name}
                        {p.featured && (
                          <Badge variant="secondary" className="ml-2">
                            Featured
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{p.category.name}</TableCell>
                      <TableCell className="text-right">
                        {p.variants.length}
                      </TableCell>
                      <TableCell className="text-right">
                        {from !== null ? formatINR(from) : "—"}
                      </TableCell>
                      <TableCell>
                        {p.active ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            render={<Link href={`/admin/products/${p.id}`} />}
                            nativeButton={false}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <form action={deleteProduct.bind(null, p.id)}>
                            <ConfirmButton
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              message={`Delete "${p.name}" and all its variants?`}
                            >
                              Delete
                            </ConfirmButton>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
