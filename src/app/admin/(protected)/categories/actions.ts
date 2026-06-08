"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
});

export type CategoryFormState = { error?: string };

function isUniqueError(e: unknown): boolean {
  return (e as { code?: string })?.code === "P2002";
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireSession();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }
  const name = parsed.data.name;

  try {
    await prisma.category.create({ data: { name, slug: slugify(name) } });
  } catch (e) {
    if (isUniqueError(e)) {
      return { error: "A category with that name already exists." };
    }
    throw e;
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireSession();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }
  const name = parsed.data.name;

  try {
    await prisma.category.update({
      where: { id },
      data: { name, slug: slugify(name) },
    });
  } catch (e) {
    if (isUniqueError(e)) {
      return { error: "A category with that name already exists." };
    }
    throw e;
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireSession();
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    redirect(
      `/admin/categories?error=${encodeURIComponent(
        "Cannot delete a category that still has products.",
      )}`,
    );
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
