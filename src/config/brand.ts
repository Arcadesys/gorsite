export const BRAND = {
  // Default studio name keyed to the provided artwork
  studioName: 'DayAndNightProductions',

  // Expected hero image path placed under `public/branding/`
  // TODO: Replace with your real image at `/public/branding/dayandnight-hero.png` and update this path.
  // Until then, default to the placeholder to avoid 404 noise in dev.
  heroImage: '/placeholder-hero.svg',

  // Fallback placeholder shipped in `public/placeholder-hero.svg`
  heroFallback: '/placeholder-hero.svg',
};

export type BrandConfig = typeof BRAND;

