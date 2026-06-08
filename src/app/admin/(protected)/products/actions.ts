"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type ProductFormState = { error?: string };

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "Each variant needs an SKU."),
  unitValue: z.coerce
    .number()
    .int("Unit value must be a whole number.")
    .positive("Unit value must be greater than 0."),
  unitType: z.enum(["G", "KG", "ML", "L", "PCS"]),
  price: z.coerce.number().positive("Price must be greater than 0."),
  salePrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().positive("Sale price must be greater than 0.").nullable(),
  ),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  description: z.string().trim().min(1, "Description is required."),
  brand: z.string().trim().min(1).default("Kavi"),
  image: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.string().nullable(),
  ),
  categoryId: z.string().min(1, "Select a category."),
  featured: z.boolean(),
  active: z.boolean(),
  variants: z.array(variantSchema).min(1, "Add at least one variant."),
});

type ParseResult =
  | { ok: true; data: z.infer<typeof productSchema> }
  | { ok: false; error: string };

function parseProductForm(formData: FormData): ParseResult {
  const raw = formData.get("variantsJson");
  let variants: unknown = [];
  try {
    variants = JSON.parse(typeof raw === "string" ? raw : "[]");
  } catch {
    return { ok: false, error: "Invalid variant data." };
  }

  const result = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    brand: formData.get("brand") || "Kavi",
    image: formData.get("image"),
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    variants,
  });

  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Invalid input." };
  }
  return { ok: true, data: result.data };
}

function mapPrismaError(e: unknown): string | null {
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return "A product slug or SKU with that value already exists.";
  if (code === "P2003")
    return "A variant is referenced by an existing order and cannot be removed.";
  return null;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession();
  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const d = parsed.data;

  try {
    await prisma.product.create({
      data: {
        name: d.name,
        slug: slugify(d.name),
        description: d.description,
        brand: d.brand,
        image: d.image,
        categoryId: d.categoryId,
        featured: d.featured,
        active: d.active,
        variants: {
          create: d.variants.map((v) => ({
            sku: v.sku,
            unitValue: v.unitValue,
            unitType: v.unitType,
            price: v.price,
            salePrice: v.salePrice,
            stock: v.stock,
          })),
        },
      },
    });
  } catch (e) {
    const msg = mapPrismaError(e);
    if (msg) return { error: msg };
    throw e;
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession();
  const parsed = parseProductForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const d = parsed.data;
  const keepIds = d.variants
    .map((v) => v.id)
    .filter((v): v is string => Boolean(v));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: d.name,
          slug: slugify(d.name),
          description: d.description,
          brand: d.brand,
          image: d.image,
          categoryId: d.categoryId,
          featured: d.featured,
          active: d.active,
        },
      });

      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          ...(keepIds.length ? { id: { notIn: keepIds } } : {}),
        },
      });

      for (const v of d.variants) {
        const data = {
          sku: v.sku,
          unitValue: v.unitValue,
          unitType: v.unitType,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId: id } });
        }
      }
    });
  } catch (e) {
    const msg = mapPrismaError(e);
    if (msg) return { error: msg };
    throw e;
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireSession();
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    const msg =
      mapPrismaError(e) ?? "This product could not be deleted.";
    redirect(`/admin/products?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
