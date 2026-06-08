"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  id: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  image: string | null; // already-resolved src, or null for gradient
  ctaLabel: string | null;
  ctaHref: string | null;
};

const THEMES = [
  {
    bg: "bg-gradient-to-br from-brand-red via-[#7a0000] to-[#4a0000]",
    accent: "text-brand-gold",
    cta: "bg-white text-brand-red hover:bg-brand-cream",
  },
  {
    bg: "bg-gradient-to-br from-[#caa12a] via-brand-gold to-[#9c7714]",
    accent: "text-[#3a2500]",
    cta: "bg-[#3a2500] text-brand-gold hover:bg-[#241600]",
  },
  {
    bg: "bg-gradient-to-br from-[#2a2118] via-[#3a2e22] to-[#1c1610]",
    accent: "text-brand-gold",
    cta: "bg-brand-gold text-[#2a2118] hover:bg-[#e6c454]",
  },
];

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(count, 1)),
    [count],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % Math.max(count, 1)),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next, paused, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="kavi-carousel-track flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => {
          const theme = THEMES[i % THEMES.length];
          return (
            <div
              key={s.id}
              className={`relative w-full shrink-0 ${theme.bg}`}
              aria-hidden={i !== index}
            >
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="relative mx-auto flex min-h-[460px] max-w-6xl flex-col justify-center px-6 py-16 text-white md:min-h-[540px] md:py-24">
                {s.eyebrow && (
                  <span
                    className={`text-xs font-bold uppercase tracking-[0.25em] ${
                      s.image ? "text-brand-gold" : theme.accent
                    }`}
                  >
                    {s.eyebrow}
                  </span>
                )}
                {s.title && (
                  <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">
                    {s.title}
                  </h1>
                )}
                {s.subtitle && (
                  <p className="mt-5 max-w-md text-sm text-white/85 md:text-base">
                    {s.subtitle}
                  </p>
                )}
                {s.ctaLabel && (
                  <div className="mt-8">
                    <Link
                      href={s.ctaHref || "/products"}
                      className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] ${theme.cta}`}
                    >
                      {s.ctaLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
