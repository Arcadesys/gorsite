'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BRAND } from '@/config/brand';
import { useTheme } from '@/context/ThemeContext';

export default function Hero() {
  const { colorMode } = useTheme();
  // Choose hero by mode; default to dark image if unknown
  const desiredSrc = colorMode === 'light' ? BRAND.heroImageLight : BRAND.heroImageDark;
  const [src, setSrc] = useState(desiredSrc);

  // Keep src in sync with mode changes
  useEffect(() => {
    setSrc(desiredSrc);
  }, [desiredSrc]);

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Subtle overlay for mood */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            colorMode === 'dark'
              ? `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.2))`
              : `linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0.15))`,
        }}
      />

      <Image
        src={src}
        onError={() => setSrc(BRAND.heroFallback)}
        alt={`${BRAND.studioName} hero`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Removed on-image text; content moved below in the home page */}
    </section>
  );
}

