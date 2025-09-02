'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import InviteLinkGenerator from '@/components/InviteLinkGenerator';
import OutstandingInvites from '@/components/OutstandingInvites';
import SystemOverview from '@/components/SystemOverview';

export default function AdminSystemPage() {
  const { accentColor, colorMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showInviteGenerator, setShowInviteGenerator] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }
      
      // Check if user is superadmin
      const superEmail = 'austen@thearcades.me';
      const isSuperAdmin = user.email?.toLowerCase() === superEmail.toLowerCase();
      
      if (!isSuperAdmin) {
        router.push('/dashboard');
        return;
      }
      
      setUser(user);
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: `var(--${accentColor}-400)` }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: `var(--${accentColor}-400)` }}>
          System Administration
        </h1>
        <p className="text-gray-400 mt-1">Superadmin controls and system management</p>
      </div>

      <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-3 rounded border text-left transition-colors"
            style={{ borderColor: `var(--${accentColor}-400)`, color: `var(--${accentColor}-400)` }}
          >
            <div className="font-semibold">Go to Dashboard</div>
            <div className="text-sm opacity-75">Switch to regular dashboard view</div>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/users')}
            className="px-4 py-3 rounded border text-left transition-colors"
            style={{ borderColor: `var(--${accentColor}-400)`, color: `var(--${accentColor}-400)` }}
          >
            <div className="font-semibold">User Management</div>
            <div className="text-sm opacity-75">Manage artist accounts and permissions</div>
          </button>

          <button
            onClick={() => setShowInviteGenerator(true)}
            className="px-4 py-3 rounded border text-left transition-colors"
            style={{ borderColor: `var(--${accentColor}-400)`, color: `var(--${accentColor}-400)` }}
          >
            <div className="font-semibold">Generate Invite Link</div>
            <div className="text-sm opacity-75">Create instant invite links for artists</div>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <SystemOverview accentColor={accentColor} colorMode={colorMode} />
      </div>

      {/* Outstanding Invitations */}
      <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <OutstandingInvites accentColor={accentColor} colorMode={colorMode} />
      </div>

      <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
          System Information
        </h2>
        
        <div className="space-y-2 text-sm">
          <div><strong>Logged in as:</strong> {user?.email}</div>
          <div><strong>Role:</strong> Superadmin</div>
          <div><strong>User ID:</strong> {user?.id}</div>
        </div>
      </div>

      {/* Invite Link Generator Modal */}
      {showInviteGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <InviteLinkGenerator onClose={() => setShowInviteGenerator(false)} />
        </div>
      )}
    </div>
  );
}