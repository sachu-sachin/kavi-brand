import Link from "next/link";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";
import type { SiteSettings } from "@/lib/settings";

const MENU = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track Order" },
];

function Logo({ settings }: { settings: SiteSettings }) {
  return settings.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={settings.logo} alt={settings.companyName} className="h-8 w-auto" />
  ) : (
    <span className="font-display text-2xl font-bold text-brand-red">
      {settings.companyName}
    </span>
  );
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        {/* Mobile: hamburger (left) */}
        <div className="flex items-center md:hidden">
          <MobileMenu companyName={settings.companyName} />
        </div>

        {/* Logo: centered on mobile, left on desktop */}
        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 md:static md:left-auto md:translate-x-0"
        >
          <Logo settings={settings} />
        </Link>

        {/* Desktop primary menu */}
        <nav className="ml-6 hidden items-center gap-1 md:flex">
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

        {/* Right: search (desktop) + cart */}
        <div className="ml-auto flex items-center gap-2">
          <SearchBar className="hidden w-56 lg:block" />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
