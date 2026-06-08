import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Droplets,
  Truck,
  Wheat,
  Gift,
  Quote,
  Star,
  Sprout,
  HandHeart,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBanners, resolveBannerImage } from "@/lib/banners";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroCarousel } from "@/components/storefront/hero-carousel";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Wheat,
    title: "Stone-ground",
    desc: "Milled slow and cool to keep the aroma alive.",
  },
  {
    icon: Droplets,
    title: "Wood-pressed",
    desc: "Cold-pressed oils, never heat-refined.",
  },
  {
    icon: Leaf,
    title: "Nothing added",
    desc: "Pure ingredients. No fillers, no shortcuts.",
  },
  {
    icon: Truck,
    title: "Fresh & fast",
    desc: "Packed to order, delivered across India.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The sambar powder tastes exactly like my grandmother's. I've stopped looking anywhere else.",
    name: "Lakshmi Raghavan",
    city: "Chennai",
    rating: 5,
  },
  {
    quote:
      "You can smell the freshness the moment you open the pack. The wood-pressed oil is the real thing.",
    name: "Arjun Menon",
    city: "Bengaluru",
    rating: 5,
  },
  {
    quote:
      "Clean ingredients, honest pricing, and it arrives quickly. My whole pantry runs on Kavi now.",
    name: "Priya Suresh",
    city: "Hyderabad",
    rating: 5,
  },
];

const PROMO_ICONS = [Truck, Gift];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function HomePage() {
  const [featured, categories, heroBanners, promoBanners, festiveBanners] =
    await Promise.all([
      prisma.product.findMany({
        where: { active: true, featured: true },
        include: { variants: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      getBanners("HERO"),
      getBanners("PROMO"),
      getBanners("FESTIVE"),
    ]);

  const heroSlides = heroBanners.map((b) => ({
    ...b,
    image: resolveBannerImage(b.image),
  }));
  const festive = festiveBanners[0];
  const festiveBg = festive ? resolveBannerImage(festive.image) : null;

  const totalProducts = categories.reduce(
    (sum, c) => sum + c._count.products,
    0,
  );

  return (
    <div>
      {/* ===== HERO (full-width carousel, admin-managed) ===== */}
      <HeroCarousel slides={heroSlides} />

      {/* ===== FEATURES — top best points ===== */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 px-5 py-6 md:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-red">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold">
                  {f.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY NAVIGATION (quick links under features) ===== */}
      <section className="border-b bg-brand-cream/40">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              href="/products"
              className="whitespace-nowrap rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red/90"
            >
              All products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="whitespace-nowrap rounded-full border border-brand-red/15 bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-red/40 hover:text-brand-red"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Handpicked
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
              This week&apos;s favourites
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              A small, rotating shelf of the spices and oils our kitchens reach
              for most.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-red/40 hover:text-brand-red sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted-foreground">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ===== BRAND STORY ===== */}
      <section className="border-y bg-brand-cream/50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Our story
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
              Made the slow way, because that&apos;s the way it tastes right.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75 md:text-base">
              Kavi started with a simple frustration — supermarket spices that
              smelled of cardboard and oils stripped of everything good. So we
              went back to the source: single-origin harvests, stone mills that
              turn cool and slow, and wooden presses that take their time.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base">
              Every batch is small, ground close to when you order, and packed
              with nothing but the ingredient itself. No fillers, no colours, no
              shortcuts — just food the way our grandmothers would recognise.
            </p>

            <div className="mt-7 flex flex-wrap gap-8">
              <div>
                <p className="font-display text-3xl font-bold text-brand-red">
                  {totalProducts}+
                </p>
                <p className="text-xs text-muted-foreground">pantry staples</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-brand-red">
                  {categories.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  curated categories
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-brand-red">
                  100%
                </p>
                <p className="text-xs text-muted-foreground">
                  pure, no fillers
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-card p-8 md:p-10">
            <Quote className="h-9 w-9 text-brand-gold" />
            <p className="mt-4 font-display text-xl leading-relaxed text-foreground/85 md:text-2xl">
              &ldquo;If it isn&apos;t good enough for our own kitchen table, it
              never reaches yours.&rdquo;
            </p>
            <p className="mt-5 text-sm font-semibold">The Kavi family</p>
            <p className="text-xs text-muted-foreground">
              Sourcing &amp; milling, Tamil Nadu
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t pt-6 text-center">
              {[
                { icon: Sprout, label: "Single-origin" },
                { icon: HandHeart, label: "Small-batch" },
                { icon: Leaf, label: "No additives" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-red">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[0.7rem] font-medium text-muted-foreground">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNERS (admin-managed) ===== */}
      {promoBanners.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <div className="grid gap-4 md:grid-cols-2">
            {promoBanners.slice(0, 2).map((b, i) => {
              const Icon = PROMO_ICONS[i % PROMO_ICONS.length];
              const img = resolveBannerImage(b.image);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-5 rounded-2xl border bg-card p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-cream text-brand-red">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-xl font-semibold">
                      {b.title}
                    </p>
                    {b.subtitle && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                  {b.ctaLabel && (
                    <Link
                      href={b.ctaHref || "/products"}
                      className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-red/90 sm:inline-flex"
                    >
                      {b.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== FESTIVE OFFER POSTER (admin-managed) ===== */}
      {festive && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div
            className="relative overflow-hidden rounded-3xl bg-brand-red text-white"
            style={
              festiveBg
                ? {
                  backgroundImage: `url("${festiveBg}")`,
                  backgroundPosition: "center center",
                  backgroundSize: "cover",
                  boxShadow: "inset 440px -20px 90px 90px #000000b0",
                }
                : undefined
            }
          >
            <div className="relative max-w-2xl p-8 md:p-14">
              {festive.eyebrow && (
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-gold">
                  {festive.eyebrow}
                </span>
              )}
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
                {festive.title}
              </h2>
              {festive.subtitle && (
                <p className="mt-3 max-w-md text-sm text-white/80">
                  {festive.subtitle}
                </p>
              )}
              {festive.ctaLabel && (
                <Link
                  href={festive.ctaHref || "/products"}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-red transition-transform hover:scale-[1.03]"
                >
                  {festive.ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== SHOP BY CATEGORY (warm monogram cards) ===== */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            Explore
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">
            Find your shelf
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border border-brand-red/10 bg-brand-cream p-5 transition-all hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-lg"
            >
              <span className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[8rem] font-bold leading-none text-brand-red/[0.07]">
                {c.name.charAt(0)}
              </span>
              <span className="relative inline-flex w-fit rounded-full bg-card px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground shadow-sm">
                {c._count.products} products
              </span>
              <div className="relative">
                <p className="font-display text-2xl font-bold leading-tight text-foreground">
                  {c.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
                  Browse{" "}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="border-t bg-brand-cream/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-9 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1 text-brand-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Loved in kitchens across India
            </h2>
            <p className="text-sm text-muted-foreground">
              Real notes from people who cook with Kavi every day.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border bg-card p-6"
              >
                <div className="flex items-center gap-0.5 text-brand-gold">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 font-display text-sm font-bold text-brand-red">
                    {initials(t.name)}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Verified buyer · {t.city}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLOSING CTA (warm) ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2118] to-[#3a2e22] px-6 py-14 text-center text-white md:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
            Fresh from the mill
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold leading-tight md:text-4xl">
            Real spices. Honest oils. Straight to your kitchen.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
            Stock your shelf with staples you can actually trust — milled small,
            packed fresh, delivered across India.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 text-sm font-semibold text-[#2a2118] transition-transform hover:scale-[1.03]"
          >
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
