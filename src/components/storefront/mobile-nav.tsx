"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-provider";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: Store },
  { href: "/search", label: "Search", icon: Search },
];

export function MobileNav() {
  const pathname = usePathname();
  const { totalItems, setOpen, hydrated } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs",
                active ? "text-brand-red" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
        >
          <ShoppingBag className="h-5 w-5" />
          Cart
          {hydrated && totalItems > 0 && (
            <span className="absolute right-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-semibold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
