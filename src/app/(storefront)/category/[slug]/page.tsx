import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `Shop ${category.name} from Kavi.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        include: { variants: true },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">{category.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {category.products.length} product
        {category.products.length === 1 ? "" : "s"}
      </p>

      {category.products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No products in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {category.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
