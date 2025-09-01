'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import UploadButton from '@/components/UploadButton';

type Price = { id: string; title: string; description?: string | null; price: number; imageUrl?: string | null; position?: number | null; active: boolean };

export default function StudioPricesPage() {
  const { accentColor } = useTheme();
  const [prices, setPrices] = useState<Price[]>([]);
  const [form, setForm] = useState<any>({ title: '', price: 0, description: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/studio/prices');
    const data = await res.json();
    if (res.ok) setPrices(data.prices || []);
  };

  useEffect(() => { load(); }, []);

  const createPrice = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const body: any = { title: form.title, price: Number(form.price) };
      if (form.description) body.description = form.description;
      if (form.imageUrl) body.imageUrl = form.imageUrl;
      const res = await fetch('/api/studio/prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setForm({ title: '', price: 0, description: '', imageUrl: '' });
      await load();
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/studio/prices/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Commission Prices</h1>
        <p className="text-sm text-gray-400">Create price points and optionally attach an image (stored in your commissions gallery).</p>
      </div>
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
          <label className="block text-sm mb-1">Image (optional)</label>
          <div className="flex items-center gap-2">
            <input className="flex-1 px-3 py-2 rounded border bg-transparent" placeholder="https://…" value={form.imageUrl} onChange={(e) => setForm((s:any) => ({...s, imageUrl: e.target.value}))} />
            <UploadButton label="Upload" onUploaded={(url) => setForm((s:any) => ({...s, imageUrl: url}))} />
          </div>
          {form.imageUrl ? (
            <div className="mt-2">
              <img src={form.imageUrl} alt="Preview" className="max-h-32 rounded border" />
            </div>
          ) : null}
        </div>
        <div>
          <label className="block text-sm mb-1">Description (optional)</label>
          <textarea className="w-full px-3 py-2 rounded border bg-transparent" rows={4} value={form.description} onChange={(e) => setForm((s:any) => ({...s, description: e.target.value}))} />
        </div>
        <button disabled={loading} className="px-4 py-2 rounded text-white" style={{ backgroundColor: `var(--${accentColor}-600)` }}>{loading ? 'Saving…' : 'Add Price'}</button>
      </form>

      <div className="border rounded">
        <div className="p-3 text-sm text-gray-400">Existing</div>
        <ul className="divide-y divide-gray-800">
          {prices.map((p) => (
            <li key={p.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.title} — ${p.price.toFixed(2)}</div>
                {p.description ? <div className="text-gray-400 text-sm">{p.description}</div> : null}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => remove(p.id)} className="px-2 py-1 rounded border text-xs">Delete</button>
              </div>
            </li>
          ))}
          {prices.length === 0 ? <li className="p-3 text-gray-500 text-sm">No prices yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
