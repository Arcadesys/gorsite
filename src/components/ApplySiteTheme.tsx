'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useSite } from '@/context/SiteContext';

export default function ApplySiteTheme() {
  const site = useSite();
  const { setAccentColor, setColorMode } = useTheme();

  useEffect(() => {
    if (!site) return;
    if (site.accentColor) {
      // @ts-ignore - runtime safety ensured by allowed union
      setAccentColor(site.accentColor);
    }
    if (site.colorMode) {
      // @ts-ignore
      setColorMode(site.colorMode);
    }
  }, [site, setAccentColor, setColorMode]);

  return null;
}

