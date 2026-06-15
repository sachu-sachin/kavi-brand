import { CartProvider } from "@/components/storefront/cart-provider";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { WhatsappWidget } from "@/components/storefront/whatsapp-widget";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <SiteHeader settings={settings} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <SiteFooter settings={settings} />
      </div>
      <MobileNav />
      <WhatsappWidget whatsapp={settings?.whatsapp} />
      <CartSheet />
      <Toaster richColors position="top-center" />
    </CartProvider>
  );
}
