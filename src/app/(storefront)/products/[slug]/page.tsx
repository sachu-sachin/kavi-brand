import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUnit } from "@/lib/format";
import {
  defaultVariant,
  variantPricing,
} from "@/lib/product-display";
import {
  ProductPurchase,
  type PurchaseVariant,
} from "@/components/storefront/product-purchase";
import { JsonLd } from "@/components/storefront/json-ld";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.image ? [`/products/${product.image}`] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { unitValue: "asc" } },
    },
  });

  if (!product || !product.active) notFound();

  const dv = defaultVariant(product.variants);
  if (!dv) notFound();

  const purchaseVariants: PurchaseVariant[] = product.variants.map((v) => ({
    id: v.id,
    unitLabel: formatUnit(v.unitValue, v.unitType),
    ...variantPricing(v),
    stock: v.stock,
  }));

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category.name,
    image: product.image ? [`${siteUrl}/products/${product.image}`] : undefined,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      priceCurrency: "INR",
      price: variantPricing(v).effective,
      availability:
        v.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.slug}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `${siteUrl}/category/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand-red">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-brand-red"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-brand-cream">
          <div className="relative aspect-square">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/products/${product.image}`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-cream to-brand-gold/20">
                <span className="font-display text-8xl text-brand-red/30">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            {product.brand}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <ProductPurchase
              productSlug={product.slug}
              productName={product.name}
              image={product.image}
              variants={purchaseVariants}
              defaultVariantId={dv.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
