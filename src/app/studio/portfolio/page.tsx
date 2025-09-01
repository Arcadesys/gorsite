'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function StudioPortfolioPage() {
  const { accentColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/studio/portfolio', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setForm(data.portfolio);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/studio/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to save');
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const set = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <form onSubmit={save} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.displayName || ''} onChange={e => set('displayName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Accent Color</label>
            <select className="w-full px-3 py-2 rounded border bg-transparent" value={form.accentColor || 'green'} onChange={e => set('accentColor', e.target.value)}>
              {['green','pink','purple','blue','orange'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Color Mode</label>
            <select className="w-full px-3 py-2 rounded border bg-transparent" value={form.colorMode || 'dark'} onChange={e => set('colorMode', e.target.value)}>
              {['dark','light'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Short Description</label>
          <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.description || ''} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">About (HTML allowed)</label>
          <textarea className="w-full px-3 py-2 rounded border bg-transparent" rows={6} value={form.about || ''} onChange={e => set('about', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Hero Image (Light)</label>
            <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.heroImageLight || ''} onChange={e => set('heroImageLight', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Hero Image (Dark)</label>
            <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.heroImageDark || ''} onChange={e => set('heroImageDark', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Hero Image (Mobile)</label>
            <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.heroImageMobile || ''} onChange={e => set('heroImageMobile', e.target.value)} />
          </div>
        </div>
        <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: `var(--${accentColor}-600)` }}>Save</button>
      </form>
    </div>
  );
}

