'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlaceholderArtProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function PlaceholderArt({ 
  width = 400, 
  height = 400, 
  className = '' 
}: PlaceholderArtProps) {
  const [placeholderSrc, setPlaceholderSrc] = useState('/placeholder-cat1.svg');
  
  useEffect(() => {
    // Randomly select one of our cat SVGs
    const catSvgs = [
      '/placeholder-cat1.svg',
      '/placeholder-cat2.svg',
      '/placeholder-cat3.svg',
      '/placeholder-cat4.svg'
    ];
    
    const randomIndex = Math.floor(Math.random() * catSvgs.length);
    setPlaceholderSrc(catSvgs[randomIndex]);
  }, []);
  
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