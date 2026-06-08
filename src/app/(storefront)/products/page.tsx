import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All products",
  description: "Browse all Kavi spices, oils, nuts, and dates.",
  alternates: { canonical: "/products" },
};

export default async function AllProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { variants: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">All products</h1>
      <p className="mt-1 text-muted-foreground">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>

      {products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No products available yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
