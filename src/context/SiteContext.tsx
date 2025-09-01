'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';

export type SiteData = {
  slug: string;
  displayName: string;
  description?: string | null;
  accentColor?: 'pink' | 'purple' | 'blue' | 'green' | 'orange';
  colorMode?: 'dark' | 'light';
  logoUrl?: string | null;
  heroImageLight?: string | null;
  heroImageDark?: string | null;
  heroImageMobile?: string | null;
  about?: string | null;
  // galleries for nav/menu
  galleries?: { slug: string; name: string }[];
};

const SiteContext = createContext<SiteData | null>(null);

export function SiteProvider({ value, children }: { value: SiteData; children: ReactNode }) {
  const memo = useMemo(() => value, [value]);
  return <SiteContext.Provider value={memo}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
