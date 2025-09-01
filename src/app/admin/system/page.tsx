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

  const c600 = `var(--${accentColor}-600)`;

  async function load() {
    const [u, p] = await Promise.all([
      fetch('/api/admin/users').then((r) => r.json()).catch(() => ({ users: [] })),
      fetch('/api/portfolios').then((r) => r.json()).catch(() => ({ portfolios: [] })),
    ]);
    setUsers(u.users || []);
    setPortfolios(p.portfolios || []);
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

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-sm text-gray-400">Invite admins or artists and manage roles.</p>
      </div>

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

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Last Sign-In</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-800">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.is_admin ? 'ADMIN' : (u.role || 'ARTIST')}</td>
                  <td className="p-3">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : '-'}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => updateRole(u.id, 'ADMIN')} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: c600, color: '#fff' }}>Make Admin</button>
                    <button onClick={() => updateRole(u.id, 'ARTIST')} className="px-2 py-1 rounded text-xs border">Make Artist</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr><td className="p-3 text-gray-500" colSpan={4}>No users found.</td></tr>
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

