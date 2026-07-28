"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Autoplay, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

function ImageGallery({ images, title }: ImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center rounded-xl bg-muted">
        <span className="text-sm text-muted-foreground">
          No image available
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Swiper
          loop
          spaceBetween={32}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Navigation, Thumbs, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="aspect-square rounded-xl overflow-hidden bg-muted"
        >
          {images.map((url, i) => (
            <SwiperSlide key={url}>
              <div className="relative h-full w-full">
                <Image
                  src={url}
                  alt={`${title} - ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm text-foreground hover:bg-white transition-all"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm text-foreground hover:bg-white transition-all"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-full">
        <Swiper
          onSwiper={setThumbsSwiper}
          loop
          spaceBetween={12}
          slidesPerView={4}
          watchSlidesProgress
          modules={[Thumbs]}
          className="thumb-gallery"
          breakpoints={{
            0: { slidesPerView: 3, spaceBetween: 8 },
            640: { slidesPerView: 4, spaceBetween: 12 },
          }}
        >
          {images.map((url, i) => (
            <SwiperSlide key={url} className="h-auto!">
              {({ isActive }) => (
                <div
                  className={cn(
                    "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 hover:border-primary",
                    isActive ? "border-primary" : "border-border",
                  )}
                >
                  <Image
                    src={url}
                    alt={`${title} - ${i + 1} preview`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ImageGallery;
