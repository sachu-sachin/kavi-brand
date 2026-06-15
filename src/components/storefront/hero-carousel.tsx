"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  showOverlay: boolean;
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

const SWIPE_RATIO = 0.18; // fraction of width to trigger a slide change

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

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
    if (paused || dragging || count <= 1) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next, paused, dragging, count]);

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1) return;
    dragStartX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    setDragPx(e.clientX - dragStartX.current);
  }

  function endDrag() {
    if (dragStartX.current === null) return;
    const width = trackRef.current?.offsetWidth ?? 1;
    const dx = dragPx;
    if (dx < -width * SWIPE_RATIO) next();
    else if (dx > width * SWIPE_RATIO) prev();
    dragStartX.current = null;
    setDragPx(0);
    setDragging(false);
  }

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#2a2118]"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className={`flex ${
          dragging
            ? "cursor-grabbing"
            : "cursor-grab transition-transform duration-700 ease-out"
        }`}
        style={{
          transform: `translateX(calc(${-index * 100}% + ${
            dragging ? dragPx : 0
          }px))`,
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slides.map((s, i) => {
          const theme = THEMES[i % THEMES.length];
          const overlay = s.image && s.showOverlay;
          const showContent = !s.image || s.showOverlay;

          const content = (
            <>
              {s.eyebrow && (
                <span
                  className={`text-[0.7rem] font-bold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.25em] ${
                    s.image ? "text-brand-gold" : theme.accent
                  }`}
                >
                  {s.eyebrow}
                </span>
              )}
              {s.title && (
                <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-[1.08] sm:text-4xl md:mt-4 md:text-6xl md:leading-[1.05]">
                  {s.title}
                </h1>
              )}
              {s.subtitle && (
                <p className="mt-3 max-w-md text-sm text-white/85 sm:mt-5 md:text-base">
                  {s.subtitle}
                </p>
              )}
              {s.ctaLabel && (
                <div className="mt-6 md:mt-8">
                  <Link
                    href={s.ctaHref || "/products"}
                    draggable={false}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:px-7 sm:py-3.5 ${theme.cta}`}
                  >
                    {s.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          );

          return (
            <div
              key={s.id}
              className={`relative w-full shrink-0 ${theme.bg}`}
              aria-hidden={i !== index}
            >
              {s.image ? (
                <>
                  {/* Full banner image — fully visible & responsive on all screens */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title ?? "Promotional banner"}
                    draggable={false}
                    className="block w-full select-none object-contain"
                  />
                  {overlay && (
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/25 to-transparent p-6 text-white duration-700 animate-in fade-in md:p-12">
                      {content}
                    </div>
                  )}
                </>
              ) : (
                showContent && (
                  <div className="mx-auto flex min-h-[340px] max-w-6xl flex-col justify-center px-6 py-12 text-white duration-700 animate-in fade-in slide-in-from-bottom-4 sm:min-h-[420px] md:min-h-[520px] md:py-24">
                    {content}
                  </div>
                )
              )}
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

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-5">
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
