'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useParams } from 'next/navigation';

type Price = { id: string; title: string; description?: string | null; price: number; imageUrl?: string | null; position?: number | null; active: boolean };

export default function AdminPortfolioManage() {
  const { accentColor } = useTheme();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [prices, setPrices] = useState<Price[]>([]);
  const [form, setForm] = useState<any>({ title: '', price: 0, description: '', imageUrl: '' });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/portfolios/${slug}/prices`);
    const data = await res.json();
    if (res.ok) setPrices(data.prices || []);
  };
  useEffect(() => { if (slug) load(); }, [slug]);

  const createPrice = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const body: any = { title: form.title, price: Number(form.price) };
    if (form.description) body.description = form.description;
    if (form.imageUrl) body.imageUrl = form.imageUrl;
    const res = await fetch(`/api/portfolios/${slug}/prices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to create');
    await load();
    setForm({ title: '', price: 0, description: '', imageUrl: '' });
  };

  const remove = async (id: string) => {
    await fetch(`/api/portfolios/${slug}/prices/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Portfolio: {slug}</h1>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Commission Prices</h2>
        <form onSubmit={createPrice} className="max-w-2xl space-y-3">
          {error ? <div className="text-red-500">{error}</div> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.title} onChange={(e) => setForm((s:any) => ({...s, title: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Price</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 rounded border bg-transparent" value={form.price} onChange={(e) => setForm((s:any) => ({...s, price: e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Image URL (optional)</label>
            <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.imageUrl} onChange={(e) => setForm((s:any) => ({...s, imageUrl: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Description (optional)</label>
            <textarea className="w-full px-3 py-2 rounded border bg-transparent" rows={4} value={form.description} onChange={(e) => setForm((s:any) => ({...s, description: e.target.value}))} />
          </div>
          <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: `var(--${accentColor}-600)` }}>Add Price</button>
        </form>
        <div className="border rounded mt-4">
          <div className="p-3 text-sm text-gray-400">Existing</div>
          <ul className="divide-y divide-gray-800">
            {prices.map((p) => (
              <li key={p.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.title} — ${p.price.toFixed(2)}</div>
                  {p.description ? <div className="text-gray-400 text-sm">{p.description}</div> : null}
                </div>
                <button onClick={() => remove(p.id)} className="px-2 py-1 rounded border text-xs">Delete</button>
              </li>
            ))}
            {prices.length === 0 ? <li className="p-3 text-gray-500 text-sm">No prices yet.</li> : null}
          </ul>
        </div>
      </section>
    </div>
  );
}

