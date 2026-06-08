import { prisma } from "@/lib/prisma";
import { CartProvider } from "@/components/storefront/cart-provider";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <SiteHeader categories={categories} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <SiteFooter categories={categories} />
      </div>
      <MobileNav />
      <CartSheet />
      <Toaster richColors position="top-center" />
    </CartProvider>
  );
}
