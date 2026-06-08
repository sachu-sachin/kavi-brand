import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { assertServerEnv } from "@/lib/env";
import "./globals.css";

assertServerEnv();

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kavi — Authentic South Indian Foods",
    template: "%s | Kavi",
  },
  description:
    "Stone-ground spices, cold-pressed oils, premium nuts, and dates. Delivered fresh across India.",
  openGraph: {
    type: "website",
    siteName: "Kavi Foods",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
