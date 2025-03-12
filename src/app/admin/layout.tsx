'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaHome, FaClipboardList, FaPalette, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';

// Pages that don't use the admin layout
const excludedPaths = ['/admin/login'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { accentColor, colorMode } = useTheme();

  // Don't show the admin layout for login page
  if (excludedPaths.includes(pathname || '')) {
    return <>{children}</>;
  }

  // If the user is not authenticated, just render the children (middleware will handle redirect)
  if (status !== 'authenticated') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <FaHome size={20} /> },
    { name: 'Commissions', href: '/admin/commissions', icon: <FaClipboardList size={20} /> },
    { name: 'Gallery', href: '/admin/gallery', icon: <FaPalette size={20} /> },
    { name: 'Settings', href: '/admin/config', icon: <FaCog size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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
            Gorath Admin
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
          
          <div className="mt-10 pt-6 border-t border-gray-800">
            <div className={`px-4 py-2 ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-sm">Signed in as:</div>
              <div className="font-medium">{session?.user?.name || 'Artist'}</div>
              <div className="text-sm">{session?.user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className={`mt-2 flex items-center w-full px-4 py-3 rounded-lg transition ${
                colorMode === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaSignOutAlt className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
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
            Gorath Admin
          </Link>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full"
              style={{ color: `var(--${accentColor}-400)` }}
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
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