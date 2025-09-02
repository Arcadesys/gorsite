'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/config/brand';
import { useSite } from '@/context/SiteContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { accentColor, colorMode } = useTheme();
  const site = useSite();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if we're on the home route (not on portfolio slugs)
  const isHomeRoute = pathname === '/';

  // Get border color based on mode
  const getBorderColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-800)`;
    } else {
      return `var(--${accentColor}-200)`;
    }
  };

  // Get text color based on mode
  const getTextColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-400)`;
    } else {
      return `var(--${accentColor}-600)`;
    }
  };

  // Get hover text color based on mode
  const getHoverTextColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-300)`;
    } else {
      return `var(--${accentColor}-700)`;
    }
  };

  // If artist site, build dynamic nav: Home + per-artist galleries + Commissions
  const artistNav = site
    ? [
        { label: 'Home', href: `/${site.slug}` },
        ...((site.galleries || []).map((g) => ({ label: g.name, href: `/${site.slug}/${g.slug}` }))),
        { label: 'Commissions', href: `/${site.slug}/commissions` },
      ]
    : undefined;

  // Prevent hydration mismatch by not rendering interactive content until client-side
  if (!isClient) {
    return (
      <header className="bg-black sticky top-0 z-40 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-green-400">
              {site?.displayName || BRAND.studioName}
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                {/* Static nav items for SSR */}
                <span className="text-gray-300">Home</span>
                <span className="text-gray-300">Galleries</span>
                <span className="text-gray-300">Commissions</span>
                <span className="text-gray-300">Contact</span>
              </nav>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <FaSignInAlt size={16} className="text-gray-300" />
                <span className="font-medium text-gray-300">Login</span>
              </div>
            </div>
            <button className="md:hidden text-gray-300">
              <FaBars size={24} />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`${colorMode === 'dark' ? 'bg-black' : 'bg-white shadow-sm'} sticky top-0 z-40`} 
      style={{ borderBottom: `1px solid ${getBorderColor()}` }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href={site ? `/${site.slug}` : "/"} 
            className="font-bold text-xl transition"
            style={{ color: getTextColor() }}
            onMouseOver={(e) => (e.currentTarget.style.color = getHoverTextColor())}
            onMouseOut={(e) => (e.currentTarget.style.color = getTextColor())}
          >
            {site?.displayName || BRAND.studioName}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              {(artistNav || ['Home', 'Galleries', 'Commissions', 'Contact']).map((item: any) => {
                const key = typeof item === 'string' ? item : item.label;
                const href = typeof item === 'string'
                  ? (item === 'Home' ? (site ? `/${site.slug}` : '/') : `/${item.toLowerCase().replace(' ', '-')}`)
                  : item.href;
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition`}
                    onMouseOver={(e) => (e.currentTarget.style.color = getTextColor())}
                    onMouseOut={(e) => (e.currentTarget.style.color = '')}
                  >
                    {typeof item === 'string' ? item : item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Login Button - Show on all pages */}
            <Link
              href="/admin/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                colorMode === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
              } border`}
              style={{ 
                borderColor: getBorderColor(),
                '--hover-border-color': getTextColor()
              } as React.CSSProperties}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = getTextColor();
                e.currentTarget.style.color = getHoverTextColor();
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = getBorderColor();
                e.currentTarget.style.color = '';
              }}
            >
              <FaSignInAlt size={16} />
              <span className="font-medium">Login</span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden ${colorMode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div 
          className={`md:hidden ${colorMode === 'dark' ? 'bg-black' : 'bg-white'} py-4`} 
          style={{ borderTop: `1px solid ${getBorderColor()}` }}
        >
          <nav className="container mx-auto px-4 flex flex-col space-y-4">
            {(artistNav || ['Home', 'Galleries', 'Commissions', 'Contact']).map((item: any) => {
              const key = typeof item === 'string' ? item : item.label;
              const href = typeof item === 'string'
                ? (item === 'Home' ? (site ? `/${site.slug}` : '/') : `/${item.toLowerCase().replace(' ', '-')}`)
                : item.href;
              return (
                <Link
                  key={key}
                  href={href}
                  className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition`}
                  onClick={() => setMobileMenuOpen(false)}
                  onMouseOver={(e) => (e.currentTarget.style.color = getTextColor())}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  {typeof item === 'string' ? item : item.label}
                </Link>
              );
            })}
            
            {/* Mobile Login Button - Show on all pages */}
            <Link
              href="/admin/login"
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                colorMode === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
              } border mt-4`}
              style={{ borderColor: getBorderColor() }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = getTextColor();
                e.currentTarget.style.color = getHoverTextColor();
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = getBorderColor();
                e.currentTarget.style.color = '';
              }}
            >
              <FaSignInAlt size={16} />
              <span className="font-medium">Login</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 
