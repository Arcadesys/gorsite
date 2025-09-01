'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import UploadButton from '@/components/UploadButton';

type Gallery = { id: string; name: string; slug: string; description?: string | null; isPublic: boolean };

export default function StudioGalleriesPage() {
  const { accentColor } = useTheme();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { name: string; description: string; isPublic: boolean }> >({});
  const [newItem, setNewItem] = useState<Record<string, { title: string; imageUrl: string; description: string }>>({});

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
          {galleries.map((g) => {
            const item = newItem[g.id] || { title: '', imageUrl: '', description: '' };
            const edit = editing[g.id] || { name: g.name, description: g.description || '', isPublic: g.isPublic };
            return (
              <li key={g.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">
                      <a href={`/studio/galleries/${g.id}`} className="underline">{g.name}</a>
                      <span className="text-xs text-gray-400"> /{g.slug}</span>
                    </div>
                    <div className="text-sm text-gray-400">{g.description || '—'} {g.isPublic ? '(Public)' : '(Private)'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 rounded border text-xs"
                      onClick={() => setEditing((s) => ({ ...s, [g.id]: edit }))}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded border text-xs"
                      onClick={async () => {
                        if (!confirm('Delete this gallery? This cannot be undone.')) return;
                        await fetch(`/api/galleries/${g.id}`, { method: 'DELETE' });
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editing[g.id] ? (
                  <div className="mt-2 p-3 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        className="px-3 py-2 rounded border bg-transparent"
                        placeholder="Name"
                        value={edit.name}
                        onChange={(e) => setEditing((s) => ({ ...s, [g.id]: { ...edit, name: e.target.value } }))}
                      />
                      <input
                        className="px-3 py-2 rounded border bg-transparent"
                        placeholder="Description"
                        value={edit.description}
                        onChange={(e) => setEditing((s) => ({ ...s, [g.id]: { ...edit, description: e.target.value } }))}
                      />
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={edit.isPublic}
                          onChange={(e) => setEditing((s) => ({ ...s, [g.id]: { ...edit, isPublic: e.target.checked } }))}
                        />
                        Public
                      </label>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="px-3 py-2 rounded text-white"
                        style={{ backgroundColor: `var(--${accentColor}-600)` }}
                        onClick={async () => {
                          await fetch(`/api/galleries/${g.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: edit.name, description: edit.description, isPublic: edit.isPublic }),
                          });
                          setEditing((s) => ({ ...s, [g.id]: undefined as any }));
                          await load();
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="px-3 py-2 rounded border"
                        onClick={() => setEditing((s) => ({ ...s, [g.id]: undefined as any }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-2">
                  <div className="text-sm mb-2">Add Item</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                    <input
                      className="px-3 py-2 rounded border bg-transparent"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => setNewItem((s) => ({ ...s, [g.id]: { ...item, title: e.target.value } }))}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2 rounded border bg-transparent"
                        placeholder="Image URL"
                        value={item.imageUrl}
                        onChange={(e) => setNewItem((s) => ({ ...s, [g.id]: { ...item, imageUrl: e.target.value } }))}
                      />
                      <UploadButton label="Upload" onUploaded={(url) => setNewItem((s) => ({ ...s, [g.id]: { ...item, imageUrl: url } }))} />
                    </div>
                    <input
                      className="px-3 py-2 rounded border bg-transparent"
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => setNewItem((s) => ({ ...s, [g.id]: { ...item, description: e.target.value } }))}
                    />
                  </div>
                  {item.imageUrl ? (
                    <div className="mt-2">
                      <img src={item.imageUrl} alt="Preview" className="max-h-32 rounded border" />
                    </div>
                  ) : null}
                  <div className="mt-2">
                    <button
                      className="px-3 py-2 rounded text-white"
                      style={{ backgroundColor: `var(--${accentColor}-600)` }}
                      onClick={async () => {
                        if (!item.title || !item.imageUrl) return;
                        const res = await fetch(`/api/galleries/${g.id}/items`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: item.title, imageUrl: item.imageUrl, description: item.description }),
                        });
                        if (res.ok) setNewItem((s) => ({ ...s, [g.id]: { title: '', imageUrl: '', description: '' } }));
                      }}
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {galleries.length === 0 ? <li className="p-3 text-gray-500 text-sm">No galleries yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
