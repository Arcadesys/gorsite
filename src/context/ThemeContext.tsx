'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccentColor = 'pink' | 'purple' | 'blue' | 'green' | 'orange';
export type ColorMode = 'dark' | 'light';

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default accent keyed to the neon green/cyan hero
  const [accentColor, setAccentColor] = useState<AccentColor>('green');
  const [colorMode, setColorMode] = useState<ColorMode>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme from localStorage on client side
  useEffect(() => {
    // Check for system preference first
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultMode = prefersDark ? 'dark' : 'light';
    
    const savedColor = localStorage.getItem('accentColor') as AccentColor;
    const savedMode = localStorage.getItem('colorMode') as ColorMode;
    
    if (savedColor) {
      setAccentColor(savedColor);
    }
    
    if (savedMode) {
      setColorMode(savedMode);
    } else {
      setColorMode(defaultMode);
    }
    
    setIsHydrated(true);
  }, []);

  // Save theme changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('colorMode', colorMode);
    
    // Apply color mode to document
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [accentColor, colorMode, isHydrated]);

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      accentColor, 
      setAccentColor, 
      colorMode, 
      setColorMode,
      toggleColorMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to get color classes based on the current theme
export function getColorClasses(accentColor: AccentColor) {
  const colorMap = {
    pink: {
      primary: 'pink-600',
      primaryHover: 'pink-700',
      secondary: 'pink-400',
      secondaryHover: 'pink-300',
      gradient: 'from-pink-900',
      border: 'pink-800',
      ring: 'pink-500',
      shadow: 'pink-500/20',
      // Light mode variants
      lightPrimary: 'pink-500',
      lightPrimaryHover: 'pink-600',
      lightSecondary: 'pink-600',
      lightSecondaryHover: 'pink-700',
      lightGradient: 'from-pink-100',
      lightBorder: 'pink-200',
      lightRing: 'pink-400',
      lightShadow: 'pink-400/20',
    },
    purple: {
      primary: 'purple-600',
      primaryHover: 'purple-700',
      secondary: 'purple-400',
      secondaryHover: 'purple-300',
      gradient: 'from-purple-900',
      border: 'purple-800',
      ring: 'purple-500',
      shadow: 'purple-500/20',
      // Light mode variants
      lightPrimary: 'purple-500',
      lightPrimaryHover: 'purple-600',
      lightSecondary: 'purple-600',
      lightSecondaryHover: 'purple-700',
      lightGradient: 'from-purple-100',
      lightBorder: 'purple-200',
      lightRing: 'purple-400',
      lightShadow: 'purple-400/20',
    },
    blue: {
      primary: 'blue-600',
      primaryHover: 'blue-700',
      secondary: 'blue-400',
      secondaryHover: 'blue-300',
      gradient: 'from-blue-900',
      border: 'blue-800',
      ring: 'blue-500',
      shadow: 'blue-500/20',
      // Light mode variants
      lightPrimary: 'blue-500',
      lightPrimaryHover: 'blue-600',
      lightSecondary: 'blue-600',
      lightSecondaryHover: 'blue-700',
      lightGradient: 'from-blue-100',
      lightBorder: 'blue-200',
      lightRing: 'blue-400',
      lightShadow: 'blue-400/20',
    },
    green: {
      primary: 'emerald-600',
      primaryHover: 'emerald-700',
      secondary: 'emerald-400',
      secondaryHover: 'emerald-300',
      gradient: 'from-emerald-900',
      border: 'emerald-800',
      ring: 'emerald-500',
      shadow: 'emerald-500/20',
      // Light mode variants
      lightPrimary: 'emerald-500',
      lightPrimaryHover: 'emerald-600',
      lightSecondary: 'emerald-600',
      lightSecondaryHover: 'emerald-700',
      lightGradient: 'from-emerald-100',
      lightBorder: 'emerald-200',
      lightRing: 'emerald-400',
      lightShadow: 'emerald-400/20',
    },
    orange: {
      primary: 'orange-600',
      primaryHover: 'orange-700',
      secondary: 'orange-400',
      secondaryHover: 'orange-300',
      gradient: 'from-orange-900',
      border: 'orange-800',
      ring: 'orange-500',
      shadow: 'orange-500/20',
      // Light mode variants
      lightPrimary: 'orange-500',
      lightPrimaryHover: 'orange-600',
      lightSecondary: 'orange-600',
      lightSecondaryHover: 'orange-700',
      lightGradient: 'from-orange-100',
      lightBorder: 'orange-200',
      lightRing: 'orange-400',
      lightShadow: 'orange-400/20',
    },
  };

  return colorMap[accentColor];
} 
