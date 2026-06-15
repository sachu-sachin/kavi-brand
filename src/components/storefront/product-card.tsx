import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-red/20 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-cream">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/products/${product.image}`}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-cream to-brand-gold/20">
              <span className="font-display text-5xl text-brand-red/25 sm:text-6xl">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {anyOnSale && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-red px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[0.65rem]">
              Sale
            </span>
          )}
          {!inStock && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-foreground/80 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-background sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[0.65rem]">
              Sold out
            </span>
          )}

          {/* Hover reveal */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-red shadow-md">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug transition-colors group-hover:text-brand-red sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.variants.length} size
          {product.variants.length === 1 ? "" : "s"}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="leading-tight">
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              From
            </p>
            <p className="text-base font-bold tracking-tight sm:text-lg">
              {from !== null ? formatINR(from) : "—"}
            </p>
          </div>
          {dv && inStock ? (
            <AddToCartButton
              size="sm"
              className="w-full rounded-full bg-brand-red px-4 text-white hover:bg-brand-red/90 sm:w-auto"
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
