export const BRAND = {
  // Default studio name keyed to the provided artwork
  studioName: 'DayAndNightProductions',

  // Expected hero image path placed under `public/branding/`
  // Drop your artist-drawn hero image at this path to replace the placeholder
  heroImage: '/branding/dayandnight-hero.png',

  // Fallback placeholder shipped in `public/placeholder-hero.svg`
  heroFallback: '/placeholder-hero.svg',
};

export type BrandConfig = typeof BRAND;

