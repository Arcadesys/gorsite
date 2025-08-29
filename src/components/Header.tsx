'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/config/brand';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { accentColor, colorMode } = useTheme();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

  return (
    <header 
      className={`${colorMode === 'dark' ? 'bg-black' : 'bg-white shadow-sm'} sticky top-0 z-40`} 
      style={{ borderBottom: `1px solid ${getBorderColor()}` }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="font-bold text-xl transition"
            style={{ color: getTextColor() }}
            onMouseOver={(e) => (e.currentTarget.style.color = getHoverTextColor())}
            onMouseOut={(e) => (e.currentTarget.style.color = getTextColor())}
          >
            {BRAND.studioName}
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Gallery', 'Commissions', 'Social Feed', 'Contact'].map((item) => (
              <Link 
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition`}
                onMouseOver={(e) => (e.currentTarget.style.color = getTextColor())}
                onMouseOut={(e) => (e.currentTarget.style.color = '')}
              >
                {item}
              </Link>
            ))}
          </nav>
          
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
            {['Home', 'Gallery', 'Commissions', 'Social Feed', 'Contact'].map((item) => (
              <Link 
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition`}
                onClick={() => setMobileMenuOpen(false)}
                onMouseOver={(e) => (e.currentTarget.style.color = getTextColor())}
                onMouseOut={(e) => (e.currentTarget.style.color = '')}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 
