'use client';

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { FaPlus, FaTrash, FaSave, FaGlobe, FaImage } from 'react-icons/fa'

type LinkItem = {
  id: string
  title: string
  url: string
  imageUrl?: string | null
  position?: number | null
  isPublic: boolean
}

export default function DashboardLinksPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '', imageUrl: '' })

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/studio/links', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load links')
      const data = await res.json()
      setLinks(data.links || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinks() }, [])

  const createLink = async () => {
    if (!newLink.title || !newLink.url) return
    setCreating(true)
    try {
      const res = await fetch('/api/studio/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLink })
      })
      if (!res.ok) throw new Error('Create failed')
      setNewLink({ title: '', url: '', imageUrl: '' })
      await fetchLinks()
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const saveLink = async (id: string, patch: Partial<LinkItem>) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api/studio/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      })
      if (!res.ok) throw new Error('Save failed')
      await fetchLinks()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingId(null)
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return
    try {
      const res = await fetch(`/api/studio/links/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Links Page</h1>
          <p className="text-gray-500">Add links to shops, galleries, and socials. Optionally include a thumbnail image URL.</p>
        </div>

        {/* Create */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Add Link</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="px-3 py-2 rounded border bg-transparent"
              placeholder="Title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            />
            <input
              className="px-3 py-2 rounded border bg-transparent"
              placeholder="https://example.com"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
            <input
              className="px-3 py-2 rounded border bg-transparent"
              placeholder="Image URL (optional)"
              value={newLink.imageUrl}
              onChange={(e) => setNewLink({ ...newLink, imageUrl: e.target.value })}
            />
            <button
              onClick={createLink}
              disabled={creating || !newLink.title || !newLink.url}
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : links.length === 0 ? (
            <div className="text-gray-500">No links yet.</div>
          ) : (
            links.map((l) => (
              <div key={l.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-500">Title</label>
                    <input
                      className="w-full px-3 py-2 rounded border bg-transparent"
                      defaultValue={l.title}
                      onBlur={(e) => e.target.value !== l.title && saveLink(l.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs text-gray-500">URL</label>
                    <input
                      className="w-full px-3 py-2 rounded border bg-transparent"
                      defaultValue={l.url}
                      onBlur={(e) => e.target.value !== l.url && saveLink(l.id, { url: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-500">Image URL</label>
                    <input
                      className="w-full px-3 py-2 rounded border bg-transparent"
                      defaultValue={l.imageUrl || ''}
                      onBlur={(e) => e.target.value !== (l.imageUrl || '') && saveLink(l.id, { imageUrl: e.target.value || null })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-gray-500">Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded border bg-transparent"
                      defaultValue={l.position ?? ''}
                      onBlur={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value)
                        if (v !== (l.position ?? null)) saveLink(l.id, { position: v })
                      }}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end gap-2 justify-end">
                    <button
                      onClick={() => saveLink(l.id, { isPublic: !l.isPublic })}
                      className={`px-3 py-2 rounded text-white inline-flex items-center ${l.isPublic ? 'bg-green-600' : 'bg-gray-500'}`}
                    >
                      <FaGlobe className="mr-2" /> {l.isPublic ? 'Public' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => deleteLink(l.id)}
                      className="px-3 py-2 rounded bg-red-600 text-white inline-flex items-center"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
                {savingId === l.id ? (
                  <div className="text-xs text-gray-400 mt-2 inline-flex items-center"><FaSave className="mr-1" /> Saving...</div>
                ) : null}
                {l.imageUrl ? (
                  <div className="mt-3 text-xs text-gray-500 inline-flex items-center"><FaImage className="mr-1" /> Preview: <a href={l.imageUrl} target="_blank" className="underline ml-1">open</a></div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

