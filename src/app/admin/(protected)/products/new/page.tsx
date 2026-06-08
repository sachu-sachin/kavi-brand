import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../_components/product-form";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add product</h1>
        <Button
          render={<Link href="/admin/products" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-md border bg-muted/40 px-4 py-3 text-sm">
          Create a{" "}
          <Link href="/admin/categories" className="underline">
            category
          </Link>{" "}
          first before adding products.
        </p>
      ) : (
        <ProductForm
          categories={categories}
          action={createProduct}
          submitLabel="Create product"
        />
      )}
    </div>
  );
}
