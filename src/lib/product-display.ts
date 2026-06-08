import { decimalToNumber } from "@/lib/format";

export type VariantLike = {
  id: string;
  unitValue: number;
  unitType: string;
  price: { toString(): string };
  salePrice: { toString(): string } | null;
  stock: number;
};

export function variantPricing(v: VariantLike) {
  const regular = decimalToNumber(v.price) ?? 0;
  const sale = decimalToNumber(v.salePrice);
  return { regular, sale, effective: sale ?? regular, onSale: sale !== null };
}

export function defaultVariant<T extends VariantLike>(variants: T[]): T | null {
  if (variants.length === 0) return null;
  const inStock = variants.filter((v) => v.stock > 0);
  const pool = inStock.length ? inStock : variants;
  return [...pool].sort(
    (a, b) => variantPricing(a).effective - variantPricing(b).effective,
  )[0];
}

export function minPrice(variants: VariantLike[]): number | null {
  if (variants.length === 0) return null;
  return Math.min(...variants.map((v) => variantPricing(v).effective));
}
