"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export type BannerFormState = { error?: string };

const optionalString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().trim().nullable(),
);

const bannerSchema = z.object({
  placement: z.enum(["HERO", "ANNOUNCEMENT", "PROMO", "FESTIVE"], {
    message: "Choose where this banner appears.",
  }),
  title: z.string().trim().min(1, "A title (or message) is required."),
  eyebrow: optionalString,
  subtitle: optionalString,
  image: optionalString,
  ctaLabel: optionalString,
  ctaHref: optionalString,
  sortOrder: z.coerce.number().int().min(0, "Order cannot be negative."),
  active: z.boolean(),
});

type ParseResult =
  | { ok: true; data: z.infer<typeof bannerSchema> }
  | { ok: false; error: string };

function parseForm(formData: FormData): ParseResult {
  const result = bannerSchema.safeParse({
    placement: formData.get("placement"),
    title: formData.get("title"),
    eyebrow: formData.get("eyebrow"),
    subtitle: formData.get("subtitle"),
    image: formData.get("image"),
    ctaLabel: formData.get("ctaLabel"),
    ctaHref: formData.get("ctaHref"),
    sortOrder: formData.get("sortOrder") || 0,
    active: formData.get("active") === "on",
  });

  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Invalid input." };
  }
  return { ok: true, data: result.data };
}

export async function createBanner(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await prisma.banner.create({ data: parsed.data });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function updateBanner(
  id: string,
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await prisma.banner.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(id: string): Promise<void> {
  await requireSession();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}
