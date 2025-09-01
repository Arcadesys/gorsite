'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlaceholderArtProps {
  width?: number;
  height?: number;
  className?: string;
  // Optional: choose which pool to draw from
  variant?: 'all' | 'cats' | 'shapes';
}

export default function PlaceholderArt({ 
  width = 400, 
  height = 400, 
  className = '',
  variant = 'all',
}: PlaceholderArtProps) {
  const [placeholderSrc, setPlaceholderSrc] = useState('/placeholder-cat1.svg');
  
  useEffect(() => {
    // Pools of placeholders
    const catSvgs = [
      '/placeholder-cat1.svg',
      '/placeholder-cat2.svg',
      '/placeholder-cat3.svg',
      '/placeholder-cat4.svg'
    ];

    const shapeSvgs = [
      '/placeholder-shape1.svg',
      '/placeholder-shape2.svg',
      '/placeholder-shape3.svg',
      '/placeholder-shape4.svg',
      '/placeholder-shape5.svg',
      '/placeholder-shape6.svg',
      '/placeholder-shape7.svg',
      '/placeholder-shape8.svg',
    ];

    const pool = variant === 'cats' ? catSvgs : variant === 'shapes' ? shapeSvgs : [...catSvgs, ...shapeSvgs];
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    setPlaceholderSrc(pool[randomIndex]);
  }, [variant]);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image 
        src={placeholderSrc}
        alt="Placeholder artwork" 
        width={width} 
        height={height}
        className="object-cover rounded-lg"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center text-sm">
        Placeholder Art
      </div>
    </div>
  );
} 
