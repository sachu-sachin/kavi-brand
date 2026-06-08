"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "./cart-provider";

type Props = {
  item: Omit<CartItem, "qty">;
  qty?: number;
  label?: string;
} & Pick<React.ComponentProps<typeof Button>, "className" | "size" | "variant">;

export function AddToCartButton({
  item,
  qty = 1,
  label = "Add to cart",
  ...buttonProps
}: Props) {
  const { addItem, setOpen } = useCart();

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        addItem(item, qty);
        setOpen(true);
        toast.success(`${item.productName} (${item.unitLabel}) added to cart`);
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {label}
    </Button>
  );
}
