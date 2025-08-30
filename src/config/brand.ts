export const BRAND = {
  // Default studio name keyed to the provided artwork
  studioName: 'DayAndNightProductions',

  // Hero imagery (placed under `public/branding/`)
  // If these look swapped, just flip the assignments below.
  heroImageLight: '/branding/E3DFE74D-6C94-446D-9969-7DAD721D30DD.png',
  heroImageDark: '/branding/780B1165-4225-48E1-B5E1-CBE02A3A1891.png',

  // Backward compatibility (unused by new Hero but kept to avoid breaking imports)
  // Points to the dark image by default
  heroImage: '/branding/780B1165-4225-48E1-B5E1-CBE02A3A1891.png',

  // Fallback placeholder shipped in `public/placeholder-hero.svg`
  heroFallback: '/placeholder-hero.svg',
};

export type BrandConfig = typeof BRAND;

