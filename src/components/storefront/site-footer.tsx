import Link from "next/link";
import { Phone, Mail, MapPin, FileText, BadgeCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { MasalaDecor } from "./masala-decor";

const NAVIGATION = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track Order" },
];

const INFORMATION = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/returns-refunds", label: "Returns & Refunds" },
  { href: "/shipping", label: "Shipping" },
  { href: "/track-order", label: "Track My Order" },
];

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.582 0 11.94-5.359 11.943-11.893a11.821 11.821 0 0 0-3.416-8.413" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    settings.phone && {
      href: `tel:${settings.phone}`,
      label: "Call us",
      Icon: Phone,
    },
    settings.email && {
      href: `mailto:${settings.email}`,
      label: "Email us",
      Icon: Mail,
    },
    settings.facebook && {
      href: settings.facebook,
      label: "Facebook",
      Icon: IconFacebook,
      external: true,
    },
    settings.instagram && {
      href: settings.instagram,
      label: "Instagram",
      Icon: IconInstagram,
      external: true,
    },
    settings.whatsapp && {
      href: settings.whatsapp,
      label: "WhatsApp",
      Icon: IconWhatsApp,
      external: true,
    },
    settings.youtube && {
      href: settings.youtube,
      label: "YouTube",
      Icon: IconYoutube,
      external: true,
    },
    settings.twitter && {
      href: settings.twitter,
      label: "Twitter",
      Icon: IconX,
      external: true,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: () => React.JSX.Element;
    external?: boolean;
  }[];

  const hasStore = settings.address || settings.phone || settings.email;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-[#2a2118] text-white/70">
      {/* Wavy top edge */}
      <div className="absolute inset-x-0 top-0 -translate-y-[99%] leading-[0]">
        <svg
          viewBox="0 0 1200 70"
          preserveAspectRatio="none"
          className="h-9 w-full sm:h-14"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0,42 C220,84 430,4 660,30 C860,52 1040,72 1200,34 L1200,70 L0,70 Z"
            fill="#2a2118"
          />
        </svg>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,55,0.10),transparent_55%)]"
        aria-hidden="true"
      />
      <MasalaDecor tone="dark" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 pb-12 pt-12 sm:grid-cols-2 lg:grid-cols-12 lg:pt-16">
        {/* Brand + socials + payments + certificates */}
        <div className="lg:col-span-4">
          <p className="font-display text-2xl font-bold text-white">
            {settings.companyName}
          </p>
          {settings.tagline && (
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              {settings.tagline}
            </p>
          )}

          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ href, label, Icon, external }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-brand-gold hover:text-[#2a2118]"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          )}

          {settings.certificates.length > 0 && (
            <div className="mt-8">
              <p className="font-display text-sm font-semibold text-white">
                Certifications
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {settings.certificates.map((c) => (
                  <li key={c.file}>
                    <a
                      href={c.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white/65 transition-colors hover:text-brand-gold"
                    >
                      <FileText className="h-3.5 w-3.5 text-brand-gold" />
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <p className="font-display text-sm font-semibold text-white">
              Secure Payment Methods
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/payment-methods.png"
              alt="Accepted payments: Visa, Mastercard, PayPal, American Express, Visa Electron"
              className="mt-3 h-7 w-auto"
            />
          </div>
        </div>

        {/* Visit our store */}
        {hasStore && (
          <div className="lg:col-span-3">
            <p className="font-display text-base font-semibold text-white">
              Visit our Store
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              {settings.address && (
                <p className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                  <span className="whitespace-pre-line">{settings.address}</span>
                </p>
              )}
              {settings.phone && (
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-brand-gold"
                  >
                    {settings.phone}
                  </a>
                </p>
              )}
              {settings.email && (
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-brand-gold"
                  >
                    {settings.email}
                  </a>
                </p>
              )}
              {settings.fssaiNumber && (
                <p className="flex items-center gap-2.5">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span>FSSAI Lic. No. {settings.fssaiNumber}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="lg:col-span-3">
          <p className="font-display text-base font-semibold text-white">
            Navigation
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAVIGATION.map((m) => (
              <li key={m.label}>
                <Link
                  href={m.href}
                  className="text-white/65 underline-offset-4 transition-colors hover:text-brand-gold hover:underline"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Information */}
        <div className="lg:col-span-2">
          <p className="font-display text-base font-semibold text-white">
            Information
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {INFORMATION.map((m) => (
              <li key={m.label}>
                <Link
                  href={m.href}
                  className="text-white/65 underline-offset-4 transition-colors hover:text-brand-gold hover:underline"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-white/55">
          © {year}{" "}
          <span className="font-semibold text-white/80">
            {settings.companyName}
          </span>
          . All rights reserved. Powered by {settings.companyName}.
        </p>
      </div>
    </footer>
  );
}
