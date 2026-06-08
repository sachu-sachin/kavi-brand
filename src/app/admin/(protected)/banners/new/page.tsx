import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BannerForm } from "../_components/banner-form";
import { createBanner } from "../actions";

export const dynamic = "force-dynamic";

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add banner</h1>
        <Button
          render={<Link href="/admin/banners" />}
          nativeButton={false}
          variant="outline"
        >
          Back
        </Button>
      </div>

      <BannerForm action={createBanner} submitLabel="Create banner" />
    </div>
  );
}
