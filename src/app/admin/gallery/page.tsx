'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';

type Gallery = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
};

type GalleryItem = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  altText?: string | null;
  tags?: string | null;
  createdAt: string;
};

export default function GalleryPage() {
  const { accentColor, colorMode } = useTheme();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Forms
  const [newGallery, setNewGallery] = useState({ name: '', description: '', isPublic: true });
  const [newItem, setNewItem] = useState({ title: '', imageUrl: '', altText: '', description: '', tags: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<{ title: string; imageUrl: string; altText: string; description: string; tags: string }>({ title: '', imageUrl: '', altText: '', description: '', tags: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Gallery edit state
  const [editingGallery, setEditingGallery] = useState<{ name: string; description: string; isPublic: boolean } | null>(null);
  const [savingGallery, setSavingGallery] = useState(false);

  // Load galleries
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/galleries');
      if (res.ok) {
        const data = await res.json();
        setGalleries(data);
        if (data.length && !selectedGalleryId) setSelectedGalleryId(data[0].id);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load items when gallery changes
  useEffect(() => {
    if (!selectedGalleryId) return;
    (async () => {
      const res = await fetch(`/api/galleries/${selectedGalleryId}/items`);
      if (res.ok) {
        setItems(await res.json());
      } else {
        setItems([]);
      }
    })();
  }, [selectedGalleryId]);

  // When the selected gallery changes, reset editing state
  useEffect(() => {
    setEditingItemId(null);
    setEditingGallery(null);
  }, [selectedGalleryId]);

  const allTags = useMemo(() => {
    const t = new Set<string>();
    for (const it of items) {
      try {
        const parsed = it.tags ? JSON.parse(it.tags) : [];
        for (const tag of parsed) t.add(String(tag));
      } catch {
        // tags may be CSV fallback
        it.tags?.split(',').map(s => s.trim()).filter(Boolean).forEach(tag => t.add(tag));
      }
    }
    return Array.from(t);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((img) => {
      const tagsArr = (() => {
        try { return img.tags ? JSON.parse(img.tags) : []; } catch { return img.tags ? img.tags.split(',').map(s=>s.trim()) : []; }
      })();
      const matchesSearch =
        searchTerm === '' ||
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.altText || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        tagsArr.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = activeTag === null || tagsArr.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [items, searchTerm, activeTag]);

  function formatDateStr(iso: string) {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function createGallery(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGallery),
    });
    if (res.ok) {
      const g = await res.json();
      setGalleries([g, ...galleries]);
      setSelectedGalleryId(g.id);
      setNewGallery({ name: '', description: '', isPublic: true });
      setNotification({ type: 'success', message: 'Gallery created' });
      setTimeout(() => setNotification(null), 3000);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGalleryId) return;
    const payload = {
      title: newItem.title,
      imageUrl: newItem.imageUrl,
      altText: newItem.altText,
      description: newItem.description,
      tags: newItem.tags ? newItem.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    const res = await fetch(`/api/galleries/${selectedGalleryId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const it = await res.json();
      setItems([it, ...items]);
      setNewItem({ title: '', imageUrl: '', altText: '', description: '', tags: '' });
      setNotification({ type: 'success', message: 'Item added' });
      setTimeout(() => setNotification(null), 3000);
    }
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/gallery-items/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
    }
  }

  function beginEditItem(item: GalleryItem) {
    setEditingItemId(item.id);
    let tagsStr = '';
    try {
      const arr = item.tags ? JSON.parse(item.tags) : [];
      tagsStr = Array.isArray(arr) ? arr.join(', ') : String(item.tags || '');
    } catch {
      tagsStr = String(item.tags || '');
    }
    setEditItemForm({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      altText: item.altText || '',
      description: item.description || '',
      tags: tagsStr,
    });
  }

  async function saveEditItem() {
    if (!editingItemId) return;
    setSavingEdit(true);
    const payload: any = {
      title: editItemForm.title,
      imageUrl: editItemForm.imageUrl,
      altText: editItemForm.altText || null,
      description: editItemForm.description || null,
      tags: editItemForm.tags
        ? editItemForm.tags.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    const res = await fetch(`/api/gallery-items/${editingItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setEditingItemId(null);
      setNotification({ type: 'success', message: 'Item updated' });
      setTimeout(() => setNotification(null), 3000);
    }
    setSavingEdit(false);
  }

  async function uploadEditImage(file: File) {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append('file', file);
    const resp = await fetch('/api/uploads', { method: 'POST', body: fd });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Upload failed' }));
      setUploadError(err.error || 'Upload failed');
    } else {
      const out = await resp.json();
      setEditItemForm((s) => ({ ...s, imageUrl: out.publicUrl }));
    }
    setUploading(false);
  }

  // Gallery edit & delete
  function beginEditGallery() {
    const g = galleries.find((x) => x.id === selectedGalleryId);
    if (!g) return;
    setEditingGallery({ name: g.name, description: g.description || '', isPublic: g.isPublic });
  }

  async function saveGalleryEdits() {
    if (!selectedGalleryId || !editingGallery) return;
    setSavingGallery(true);
    const res = await fetch(`/api/galleries/${selectedGalleryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingGallery),
    });
    if (res.ok) {
      const updated = await res.json();
      setGalleries((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setEditingGallery(null);
      setNotification({ type: 'success', message: 'Gallery updated' });
      setTimeout(() => setNotification(null), 3000);
    }
    setSavingGallery(false);
  }

  async function deleteGallery() {
    if (!selectedGalleryId) return;
    if (!confirm('Delete this gallery? This cannot be undone.')) return;
    const res = await fetch(`/api/galleries/${selectedGalleryId}`, { method: 'DELETE' });
    if (res.ok) {
      const remaining = galleries.filter((g) => g.id !== selectedGalleryId);
      setGalleries(remaining);
      setSelectedGalleryId(remaining[0]?.id || null);
      setItems([]);
      setEditingGallery(null);
      setNotification({ type: 'success', message: 'Gallery deleted' });
      setTimeout(() => setNotification(null), 3000);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: `var(--${accentColor}-400)` }}>
        Gallery Management
      </h1>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Galleries + Add Item */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Galleries
            </h2>
            <label className={`block text-sm mb-1 ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Select Gallery</label>
            <select
              value={selectedGalleryId || ''}
              onChange={(e) => setSelectedGalleryId(e.target.value || null)}
              className={`w-full mb-4 px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
            >
              {galleries.length === 0 ? <option value="">No galleries yet</option> : null}
              {galleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Edit/Delete selected gallery */}
            {selectedGalleryId ? (
              <div className="mb-6">
                {!editingGallery ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={beginEditGallery}
                      className={`px-3 py-2 rounded text-white`}
                      style={{ backgroundColor: `var(--${accentColor}-500)` }}
                    >
                      Edit Selected
                    </button>
                    <button
                      onClick={deleteGallery}
                      className={`px-3 py-2 rounded border text-red-600 border-red-600`}
                    >
                      Delete Selected
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 mt-2 rounded border">
                    <div>
                      <label className={`block text-sm mb-1 ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                      <input
                        value={editingGallery.name}
                        onChange={(e) => setEditingGallery((s) => (s ? { ...s, name: e.target.value } : s))}
                        className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                      <textarea
                        rows={2}
                        value={editingGallery.description}
                        onChange={(e) => setEditingGallery((s) => (s ? { ...s, description: e.target.value } : s))}
                        className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                      />
                    </div>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingGallery.isPublic}
                        onChange={(e) => setEditingGallery((s) => (s ? { ...s, isPublic: e.target.checked } : s))}
                      />
                      <span className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Public</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveGalleryEdits}
                        disabled={savingGallery}
                        className={`px-3 py-2 rounded text-white disabled:opacity-60`}
                        style={{ backgroundColor: `var(--${accentColor}-500)` }}
                      >
                        {savingGallery ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingGallery(null)}
                        className={`px-3 py-2 rounded border`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <form onSubmit={createGallery} className="space-y-3">
              <div>
                <label className={`block text-sm mb-1 ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  value={newGallery.name}
                  onChange={(e) => setNewGallery({ ...newGallery, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="e.g., Furry Art, Tattoo Designs"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={newGallery.description}
                  onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGallery.isPublic}
                  onChange={(e) => setNewGallery({ ...newGallery, isPublic: e.target.checked })}
                />
                <span className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Public</span>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: `var(--${accentColor}-500)` }}
              >
                Create Gallery
              </button>
            </form>
          </div>

          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Add Item to Gallery
            </h2>
            {!selectedGalleryId ? (
              <p className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Create and select a gallery first.</p>
            ) : (
              <form onSubmit={addItem} className="space-y-3">
                <div className="text-sm mb-1" style={{ color: `var(--${accentColor}-400)` }}>Upload image (optional)</div>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploading(true);
                    setUploadError(null);
                    const fd = new FormData();
                    fd.append('file', f);
                    const resp = await fetch('/api/uploads', { method: 'POST', body: fd });
                    if (!resp.ok) {
                      const err = await resp.json().catch(() => ({ error: 'Upload failed' }));
                      setUploadError(err.error || 'Upload failed');
                    } else {
                      const out = await resp.json();
                      setNewItem((s) => ({ ...s, imageUrl: out.publicUrl }));
                    }
                    setUploading(false);
                  }} />
                  {uploading ? <span className="text-xs text-gray-400">Uploading…</span> : null}
                </div>
                {uploadError ? <div className="text-xs text-red-500">{uploadError}</div> : null}
                <input
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="Title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  required
                />
                <input
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="Image URL"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  required
                />
                <input
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="Alt text"
                  value={newItem.altText}
                  onChange={(e) => setNewItem({ ...newItem, altText: e.target.value })}
                />
                <textarea
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <input
                  className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                  placeholder="Tags (comma separated)"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                />
                <button type="submit" className="w-full px-4 py-2 rounded-md text-white" style={{ backgroundColor: `var(--${accentColor}-500)` }}>
                  Add Item
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Gallery Items */}
        <div className="lg:col-span-2">
          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Gallery Items
            </h2>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none`}
                  placeholder="Search by title, description, or tag"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <select
                  value={activeTag || ''}
                  onChange={(e) => setActiveTag(e.target.value || null)}
                  className={`pl-10 pr-8 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none`}
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No gallery items found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const tagsArr = (() => {
                    try { return item.tags ? JSON.parse(item.tags) : []; } catch { return item.tags ? item.tags.split(',').map(s=>s.trim()) : []; }
                  })();
                  return (
                    <div
                      key={item.id}
                      className={`${colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 flex flex-col md:flex-row gap-4 ${deleteConfirmId === item.id ? 'border-2 border-red-500' : ''}`}
                    >
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <Image src={item.imageUrl || '/placeholder-hero.svg'} alt={item.altText || item.title} className="w-full h-full object-cover rounded-lg" width={128} height={128} />
                      </div>
                      <div className="flex-grow">
                        {editingItemId === item.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                className={`px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                                placeholder="Title"
                                value={editItemForm.title}
                                onChange={(e) => setEditItemForm((s) => ({ ...s, title: e.target.value }))}
                              />
                              <input
                                className={`px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                                placeholder="Image URL"
                                value={editItemForm.imageUrl}
                                onChange={(e) => setEditItemForm((s) => ({ ...s, imageUrl: e.target.value }))}
                              />
                            </div>
                            <div className="text-sm">Optional: upload new image</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadEditImage(f);
                              }}
                            />
                            {uploading ? <div className="text-xs text-gray-400">Uploading…</div> : null}
                            {uploadError ? <div className="text-xs text-red-500">{uploadError}</div> : null}
                            <input
                              className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                              placeholder="Alt text"
                              value={editItemForm.altText}
                              onChange={(e) => setEditItemForm((s) => ({ ...s, altText: e.target.value }))}
                            />
                            <textarea
                              rows={3}
                              className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                              placeholder="Description"
                              value={editItemForm.description}
                              onChange={(e) => setEditItemForm((s) => ({ ...s, description: e.target.value }))}
                            />
                            <input
                              className={`w-full px-3 py-2 rounded-md ${colorMode === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}
                              placeholder="Tags (comma separated)"
                              value={editItemForm.tags}
                              onChange={(e) => setEditItemForm((s) => ({ ...s, tags: e.target.value }))}
                            />
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={saveEditItem}
                                disabled={savingEdit}
                                className="px-3 py-2 rounded text-white disabled:opacity-60"
                                style={{ backgroundColor: `var(--${accentColor}-500)` }}
                              >
                                {savingEdit ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-3 py-2 rounded border"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold" style={{ color: `var(--${accentColor}-400)` }}>{item.title}</h3>
                            <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{item.description}</p>
                            <p className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Alt Text: {item.altText}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tagsArr.map((tag: string) => (
                                <span key={tag} className="px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor: `var(--${accentColor}-500)` }}>#{tag}</span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Added: {formatDateStr(item.createdAt)}</span>
                              {deleteConfirmId === item.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-500 text-sm">Are you sure?</span>
                                  <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Yes, Delete</button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button onClick={() => beginEditItem(item)} className={`p-2 rounded-full ${colorMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`} style={{ color: `var(--${accentColor}-400)` }}>
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => setDeleteConfirmId(item.id)} className={`p-2 rounded-full ${colorMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} text-red-500`}>
                                    <FaTrash />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
