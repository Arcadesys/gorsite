'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaClipboardList, FaPalette, FaCog, FaSignOutAlt, FaCalendar } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/config/brand';

// Pages that don't use the admin layout
const excludedPaths = ['/admin/login'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // TODO: Add Supabase authentication logic here if needed
  const { accentColor, colorMode } = useTheme();

  // Don't show the admin layout for login page
  if (excludedPaths.includes(pathname || '')) {
    return <>{children}</>;
  }

  // ...existing code...

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <FaHome size={20} /> },
    { name: 'Commissions', href: '/admin/commissions', icon: <FaClipboardList size={20} /> },
    { name: 'Calendar', href: '/admin/calendar', icon: <FaCalendar size={20} /> },
    { name: 'Gallery', href: '/admin/gallery', icon: <FaPalette size={20} /> },
    { name: 'Settings', href: '/admin/config', icon: <FaCog size={20} /> },
  ];

  // TODO: Implement sign out with Supabase if needed
  const handleSignOut = async () => {
    // sign out logic here
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`w-64 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-r ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex-shrink-0 hidden md:block`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link 
            href="/admin/dashboard" 
            className="text-xl font-bold"
            style={{ color: `var(--${accentColor}-400)` }}
          >
            {BRAND.studioName} Admin
          </Link>
        </div>
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? `text-white`
                      : `${colorMode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                  style={{
                    backgroundColor: isActive ? `var(--${accentColor}-600)` : '',
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* TODO: Add user info and sign out button with Supabase */}
        </nav>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10">
        <div className={`h-16 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-b ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between px-4`}>
          <Link 
            href="/admin/dashboard" 
            className="text-xl font-bold"
            style={{ color: `var(--${accentColor}-400)` }}
          >
            {BRAND.studioName} Admin
          </Link>
          {/* TODO: Add sign out button for Supabase */}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {/* Add padding top on mobile for the fixed header */}
          <div className="md:p-0 pt-16">{children}</div>
        </main>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10">
          <div className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-t ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="grid grid-cols-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex flex-col items-center py-3"
                    style={{
                      color: isActive ? `var(--${accentColor}-400)` : '',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span className="text-xs mt-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
