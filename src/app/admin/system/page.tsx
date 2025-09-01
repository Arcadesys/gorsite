'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

type UserRow = {
  id: string;
  email: string;
  created_at?: string;
  last_sign_in_at?: string;
  roles: string[];
  role?: string;
  is_admin?: boolean;
  is_superadmin?: boolean;
  is_deactivated?: boolean;
  banned_until?: string;
  can_manage?: boolean;
  email_confirmed_at?: string;
};

type Portfolio = {
  id: string;
  slug: string;
  displayName: string;
  userId: string;
  createdAt?: string;
};

export default function SystemPage() {
  const { accentColor, colorMode } = useTheme();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'ARTIST'>('ARTIST');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);

  const c600 = `var(--${accentColor}-600)`;

  async function load() {
    const [u, p] = await Promise.all([
      fetch('/api/admin/users').then((r) => r.json()).catch(() => ({ users: [] })),
      fetch('/api/portfolios').then((r) => r.json()).catch(() => ({ portfolios: [] })),
    ]);
    setUsers(u.users || []);
    setPortfolios(p.portfolios || []);
    
    // Find the current user (superadmin)
    const current = (u.users || []).find((user: UserRow) => user.is_superadmin);
    setCurrentUser(current || null);
  }

  useEffect(() => { load(); }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite');
      setInviteEmail('');
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, role: 'ADMIN' | 'ARTIST') {
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function manageUser(id: string, action: 'deactivate' | 'activate' | 'delete' | 'resend_invite' | 'reset_password') {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const confirmMessages = {
      deactivate: `Are you sure you want to deactivate ${user.email}? They will not be able to sign in.`,
      activate: `Are you sure you want to reactivate ${user.email}? They will be able to sign in again.`,
      delete: `Are you sure you want to permanently delete ${user.email}? This action cannot be undone and will remove all their data.`,
      resend_invite: `Resend invitation email to ${user.email}?`,
      reset_password: `Generate a new random password for ${user.email}? They will be required to change it on next login.`
    };

    if (!confirm(confirmMessages[action])) return;

    setLoading(true); setErr(null);
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      } else if (action === 'resend_invite') {
        const res = await fetch(`/api/admin/users/${id}/resend-invite`, {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to resend invitation');
        alert(data.message || 'Invitation email sent successfully!');
      } else if (action === 'reset_password') {
        const res = await fetch(`/api/admin/users/${id}/reset-password`, {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');
        
        // Show the temporary password to the superadmin
        const message = `Password reset for ${user.email}\n\nTemporary password: ${data.temporaryPassword}\n\nPlease share this securely with the user. They will be required to change it on next login.`;
        alert(message);
      } else {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${action} user`);
      }
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-sm text-gray-400">Invite admins or artists and manage roles.</p>
      </div>

      {currentUser ? (
        <form onSubmit={invite} className="space-y-3 max-w-xl">
          {err ? <div className="text-red-500">{err}</div> : null}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-transparent"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded border bg-transparent"
            >
              <option value="ARTIST">ARTIST</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button disabled={loading} className="text-white font-semibold px-4 py-2 rounded" style={{ backgroundColor: c600 }}>
            {loading ? 'Inviting…' : 'Send Invite'}
          </button>
        </form>
      ) : (
        <div className="text-gray-500 text-sm max-w-xl">
          Only superadmins can invite new users.
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Users</h2>
        {currentUser && (
          <div className="bg-blue-900/20 border border-blue-500/50 rounded p-3 text-sm">
            <strong>Superadmin Access:</strong> You have elevated privileges to manage user accounts.
          </div>
        )}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Email Status</th>
                <th className="text-left p-3">Last Sign-In</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={`border-t border-gray-800 ${u.is_deactivated ? 'opacity-60 bg-red-900/10' : ''}`}>
                  <td className="p-3">
                    {u.email}
                    {u.is_superadmin && <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">SUPERADMIN</span>}
                  </td>
                  <td className="p-3">{u.is_admin ? 'ADMIN' : (u.role || 'ARTIST')}</td>
                  <td className="p-3">
                    {u.is_deactivated ? (
                      <span className="text-red-400 font-medium">DEACTIVATED</span>
                    ) : (
                      <span className="text-green-400">ACTIVE</span>
                    )}
                  </td>
                  <td className="p-3">
                    {u.email_confirmed_at ? (
                      <span className="text-green-400">CONFIRMED</span>
                    ) : (
                      <span className="text-yellow-400">PENDING</span>
                    )}
                  </td>
                  <td className="p-3">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : '-'}</td>
                  <td className="p-3 space-x-1 space-y-1">
                    {u.can_manage ? (
                      <div className="flex flex-wrap gap-1">
                        {!u.is_deactivated ? (
                          <>
                            <button onClick={() => updateRole(u.id, 'ADMIN')} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: c600, color: '#fff' }}>Make Admin</button>
                            <button onClick={() => updateRole(u.id, 'ARTIST')} className="px-2 py-1 rounded text-xs border">Make Artist</button>
                            <button onClick={() => manageUser(u.id, 'deactivate')} className="px-2 py-1 rounded text-xs bg-yellow-600 text-white">Deactivate</button>
                          </>
                        ) : (
                          <button onClick={() => manageUser(u.id, 'activate')} className="px-2 py-1 rounded text-xs bg-green-600 text-white">Reactivate</button>
                        )}
                        {!u.email_confirmed_at && (
                          <button onClick={() => manageUser(u.id, 'resend_invite')} className="px-2 py-1 rounded text-xs bg-blue-600 text-white">Resend Invite</button>
                        )}
                        {u.email_confirmed_at && (
                          <button onClick={() => manageUser(u.id, 'reset_password')} className="px-2 py-1 rounded text-xs bg-orange-600 text-white">Reset Password</button>
                        )}
                        <button onClick={() => manageUser(u.id, 'delete')} className="px-2 py-1 rounded text-xs bg-red-600 text-white">Delete</button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        {u.is_superadmin ? 'You' : 'No permissions'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr><td className="p-3 text-gray-500" colSpan={6}>No users found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">System Activity</h2>
        <div className="border rounded">
          <div className="p-3 text-sm text-gray-400">Recent Portfolios</div>
          <ul className="divide-y divide-gray-800">
            {portfolios.map((p) => (
              <li key={p.id} className="p-3 text-sm">
                <span className="font-mono">/{p.slug}</span> — {p.displayName} (owner: {p.userId})
              </li>
            ))}
            {portfolios.length === 0 ? (
              <li className="p-3 text-gray-500 text-sm">No portfolios yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  )
}

