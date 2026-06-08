import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";

type Category = { id: string; name: string; slug: string };

const MENU = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "#", label: "About Us" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Track Order" },
];

// `categories` is accepted for API compatibility with the layout but the
// category links now live on the home page (under the features section).
export function SiteHeader({}: { categories?: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="Kavi Foods Logo" width={40} height={40} className="h-8 w-auto" priority />
        </Link>

        {/* Primary menu */}
        <nav className="hidden items-center gap-1 md:flex">
          {MENU.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-brand-cream hover:text-brand-red"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        {/* Right side: search + cart */}
        <div className="ml-auto flex items-center gap-2">
          <SearchBar className="hidden w-56 lg:block" />
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
