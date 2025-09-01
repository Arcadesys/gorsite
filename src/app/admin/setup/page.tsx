'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminSetupPage() {
  const { accentColor } = useTheme();
  const [email, setEmail] = useState('austen@artpop.vercel.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const c600 = `var(--${accentColor}-600)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/bootstrap-superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setResult(`Success! Admin ${data.created ? 'created' : 'updated'} with ID: ${data.userId}`);
      setPassword(''); // Clear password for security
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Bootstrap the superadmin account for this instance
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {result && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {result}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded bg-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded bg-transparent"
              placeholder="Enter a secure password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2 px-4 rounded font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: c600 }}
          >
            {loading ? 'Setting up...' : 'Bootstrap Admin'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          This will create or update the admin account for austen@thearcades.me only.
        </p>
      </div>
    </div>
  );
}