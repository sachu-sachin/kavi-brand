import Link from "next/link";
import { formatINR, formatUnit } from "@/lib/format";
import {
  defaultVariant,
  minPrice,
  variantPricing,
  type VariantLike,
} from "@/lib/product-display";
import { AddToCartButton } from "./add-to-cart";

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  featured: boolean;
  variants: VariantLike[];
};

export function ProductCard({ product }: { product: CardProduct }) {
  const dv = defaultVariant(product.variants);
  const from = minPrice(product.variants);
  const anyOnSale = product.variants.some((v) => variantPricing(v).onSale);
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-cream">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/products/${product.image}`}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-cream to-brand-gold/20">
              <span className="font-display text-6xl text-brand-red/30">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          {anyOnSale && (
            <span className="absolute left-3 top-3 rounded-full bg-brand-red px-2 py-0.5 text-xs font-semibold text-white">
              Sale
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-lg leading-tight hover:text-brand-red">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.variants.length} size
          {product.variants.length === 1 ? "" : "s"}
        </p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-xs text-muted-foreground">from</p>
            <p className="text-lg font-semibold">
              {from !== null ? formatINR(from) : "—"}
            </p>
          </div>
          {dv && inStock ? (
            <AddToCartButton
              size="sm"
              className="bg-brand-red text-white hover:bg-brand-red/90"
              label="Add"
              item={{
                variantId: dv.id,
                productSlug: product.slug,
                productName: product.name,
                unitLabel: formatUnit(dv.unitValue, dv.unitType),
                price: variantPricing(dv).effective,
                image: product.image,
              }}
            />
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
