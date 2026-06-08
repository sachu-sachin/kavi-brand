import { prisma } from "@/lib/prisma";
import { searchProductIds } from "@/lib/search";
import { ProductCard, type CardProduct } from "@/components/storefront/product-card";
import { SearchBar } from "@/components/storefront/search-bar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search — Kavi",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let products: CardProduct[] = [];
  if (query) {
    const ids = await searchProductIds(query);
    if (ids.length) {
      const found = await prisma.product.findMany({
        where: { id: { in: ids }, active: true },
        include: { variants: true },
      });
      // Preserve relevance order from the full-text query.
      const order = new Map(ids.map((id, i) => [id, i]));
      products = found.sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
      );
    }
    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { variants: true },
        take: 60,
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Search</h1>

      <div className="mt-4 max-w-xl">
        <SearchBar defaultValue={query} autoFocus />
      </div>

      {query ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {products.length} result{products.length === 1 ? "" : "s"} for
          &ldquo;{query}&rdquo;
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Type above to search our spices, oils, nuts, and dates.
        </p>
      )}

      {query && products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No products matched your search. Try a different term.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
