'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't render footer for artist routes - they have their own footer with SiteContext
  if (pathname && pathname.split('/').length >= 2 && pathname !== '/') {
    // Check if this is an artist route (has a slug but isn't an admin/auth/api route)
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    // These are non-artist routes that should have the default footer
    const systemRoutes = [
      'admin', 'auth', 'api', 'dashboard', 'studio', 'feed', 
      'galleries', 'gallery', 'contact', 'commissions', 'signup',
      'terms', 'privacy', 'g'
    ];
    
    if (!systemRoutes.includes(firstSegment)) {
      // This is likely an artist route, don't render footer here
      return null;
    }
  }
  
  // Render footer for non-artist routes
  return <Footer />;
}