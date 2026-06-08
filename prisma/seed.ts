import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

type UnitType = "G" | "KG" | "ML" | "L" | "PCS";

const categories = [
  { name: "Spices & Masalas", slug: "spices-masalas" },
  { name: "Cooking Oils", slug: "cooking-oils" },
  { name: "Nuts & Dry Fruits", slug: "nuts-dry-fruits" },
  { name: "Dates", slug: "dates" },
];

type SeedVariant = {
  sku: string;
  unitValue: number;
  unitType: UnitType;
  price: number;
  salePrice?: number;
  stock: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const products: SeedProduct[] = [
  {
    name: "Sambar Powder",
    slug: "sambar-powder",
    categorySlug: "spices-masalas",
    featured: true,
    description:
      "Authentic South Indian sambar powder, stone-ground from sun-dried red chillies, coriander, and toor dal for a rich, aromatic sambar.",
    variants: [
      { sku: "SAMBAR-250", unitValue: 250, unitType: "G", price: 120, salePrice: 99, stock: 50 },
      { sku: "SAMBAR-500", unitValue: 500, unitType: "G", price: 220, stock: 40 },
    ],
  },
  {
    name: "Rasam Powder",
    slug: "rasam-powder",
    categorySlug: "spices-masalas",
    featured: true,
    description:
      "Tangy and peppery rasam powder blended the traditional way with cumin, black pepper, and curry leaves.",
    variants: [
      { sku: "RASAM-250", unitValue: 250, unitType: "G", price: 130, salePrice: 110, stock: 60 },
      { sku: "RASAM-500", unitValue: 500, unitType: "G", price: 240, stock: 30 },
    ],
  },
  {
    name: "Turmeric Powder",
    slug: "turmeric-powder",
    categorySlug: "spices-masalas",
    description:
      "Pure Salem turmeric powder with high curcumin content. Vibrant colour, earthy aroma, no additives.",
    variants: [
      { sku: "TURMERIC-100", unitValue: 100, unitType: "G", price: 70, stock: 80 },
      { sku: "TURMERIC-250", unitValue: 250, unitType: "G", price: 150, salePrice: 135, stock: 55 },
    ],
  },
  {
    name: "Red Chilli Powder",
    slug: "red-chilli-powder",
    categorySlug: "spices-masalas",
    description:
      "Fiery Guntur red chilli powder, sun-dried and finely milled for deep colour and bold heat.",
    variants: [
      { sku: "CHILLI-250", unitValue: 250, unitType: "G", price: 140, stock: 45 },
      { sku: "CHILLI-500", unitValue: 500, unitType: "G", price: 260, salePrice: 235, stock: 25 },
    ],
  },
  {
    name: "Cold-Pressed Coconut Oil",
    slug: "cold-pressed-coconut-oil",
    categorySlug: "cooking-oils",
    featured: true,
    description:
      "Chekku (cold-pressed) coconut oil extracted from sun-dried copra. Unrefined, chemical-free, with a natural coconut aroma.",
    variants: [
      { sku: "COCO-OIL-500", unitValue: 500, unitType: "ML", price: 260, salePrice: 240, stock: 35 },
      { sku: "COCO-OIL-1L", unitValue: 1, unitType: "L", price: 480, stock: 20 },
    ],
  },
  {
    name: "Gingelly (Sesame) Oil",
    slug: "gingelly-sesame-oil",
    categorySlug: "cooking-oils",
    description:
      "Traditional wood-pressed gingelly oil, ideal for South Indian cooking, pickles, and oil baths.",
    variants: [
      { sku: "GINGELLY-500", unitValue: 500, unitType: "ML", price: 290, stock: 30 },
      { sku: "GINGELLY-1L", unitValue: 1, unitType: "L", price: 540, salePrice: 499, stock: 18 },
    ],
  },
  {
    name: "Premium Cashews (W320)",
    slug: "premium-cashews-w320",
    categorySlug: "nuts-dry-fruits",
    featured: true,
    description:
      "Whole grade W320 cashews, creamy and crunchy. Hand-sorted, no broken pieces.",
    variants: [
      { sku: "CASHEW-250", unitValue: 250, unitType: "G", price: 320, salePrice: 289, stock: 40 },
      { sku: "CASHEW-500", unitValue: 500, unitType: "G", price: 600, stock: 22 },
    ],
  },
  {
    name: "California Almonds",
    slug: "california-almonds",
    categorySlug: "nuts-dry-fruits",
    description:
      "Premium California almonds, rich in protein and vitamin E. Crunchy, naturally sweet.",
    variants: [
      { sku: "ALMOND-250", unitValue: 250, unitType: "G", price: 260, stock: 50 },
      { sku: "ALMOND-500", unitValue: 500, unitType: "G", price: 490, salePrice: 459, stock: 28 },
    ],
  },
  {
    name: "Medjool Dates",
    slug: "medjool-dates",
    categorySlug: "dates",
    featured: true,
    description:
      "Large, soft Medjool dates with a caramel-like sweetness. Naturally rich in fibre and minerals.",
    variants: [
      { sku: "MEDJOOL-250", unitValue: 250, unitType: "G", price: 280, salePrice: 249, stock: 33 },
      { sku: "MEDJOOL-500", unitValue: 500, unitType: "G", price: 520, stock: 19 },
    ],
  },
  {
    name: "Seedless Dates",
    slug: "seedless-dates",
    categorySlug: "dates",
    description:
      "Everyday seedless dates, soft and ready to eat. Perfect for snacking, shakes, and sweets.",
    variants: [
      { sku: "DATES-500", unitValue: 500, unitType: "G", price: 180, stock: 60 },
      { sku: "DATES-1KG", unitValue: 1, unitType: "KG", price: 340, salePrice: 309, stock: 25 },
    ],
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categoryIdBySlug.set(c.slug, category.id);
  }

  console.log("Seeding products and variants...");
  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Missing category: ${p.categorySlug}`);

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId,
        featured: p.featured ?? false,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId,
        featured: p.featured ?? false,
      },
    });

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          unitValue: v.unitValue,
          unitType: v.unitType,
          price: v.price,
          salePrice: v.salePrice ?? null,
          stock: v.stock,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          unitValue: v.unitValue,
          unitType: v.unitType,
          price: v.price,
          salePrice: v.salePrice ?? null,
          stock: v.stock,
        },
      });
    }
  }

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    console.log("Seeding a demo order...");
    const v1 = await prisma.productVariant.findUnique({
      where: { sku: "SAMBAR-250" },
    });
    const v2 = await prisma.productVariant.findUnique({
      where: { sku: "COCO-OIL-500" },
    });

    if (v1 && v2) {
      const customer = await prisma.customer.upsert({
        where: { email: "demo.customer@example.com" },
        update: {},
        create: {
          name: "Demo Customer",
          email: "demo.customer@example.com",
          phone: "9876543210",
          addresses: {
            create: {
              line1: "12 Gandhi Street",
              city: "Chennai",
              state: "Tamil Nadu",
              pincode: "600001",
            },
          },
        },
        include: { addresses: true },
      });

      const price1 = Number((v1.salePrice ?? v1.price).toString());
      const price2 = Number((v2.salePrice ?? v2.price).toString());
      const qty1 = 2;
      const qty2 = 1;

      await prisma.order.create({
        data: {
          customerId: customer.id,
          addressId: customer.addresses[0]?.id,
          total: price1 * qty1 + price2 * qty2,
          paymentStatus: "PAID",
          orderStatus: "PAID",
          razorpayOrderId: "order_demo_seed_0001",
          razorpayPaymentId: "pay_demo_seed_0001",
          items: {
            create: [
              { variantId: v1.id, qty: qty1, price: price1 },
              { variantId: v2.id, qty: qty2, price: price2 },
            ],
          },
          statusHistory: {
            create: [
              { status: "PENDING", note: "Order created." },
              { status: "PAID", note: "Payment captured (seed)." },
            ],
          },
        },
      });
    }
  }

  const [categoryCount, productCount, variantCount, orderCount] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.order.count(),
    ]);
  console.log(
    `Seed complete: ${categoryCount} categories, ${productCount} products, ${variantCount} variants, ${orderCount} orders.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
