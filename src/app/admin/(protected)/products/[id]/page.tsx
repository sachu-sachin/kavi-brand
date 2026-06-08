import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  ProductForm,
  type VariantRow,
} from "../_components/product-form";
import { updateProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { unitValue: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const defaultVariants: VariantRow[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    unitValue: String(v.unitValue),
    unitType: v.unitType,
    price: String(decimalToNumber(v.price) ?? ""),
    salePrice:
      v.salePrice === null ? "" : String(decimalToNumber(v.salePrice) ?? ""),
    stock: String(v.stock),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <Button
          render={<Link href="/admin/products" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      <ProductForm
        categories={categories}
        action={updateProduct.bind(null, product.id)}
        submitLabel="Save changes"
        defaults={{
          name: product.name,
          description: product.description,
          brand: product.brand,
          image: product.image ?? "",
          categoryId: product.categoryId,
          featured: product.featured,
          active: product.active,
        }}
        defaultVariants={defaultVariants}
      />
    </div>
  );
}
