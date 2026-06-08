"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export function CartSheet() {
  const { items, open, setOpen, setQty, removeItem, totalPrice, totalItems } =
    useCart();
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart ({totalItems})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <p>Your cart is empty.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-cream">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/products/${item.image}`}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl text-brand-red">
                      {item.productName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.unitLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Remove item"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.variantId, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.variantId, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter>
            <div className="mb-2 flex items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatINR(totalPrice)}</span>
            </div>
            <Button
              className="w-full bg-brand-red text-white hover:bg-brand-red/90"
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Checkout
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Continue shopping
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
