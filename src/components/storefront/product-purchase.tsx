"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-provider";

export type PurchaseVariant = {
  id: string;
  unitLabel: string;
  regular: number;
  sale: number | null;
  effective: number;
  onSale: boolean;
  stock: number;
};

export function ProductPurchase({
  productSlug,
  productName,
  image,
  variants,
  defaultVariantId,
}: {
  productSlug: string;
  productName: string;
  image: string | null;
  variants: PurchaseVariant[];
  defaultVariantId: string;
}) {
  const { addItem, setOpen } = useCart();
  const [selectedId, setSelectedId] = useState(defaultVariantId);
  const [qty, setQty] = useState(1);

  const selected =
    variants.find((v) => v.id === selectedId) ?? variants[0];
  const outOfStock = !selected || selected.stock <= 0;
  const maxQty = selected?.stock ?? 0;

  const selectVariant = (id: string) => {
    setSelectedId(id);
    setQty(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">
          {selected ? formatINR(selected.effective) : "—"}
        </span>
        {selected?.onSale && (
          <span className="text-lg text-muted-foreground line-through">
            {formatINR(selected.regular)}
          </span>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const disabled = v.stock <= 0;
            const active = v.id === selected?.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={disabled}
                onClick={() => selectVariant(v.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-brand-red bg-brand-red text-white"
                    : "border-border hover:border-brand-red",
                  disabled && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                {v.unitLabel}
              </button>
            );
          })}
        </div>
      </div>

      {!outOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">Qty</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40"
              disabled={qty >= maxQty}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {maxQty} in stock
          </span>
        </div>
      )}

      {outOfStock ? (
        <Button className="w-full" disabled>
          Out of stock
        </Button>
      ) : (
        <Button
          className="w-full bg-brand-red text-white hover:bg-brand-red/90"
          size="lg"
          onClick={() => {
            addItem(
              {
                variantId: selected.id,
                productSlug,
                productName,
                unitLabel: selected.unitLabel,
                price: selected.effective,
                image,
              },
              qty,
            );
            setOpen(true);
            toast.success(`${productName} (${selected.unitLabel}) added to cart`);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to cart
        </Button>
      )}
    </div>
  );
}
