"use client";

import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

type Banner = Pick<import("@/types").Banner, "id" | "image_url" | "link">;

/**
 * Images are lazy rather than `priority`. The homepage renders both the desktop and the mobile
 * set and hides one with CSS, but `priority` emits a <link rel="preload"> that fires regardless
 * of `display:none` — so every visit preloaded ~55 KB for the breakpoint it would never show.
 * Lazy lets the browser skip the hidden set entirely; the visible one loads on layout instead of
 * via preload, which trades a little LCP latency for markedly less bandwidth contention.
 *
 * The clean fix is a single responsive banner set, but desktop/mobile are separate sets by
 * design in the admin, so that is a content decision rather than a code one.
 */
export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden md:rounded-xl lg:rounded-2xl aspect-5/2 md:aspect-6/1">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {banners.map((b, i) => (
            <div key={b.id} className="relative flex-[0_0_100%] h-full">
              {b.link ? (
                <Link href={b.link} className="block w-full h-full">
                  <Image
                    src={b.image_url}
                    alt={`Баннер ${i + 1}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </Link>
              ) : (
                <Image
                  src={b.image_url}
                  alt={`Баннер ${i + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <div className="md:hidden">
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" />
            <Button
              onClick={scrollPrev}
              aria-label="Предыдущий баннер"
              className="absolute left-0 top-0 w-1/2 h-full"
            />
            <Button
              onClick={scrollNext}
              aria-label="Следующий баннер"
              className="absolute right-0 top-0 w-1/2 h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-2 pb-2">
              {banners.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full bg-white/40 overflow-hidden">
                  {i < selected && <div className="h-full w-full bg-green-600" />}
                  {i === selected && <div key={selected} className="h-full bg-green-600 animate-banner-progress" />}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <Button
              onClick={scrollPrev}
              aria-label="Предыдущий баннер"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              onClick={scrollNext}
              aria-label="Следующий баннер"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="size-4" />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <Button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Баннер ${i + 1} из ${banners.length}`}
                  aria-current={i === selected ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${i === selected ? "bg-white w-4" : "bg-white/50 w-2"}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
