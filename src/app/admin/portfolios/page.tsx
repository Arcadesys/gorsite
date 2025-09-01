'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

type Portfolio = {
  id: string;
  slug: string;
  displayName: string;
  accentColor: string;
  colorMode: string;
  userId: string;
};

export default function PortfoliosPage() {
  const { accentColor, colorMode } = useTheme();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const c600 = `var(--${accentColor}-600)`;

  const load = async () => {
    const res = await fetch('/api/portfolios', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, displayName, ownerUserId, ownerEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      if (ownerEmail) {
        // Trigger invite email
        await fetch('/api/portfolios/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: ownerEmail, portfolioSlug: slug }),
        });
      }
      setSlug('');
      setDisplayName('');
      setOwnerUserId('');
      setOwnerEmail('');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Portfolios</h1>
      <form onSubmit={onCreate} className="space-y-4 max-w-xl mb-8">
        {error ? <div className="text-red-500">{error}</div> : null}
        <div>
          <label className="block text-sm mb-1">Artist Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="artistname"
            className="w-full px-3 py-2 rounded border bg-transparent"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Artist Display Name"
            className="w-full px-3 py-2 rounded border bg-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Owner User ID (Prisma)</label>
            <input
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              placeholder="User ID from Users table"
              className="w-full px-3 py-2 rounded border bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Owner Email (alternative)</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full px-3 py-2 rounded border bg-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">Provide either User ID or Email; ID takes precedence.</p>
        <button
          disabled={saving}
          className="text-white font-semibold px-4 py-2 rounded"
          style={{ backgroundColor: c600 }}
        >
          {saving ? 'Creating…' : 'Create Portfolio'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">Existing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((p) => (
            <div key={p.id} className="border rounded p-4">
              <div className="font-bold">{p.displayName}</div>
              <div className="text-sm text-gray-400">/{p.slug}</div>
              <div className="text-xs mt-2">Owner: {p.userId}</div>
              <div className="mt-3">
                <a href={`/admin/portfolios/${p.slug}`} className="text-emerald-400">Manage</a>
              </div>
            </div>
          ))}
          {portfolios.length === 0 ? <div className="text-gray-500">No portfolios yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
