'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import ArtistBadge from '@/components/ArtistBadge';

type Gallery = { 
  id: string; 
  name: string; 
  slug: string; 
  description?: string | null; 
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    portfolios?: {
      slug: string;
      displayName: string;
      profileImageUrl?: string | null;
    }[];
  };
};

export default function GalleriesIndex() {
  const { accentColor, colorMode } = useTheme();
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/public/galleries');
      if (res.ok) setGalleries(await res.json());
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative py-20" style={{ background: `linear-gradient(to bottom, var(--${accentColor === 'green' ? 'emerald' : accentColor}-900), ${colorMode === 'dark' ? '#000' : '#fff'})` }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>
            Galleries
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Explore curated collections: tattoo designs, furry art, and more.</p>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No public galleries yet.</div>
          ) : (
            galleries.map((g) => (
              <Link key={g.id} href={`/g/${g.slug}`} className="rounded-lg overflow-hidden shadow-lg transition block" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: `var(--${accentColor === 'green' ? 'emerald' : accentColor}-400)` }}>{g.name}</h3>
                  <p className={colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{g.description || 'A curated collection of works.'}</p>
                  
                  {/* Artist Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <ArtistBadge user={g.user} size="sm" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

