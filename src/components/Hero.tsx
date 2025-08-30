'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BRAND } from '@/config/brand';
import { useTheme } from '@/context/ThemeContext';

export default function Hero() {
  const { accentColor, colorMode } = useTheme();
  const [src, setSrc] = useState(BRAND.heroImage);

  // Swap to fallback if brand image is missing
  useEffect(() => {
    setSrc(BRAND.heroImage);
  }, []);

  const accent400 = `var(--${accentColor}-400)`;
  const accent600 = `var(--${accentColor}-600)`;
  const accent700 = `var(--${accentColor}-700)`;

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Tinted overlay to keep text legible */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            colorMode === 'dark'
              ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3))`
              : `linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.3))`,
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

      <div className="container mx-auto px-4 z-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: accent400 }}>
          {BRAND.studioName}
        </h1>
        <p
          className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          style={{ color: colorMode === 'dark' ? '#e5e7eb' : '#374151' }}
        >
          Artist-run studio for character art, graffiti lettering, and vibrant commissions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/commissions"
            className="text-white font-bold py-3 px-8 rounded-full transition"
            style={{ backgroundColor: accent600 }}
          >
            Commission Us
          </Link>
          <Link
            href="/gallery"
            className="border font-bold py-3 px-8 rounded-full transition"
            style={{ borderColor: accent600, color: accent400 }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = colorMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
            }}
          >
            View Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}

