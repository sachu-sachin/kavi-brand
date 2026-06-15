import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BannerForm } from "../_components/banner-form";
import { updateBanner } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit banner</h1>
        <Button
          render={<Link href="/admin/banners" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      <BannerForm
        action={updateBanner.bind(null, banner.id)}
        submitLabel="Save changes"
        defaults={{
          placement: banner.placement,
          title: banner.title ?? "",
          eyebrow: banner.eyebrow ?? "",
          subtitle: banner.subtitle ?? "",
          image: banner.image ?? "",
          ctaLabel: banner.ctaLabel ?? "",
          ctaHref: banner.ctaHref ?? "",
          sortOrder: banner.sortOrder,
          showOverlay:
            (banner as { showOverlay?: boolean }).showOverlay ?? false,
          active: banner.active,
        }}
      />
    </div>
  );
}
