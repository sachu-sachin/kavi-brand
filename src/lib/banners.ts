import "server-only";
import { prisma } from "@/lib/prisma";

export type BannerPlacement = "HERO" | "ANNOUNCEMENT" | "PROMO" | "FESTIVE";

export type BannerView = {
  id: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  showOverlay: boolean;
};

export function resolveBannerImage(image: string | null): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  return `/banners/${image}`;
}

const DEFAULTS: Record<BannerPlacement, BannerView[]> = {
  ANNOUNCEMENT: [
    fallback("a1", { title: "Festive Sale — up to 20% off select masalas & oils" }),
    fallback("a2", { title: "Free shipping on all orders above ₹999" }),
    fallback("a3", { title: "100% pure ingredients — no fillers, ever" }),
    fallback("a4", { title: "Use code KAVI10 for 10% off your first order" }),
  ],
  HERO: [
    fallback("h1", {
      eyebrow: "South Indian, done right",
      title: "Stone-ground spices. Honest food.",
      subtitle:
        "Sourced and milled the traditional way — no fillers, no shortcuts. Delivered fresh to your door across India.",
      ctaLabel: "Shop all products",
      ctaHref: "/products",
    }),
    fallback("h2", {
      eyebrow: "Festive offer — limited time",
      title: "Up to 20% off masalas & oils.",
      subtitle:
        "Fresh-milled spice blends and wood-pressed oils at festive prices. While stocks last.",
      ctaLabel: "Shop the sale",
      ctaHref: "/products",
    }),
    fallback("h3", {
      eyebrow: "Cold-pressed, wood-pressed",
      title: "Oils the way they used to be.",
      subtitle:
        "Slow wood-pressed, never heat-refined. Real aroma, real nutrition — straight from the chekku.",
      ctaLabel: "Explore oils",
      ctaHref: "/products",
    }),
  ],
  PROMO: [
    fallback("p1", {
      title: "Free shipping over ₹999",
      subtitle: "Doorstep delivery anywhere in India. No code needed.",
    }),
    fallback("p2", {
      title: "Pantry combo packs",
      subtitle: "Curated spice + oil bundles. Save more when you stock up.",
      ctaLabel: "Shop",
      ctaHref: "/products",
    }),
  ],
  FESTIVE: [
    fallback("f1", {
      eyebrow: "Limited time",
      title: "Taste of tradition, now 20% lighter on the wallet.",
      subtitle:
        "Fresh-milled masalas and wood-pressed oils at festive prices. While stocks last.",
      image: "/banners/festive-poster.png",
      ctaLabel: "Shop the sale",
      ctaHref: "/products",
    }),
  ],
};

function fallback(id: string, data: Partial<BannerView>): BannerView {
  return {
    id,
    eyebrow: data.eyebrow ?? null,
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    image: data.image ?? null,
    ctaLabel: data.ctaLabel ?? null,
    ctaHref: data.ctaHref ?? null,
    showOverlay: data.showOverlay ?? false,
  };
}

type BannerRow = {
  id: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  showOverlay?: boolean | null;
};

type BannerDelegate = {
  findMany: (args: {
    where: { placement: string; active: boolean };
    orderBy: Array<Record<string, "asc" | "desc">>;
  }) => Promise<BannerRow[]>;
};

export async function getBanners(
  placement: BannerPlacement,
): Promise<BannerView[]> {
  try {
    const model = (prisma as unknown as { banner?: BannerDelegate }).banner;
    if (!model) return DEFAULTS[placement];

    const rows = await model.findMany({
      where: { placement, active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (rows.length === 0) return DEFAULTS[placement];

    return rows.map((r) => ({
      id: r.id,
      eyebrow: r.eyebrow,
      title: r.title,
      subtitle: r.subtitle,
      image: r.image,
      ctaLabel: r.ctaLabel,
      ctaHref: r.ctaHref,
      showOverlay: Boolean(r.showOverlay),
    }));
  } catch {
    return DEFAULTS[placement];
  }
}
