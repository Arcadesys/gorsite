'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

type Gallery = { id: string; name: string; slug: string; description?: string | null; isPublic: boolean };

export default function StudioGalleriesPage() {
  const { accentColor } = useTheme();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/galleries');
    const data = await res.json();
    if (res.ok) setGalleries(data);
  };
  useEffect(() => { load(); }, []);

  const createGallery = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const res = await fetch('/api/galleries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to create');
    await load();
    setForm({ name: '', description: '', isPublic: true });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Galleries</h1>
        <p className="text-sm text-gray-400">Create and manage your galleries. Upload items under each gallery from the Galleries API/UI.</p>
      </div>
      <form onSubmit={createGallery} className="max-w-2xl space-y-3">
        {error ? <div className="text-red-500">{error}</div> : null}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <input id="pub" type="checkbox" checked={form.isPublic} onChange={e => setForm(s => ({ ...s, isPublic: e.target.checked }))} />
          <label htmlFor="pub" className="text-sm">Public</label>
        </div>
        <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: `var(--${accentColor}-600)` }}>Create Gallery</button>
      </form>

      <div className="border rounded">
        <div className="p-3 text-sm text-gray-400">Existing</div>
        <ul className="divide-y divide-gray-800">
          {galleries.map((g) => (
            <li key={g.id} className="p-3">
              <div className="font-semibold">{g.name} <span className="text-xs text-gray-400">/{g.slug}</span></div>
              <div className="text-sm text-gray-400">{g.description || '—'} {g.isPublic ? '(Public)' : '(Private)'}</div>
            </li>
          ))}
          {galleries.length === 0 ? <li className="p-3 text-gray-500 text-sm">No galleries yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}

