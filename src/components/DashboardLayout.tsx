import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { 
  FaHome, 
  FaPalette, 
  FaImages, 
  FaDollarSign, 
  FaClipboardList, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaUsers,
  FaChartBar,
  FaUpload
} from 'react-icons/fa';
import { FaLink as FaLinkIcon } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'ARTIST' | 'ADMIN' | 'SUPERADMIN';
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { accentColor, colorMode } = useTheme();
  
  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  // Define navigation based on user role
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: <FaHome size={20} />, roles: ['ARTIST', 'ADMIN', 'SUPERADMIN'] },
    ];

    const artistNav = [
      { name: 'Portfolio', href: '/dashboard/portfolio', icon: <FaUser size={20} />, roles: ['ARTIST'] },
      { name: 'Customization', href: '/dashboard/customization', icon: <FaPalette size={20} />, roles: ['ARTIST'] },
      { name: 'Galleries', href: '/dashboard/galleries', icon: <FaImages size={20} />, roles: ['ARTIST'] },
      { name: 'Upload Art', href: '/dashboard/upload', icon: <FaUpload size={20} />, roles: ['ARTIST'] },
      { name: 'Commissions', href: '/dashboard/commissions', icon: <FaClipboardList size={20} />, roles: ['ARTIST'] },
      { name: 'Pricing', href: '/dashboard/pricing', icon: <FaDollarSign size={20} />, roles: ['ARTIST'] },
      { name: 'Links Page', href: '/dashboard/links', icon: <FaLinkIcon /> as any, roles: ['ARTIST'] },
      { name: 'Analytics', href: '/dashboard/analytics', icon: <FaChartBar size={20} />, roles: ['ARTIST'] },
    ];

    const adminNav = [
      { name: 'All Artists', href: '/dashboard/artists', icon: <FaPalette size={20} />, roles: ['ADMIN', 'SUPERADMIN'] },
      { name: 'All Galleries', href: '/dashboard/admin/galleries', icon: <FaImages size={20} />, roles: ['SUPERADMIN'] },
      { name: 'All Uploads', href: '/dashboard/admin/uploads', icon: <FaUpload size={20} />, roles: ['SUPERADMIN'] },
      { name: 'User Management', href: '/dashboard/users', icon: <FaUsers size={20} />, roles: ['SUPERADMIN'] },
      { name: 'Site Settings', href: '/dashboard/settings', icon: <FaCog size={20} />, roles: ['ADMIN', 'SUPERADMIN'] },
    ];

    const allNav = [...baseNav, ...artistNav, ...adminNav];
    return allNav.filter(item => item.roles.includes(userRole));
  };

  const navigation = getNavigation();

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'ARTIST': return 'Artist Studio';
      case 'ADMIN': return 'Admin Dashboard';
      case 'SUPERADMIN': return 'Super Admin';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`w-64 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-r ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex-shrink-0 hidden md:block`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link 
            href="/dashboard" 
            className="text-xl font-bold"
            style={{ color: `var(--${accentColor}-400)` }}
          >
            {getDashboardTitle()}
          </Link>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
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
          
          <div className="mt-8 pt-4 border-t border-gray-700">
            <Link
              href="/dashboard/profile"
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                pathname === '/dashboard/profile'
                  ? 'text-white'
                  : `${colorMode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
              style={{
                backgroundColor: pathname === '/dashboard/profile' ? `var(--${accentColor}-600)` : '',
              }}
            >
              <FaUser className="mr-3" size={20} />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={signOut}
              className={`mt-2 w-full flex items-center px-4 py-3 rounded-lg transition ${
                colorMode === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaSignOutAlt className="mr-3" size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10">
        <div className={`h-16 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-b ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between px-4`}>
          <Link 
            href="/dashboard" 
            className="text-xl font-bold"
            style={{ color: `var(--${accentColor}-400)` }}
          >
            {getDashboardTitle()}
          </Link>
          <button 
            onClick={signOut} 
            className={`${colorMode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="md:p-0 pt-16">{children}</div>
        </main>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10">
          <div className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-t ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="grid grid-cols-4 gap-1">
              {navigation.slice(0, 4).map((item) => {
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
