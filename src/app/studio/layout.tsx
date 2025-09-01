'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { accentColor, colorMode } = useTheme();

  const nav = [
    { href: '/studio', label: 'Overview' },
    { href: '/studio/onboarding', label: 'Onboarding' },
    { href: '/studio/portfolio', label: 'Portfolio' },
    { href: '/studio/prices', label: 'Prices' },
  ];

  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen flex">
      <aside className={`w-64 hidden md:block ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border-r ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="h-16 flex items-center px-6 font-bold" style={{ color: `var(--${accentColor}-400)` }}>Artist Studio</div>
        <nav className="px-4 py-3 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`block px-3 py-2 rounded ${pathname === n.href ? 'bg-emerald-600 text-white' : ''}`}>{n.label}</Link>
          ))}
          <button onClick={signOut} className="mt-4 px-3 py-2 rounded border flex items-center gap-2"><FaSignOutAlt /> Sign out</button>
        </nav>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
