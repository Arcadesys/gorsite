'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UploadButton from '@/components/UploadButton';
import { useTheme } from '@/context/ThemeContext';

type Item = { id: string; title: string; imageUrl: string; description?: string | null; altText?: string | null; position?: number | null };
type Gallery = { id: string; name: string; slug: string };

export default function ManageGalleryPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const router = useRouter();
  const { accentColor, colorMode } = useTheme();

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const dropRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const gRes = await fetch(`/api/galleries/${id}`);
      const g = await gRes.json();
      if (!gRes.ok) throw new Error(g.error || 'Failed to load gallery');
      setGallery(g);

      const res = await fetch(`/api/galleries/${id}/items`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load items');
      setItems(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  // Drag & drop reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (idx: number) => setDragIndex(idx);
  const onDragOver = (e: React.DragEvent, overIdx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === overIdx) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIdx, 0, moved);
      setDragIndex(overIdx);
      return next;
    });
  };
  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const order = items.map(i => i.id);
      await fetch(`/api/galleries/${id}/items/reorder`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) });
    } finally { setSavingOrder(false); }
  };

  // Edit item fields
  const updateField = (idx: number, key: keyof Item, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      (next[idx] as any)[key] = value;
      return next;
    });
  };
  const saveItem = async (idx: number) => {
    const it = items[idx];
    const body: any = { title: it.title, imageUrl: it.imageUrl, description: it.description ?? null, altText: it.altText ?? null };
    const res = await fetch(`/api/gallery-items/${it.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Failed to save');
    }
  };
  const removeItem = async (idx: number) => {
    const it = items[idx];
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/gallery-items/${it.id}`, { method: 'DELETE' });
    await load();
  };

  // Drag-and-drop upload
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDragOver = (e: DragEvent) => { e.preventDefault(); el.classList.add('ring-2'); };
    const onDragLeave = () => { el.classList.remove('ring-2'); };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault(); el.classList.remove('ring-2');
      const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
      for (const f of files) {
        const fd = new FormData(); fd.append('file', f);
        const up = await fetch('/api/uploads', { method: 'POST', body: fd });
        const data = await up.json();
        if (up.ok) {
          const title = (f.name || 'Untitled').replace(/\.[^.]+$/, '');
          await fetch(`/api/galleries/${id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, imageUrl: data.publicUrl, description: '' }) });
        }
      }
      await load();
    };
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!gallery) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Gallery</h1>
          <p className="text-sm text-gray-400">{gallery.name} /{gallery.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/studio/galleries')} className="px-3 py-2 rounded border">Back</button>
          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="px-3 py-2 rounded text-white"
            style={{ backgroundColor: `var(--${accentColor}-600)` }}
          >
            {savingOrder ? 'Saving…' : 'Save Order'}
          </button>
        </div>
      </div>

      <div ref={dropRef} className={`p-6 rounded border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Upload New Images</div>
            <div className="text-sm text-gray-400">Drag & drop images here, or use the button.</div>
          </div>
          <UploadButton label="Upload" onUploaded={async (url) => {
            const title = 'Untitled';
            await fetch(`/api/galleries/${id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, imageUrl: url }) });
            await load();
          }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((it, idx) => (
          <div
            key={it.id}
            className={`p-3 rounded border flex gap-3 items-start ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
          >
            <img src={it.imageUrl} alt={it.altText || it.title} className="h-24 w-24 object-cover rounded border" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs mb-1">Title</label>
                <input className="w-full px-3 py-2 rounded border bg-transparent" value={it.title || ''} onChange={(e) => updateField(idx, 'title', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1">Alt Text</label>
                <input className="w-full px-3 py-2 rounded border bg-transparent" value={it.altText || ''} onChange={(e) => updateField(idx, 'altText', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1">Description</label>
                <input className="w-full px-3 py-2 rounded border bg-transparent" value={it.description || ''} onChange={(e) => updateField(idx, 'description', e.target.value)} />
              </div>
              <div className="col-span-full flex items-center gap-2 mt-1">
                <button
                  className="px-3 py-2 rounded text-white"
                  style={{ backgroundColor: `var(--${accentColor}-600)` }}
                  onClick={() => saveItem(idx)}
                >
                  Save
                </button>
                <button className="px-3 py-2 rounded border" onClick={() => removeItem(idx)}>Delete</button>
                <span className="text-xs text-gray-500">Drag row to reorder</span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="text-sm text-gray-500">No items yet. Drag images in or upload to get started.</div> : null}
      </div>
    </div>
  );
}

