'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaBan, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import CopyInviteLink from '@/components/CopyInviteLink';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  roles: string[];
  role: string;
  is_admin: boolean;
  is_superadmin: boolean;
  is_deactivated: boolean;
  banned_until: string;
  can_manage: boolean;
}

export default function UserManagementPage() {
  const { accentColor, colorMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('artist');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadUsers = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Check if user is superadmin
      const isAdmin = Boolean(
        (user as any)?.app_metadata?.roles?.includes?.('admin') ||
        (typeof (user as any)?.user_metadata?.role === 'string' && (user as any).user_metadata.role.toLowerCase() === 'admin') ||
        (user as any)?.user_metadata?.is_admin === true
      );
      
      const superEmail = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'austen@thearcades.me').toLowerCase();
      const isSuperAdmin = isAdmin && (String((user as any)?.email || '').toLowerCase() === superEmail);

      if (!isSuperAdmin) {
        router.push('/dashboard');
        return;
      }

      setCurrentUser(user);
      await loadUsers();
      setLoading(false);
    };

    checkAuthAndLoadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load users');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite user');
      }

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('artist');
      setShowInviteModal(false);
      await loadUsers(); // Refresh the list
    } catch (error: any) {
      setError(error.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, role?: string) => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const body: any = { action };
      if (role) body.role = role;

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'delete' ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} user`);
      }

      setSuccess(`User ${action}d successfully`);
      await loadUsers(); // Refresh the list
    } catch (error: any) {
      setError(error.message || `Failed to ${action} user`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (user: User) => {
    if (user.is_superadmin) return 'text-purple-600';
    if (user.is_admin) return 'text-blue-600';
    return 'text-green-600';
  };

  const getRoleLabel = (user: User) => {
    if (user.is_superadmin) return 'Superadmin';
    if (user.is_admin) return 'Admin';
    return 'Artist';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: `var(--${accentColor}-500)` }}></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaUsers className="mr-3" size={24} style={{ color: `var(--${accentColor}-500)` }} />
          <h1 className="text-2xl font-bold" style={{ color: `var(--${accentColor}-500)` }}>
            User Management
          </h1>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: `var(--${accentColor}-500)` }}
        >
          <FaPlus className="mr-2" />
          Invite User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <FaCheck className="mr-2" />
            {success}
          </div>
        </div>
      )}

      <div className={`rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Sign In</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y ${colorMode === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{user.email}</div>
                    {!user.email_confirmed_at && (
                      <div className="text-xs text-yellow-600">Email not confirmed</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRoleColor(user)}`}>
                      {getRoleLabel(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_deactivated ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Deactivated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.can_manage && (
                      <div className="flex space-x-2">
                        {!user.is_deactivated ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Deactivate User"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <FaCheck />
                          </button>
                        )}
                        
                        <select
                          value={getRoleLabel(user).toLowerCase()}
                          onChange={(e) => handleUserAction(user.id, 'update_role', e.target.value)}
                          className="text-xs px-2 py-1 rounded border"
                          title="Change Role"
                        >
                          <option value="artist">Artist</option>
                          <option value="admin">Admin</option>
                        </select>
                        
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>

                        {!user.email_confirmed_at && (
                          <CopyInviteLink 
                            email={user.email}
                            className="ml-2"
                          />
                        )}
                      </div>
                    )}
                    {!user.can_manage && (
                      <span className="text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: `var(--${accentColor}-500)` }}>
              Invite New User
            </h2>
            
            <form onSubmit={handleInviteUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={inviteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg"
                  style={{ backgroundColor: `var(--${accentColor}-500)` }}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}