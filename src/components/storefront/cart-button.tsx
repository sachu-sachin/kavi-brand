"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { totalItems, setOpen, hydrated } = useCart();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs font-semibold text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}
