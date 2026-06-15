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
  Flame,
  Nut,
  Cherry,
  Soup,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBanners, resolveBannerImage } from "@/lib/banners";
import { ProductCard } from "@/components/storefront/product-card";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { MasalaDecor } from "@/components/storefront/masala-decor";

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

// Map a category to a spice-appropriate icon + warm gradient band.
function categoryVisual(name: string) {
  const n = name.toLowerCase();
  if (n.includes("spice") || n.includes("masala") || n.includes("powder"))
    return { Icon: Flame, band: "from-[#9a1b1b] to-[#5e0000]" };
  if (n.includes("oil") || n.includes("ghee"))
    return { Icon: Droplets, band: "from-[#b8860b] to-[#7a5a08]" };
  if (n.includes("nut") || n.includes("dry") || n.includes("seed"))
    return { Icon: Nut, band: "from-[#6b4a2b] to-[#3f2a16]" };
  if (n.includes("date") || n.includes("fruit"))
    return { Icon: Cherry, band: "from-[#7a1f3d] to-[#4a0f24]" };
  if (n.includes("tea") || n.includes("herb") || n.includes("leaf"))
    return { Icon: Leaf, band: "from-[#3a5a3a] to-[#1f3320]" };
  if (n.includes("coffee"))
    return { Icon: Soup, band: "from-[#4a3424] to-[#2a1d13]" };
  return { Icon: Sparkles, band: "from-brand-red to-[#5e0000]" };
}

function categoryImageSrc(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return `/categories/${image}`;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-gold">
      <span className="h-px w-6 bg-brand-gold/60" />
      {children}
    </span>
  );
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
    <div className="bg-[#fcf9f3]">
      {/* ===== HERO (full-width carousel, admin-managed) ===== */}
      <HeroCarousel slides={heroSlides} />

      {/* ===== FEATURES — trust bar ===== */}
      <section className="border-b border-border/70 bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-6 py-8 md:grid-cols-4 md:gap-x-8 md:py-7">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-red ring-1 ring-brand-gold/20">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">{f.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY NAVIGATION (quick links) ===== */}
      <section className="border-b border-border/70 bg-brand-cream/30">
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
                className="whitespace-nowrap rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-red/40 hover:text-brand-red"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENTO GRID ===== */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <Eyebrow>The Kavi pantry</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            A shelf worth opening
          </h2>
        </div>
        <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[170px] md:grid-cols-4">
          {/* Big brand tile */}
          <Link
            href="/products"
            className="group relative col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl bg-[#5c0e14] p-6 text-white transition-shadow hover:shadow-[0_24px_50px_-20px_rgba(92,14,20,0.6)] md:p-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/b1.png"
              alt="Spices and oils background"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            <div className="relative z-10 mt-10">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#d1a354] mt-15">
                Stone-ground &amp; wood-pressed
              </span>
              <h3 className="mt-8 max-w-sm font-display text-2xl font-bold leading-[1.15] text-white md:text-[2rem]">
                Spices &amp; oils, milled fresh to order
              </h3>
            </div>
            <span className="relative z-10 mt-8 flex w-fit items-center gap-1.5 rounded-full bg-[#fcf9f3] px-5 py-2.5 text-sm font-semibold text-[#5c0e14] transition-transform group-hover:scale-[1.03]">
              Shop all <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Offer tile */}
          {festive ? (
            <Link
              href={festive.ctaHref || "/products"}
              className="group relative col-span-2 flex flex-col justify-center overflow-hidden rounded-3xl bg-[#c19220] p-6 md:p-8 text-[#2e1d00] transition-shadow hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/b2.webp"
                alt="Offer background"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="relative z-10">
                <span className="text-[0.75rem] font-bold uppercase tracking-[0.15em]">
                  {festive.eyebrow ?? "Special offer"}
                </span>
                <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-[1.2] md:text-[1.7rem]">
                  {festive.title}
                </h3>
                <span className="mt-5 flex w-fit items-center gap-1.5 text-[0.9rem] font-bold">
                  {festive.ctaLabel ?? "Shop now"}{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ) : (
            <div className="col-span-2 flex flex-col justify-center rounded-3xl border border-border/70 bg-card p-6">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-gold">
                100% natural
              </span>
              <h3 className="mt-1 font-display text-xl font-bold">
                No fillers. No colours. Ever.
              </h3>
            </div>
          )}

          {/* Two category tiles */}
          {categories.slice(0, 2).map((c) => {
            const v = categoryVisual(c.name);
            const img = categoryImageSrc((c as { image?: string | null }).image);
            return (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={`group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${v.band} p-6 text-white transition-shadow hover:shadow-lg`}
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={c.name}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#110A07]/90 via-[#110A07]/20 to-transparent opacity-90" />
                <div className="relative z-10">
                  <span className="font-display text-xl font-bold leading-tight tracking-wide text-[#fcf9f3]">
                    {c.name}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[0.8rem] font-semibold text-[#d1a354]">
                    Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Handpicked</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              This week&apos;s favourites
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              A small, rotating shelf of the spices and oils our kitchens reach
              for most.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-red/40 hover:text-brand-red sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted-foreground">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ===== SHOP BY CATEGORY (colour-coded spice cards) ===== */}
      <section className="border-y border-border/70 bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Explore</Eyebrow>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Shop by category
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-red/40 hover:text-brand-red sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {categories.map((c) => {
              const v = categoryVisual(c.name);
              const catImg = categoryImageSrc(
                (c as { image?: string | null }).image,
              );
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-red/20 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.22)]"
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-brand-cream to-brand-gold/15">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.20),transparent_65%)]" />
                    <v.Icon className="pointer-events-none absolute -bottom-5 -right-3 h-28 w-28 text-brand-red/[0.06]" />
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-white/85 px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground shadow-sm backdrop-blur">
                      {c._count.products} items
                    </span>
                    {catImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={catImg}
                        alt={c.name}
                        className="relative h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <v.Icon className="relative h-12 w-12 text-brand-red/70" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-4">
                    <p className="font-display text-base font-semibold leading-tight">
                      {c.name}
                    </p>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-cream text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== BRAND STORY ===== */}
      <section className="bg-brand-cream/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
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

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <p className="font-display text-2xl font-bold text-brand-red md:text-3xl">
                  {totalProducts}+
                </p>
                <p className="text-xs text-muted-foreground">pantry staples</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand-red md:text-3xl">
                  {categories.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  curated categories
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-brand-red md:text-3xl">
                  100%
                </p>
                <p className="text-xs text-muted-foreground">
                  pure, no fillers
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-card p-8 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] md:p-10">
            <Quote className="h-8 w-8 text-brand-gold" />
            <p className="mt-4 font-display text-lg leading-relaxed text-foreground/85 md:text-xl">
              &ldquo;If it isn&apos;t good enough for our own kitchen table, it
              never reaches yours.&rdquo;
            </p>
            <p className="mt-5 text-sm font-semibold">The Kavi family</p>
            <p className="text-xs text-muted-foreground">
              Sourcing &amp; milling, Tamil Nadu
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/70 pt-6 text-center">
              {[
                { icon: Sprout, label: "Single-origin" },
                { icon: HandHeart, label: "Small-batch" },
                { icon: Leaf, label: "No additives" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-red ring-1 ring-brand-gold/20">
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
        <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
          <div className="grid gap-4 md:grid-cols-2">
            {promoBanners.slice(0, 2).map((b, i) => {
              const Icon = PROMO_ICONS[i % PROMO_ICONS.length];
              const img = resolveBannerImage(b.image);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.15)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-cream text-brand-red ring-1 ring-brand-gold/20">
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
                    <p className="font-display text-lg font-semibold">
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
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div
            className="relative overflow-hidden rounded-3xl bg-brand-red text-white shadow-[0_30px_60px_-30px_rgba(94,0,0,0.6)]"
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
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  {festive.eyebrow}
                </span>
              )}
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight md:text-4xl">
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

      {/* ===== TESTIMONIALS ===== */}
      <section className="border-t border-border/70 bg-brand-cream/40">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10">
            <Eyebrow>Loved across India</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              What our customers say
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-[0_12px_30px_-14px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center gap-0.5 text-brand-gold">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-4">
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

      {/* ===== CLOSING CTA ===== */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a2118] to-[#3a2e22] px-6 py-14 text-center text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] md:py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
          <MasalaDecor tone="dark" />
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Eyebrow>Fresh from the mill</Eyebrow>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight md:text-4xl">
              Real spices. Honest oils. Straight to your kitchen.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
              Stock your shelf with staples you can actually trust — milled
              small, packed fresh, delivered across India.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 text-sm font-semibold text-[#2a2118] transition-transform hover:scale-[1.03]"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
