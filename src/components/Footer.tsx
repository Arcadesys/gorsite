'use client';

import Link from 'next/link';
import { FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/config/brand';
import { useSite } from '@/context/SiteContext';

export default function Footer() {
  const { accentColor, colorMode } = useTheme();
  const site = useSite();

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
    <footer 
      className={`${colorMode === 'dark' ? 'bg-black' : 'bg-white'} py-12`} 
      style={{ borderTop: `1px solid ${getBorderColor()}` }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link 
              href="/" 
              className="font-bold text-xl"
              style={{ color: getTextColor() }}
            >
              {site?.displayName || BRAND.studioName}
            </Link>
            <p className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
              Digital Artist & Illustrator
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <div className="flex space-x-4">
              {[
                { icon: <FaTwitter size={24} />, url: 'https://x.com/KARMAKAIJU1', label: 'X (Twitter)' },
                { icon: <SiBluesky size={22} />, url: 'https://bsky.app/profile/dayandnightmags.bsky.social', label: 'Bluesky' },
                { icon: <FaInstagram size={24} />, url: 'https://instagram.com', label: 'Instagram' },
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition`}
                  aria-label={social.label}
                  onMouseOver={(e) => (e.currentTarget.style.color = getTextColor())}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <Link 
              href="/contact" 
              className="flex items-center gap-2 transition"
              style={{ color: getTextColor() }}
              onMouseOver={(e) => (e.currentTarget.style.color = getHoverTextColor())}
              onMouseOut={(e) => (e.currentTarget.style.color = getTextColor())}
            >
              <FaEnvelope />
              <span>Contact Me</span>
            </Link>
          </div>
        </div>
        
        <div className={`border-t ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-8 text-center ${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
          <p>&copy; {new Date().getFullYear()} {site?.displayName || BRAND.studioName}. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link 
              href="/terms" 
              className={`${colorMode === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'} transition`}
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className={`${colorMode === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-600'} transition`}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
