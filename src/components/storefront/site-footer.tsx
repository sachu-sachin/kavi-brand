import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t bg-brand-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-brand-red">Kavi</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Authentic South Indian spices, cold-pressed oils, premium nuts, and
            dates — delivered fresh across India.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Shop</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-brand-red">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="hover:text-brand-red"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Help</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/search" className="hover:text-brand-red">
                Search
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-gold/30">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kavi Foods. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
