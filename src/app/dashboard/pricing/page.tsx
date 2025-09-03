"use client"
import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'

type Portfolio = { id: string, slug: string }
type Price = { id: string, title: string, description: string | null, price: number, imageUrl: string | null, position: number | null, active: boolean }

export default function DashboardPricingPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST')
  const [loading, setLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [prices, setPrices] = useState<Price[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ title: '', description: '', price: '', imageUrl: '' as string | null })
  const slug = portfolio?.slug

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const pRes = await fetch('/api/studio/portfolio', { cache: 'no-store' })
      const pJson = await pRes.json()
      if (!pRes.ok) throw new Error(pJson.error || 'Failed to load portfolio')
      setPortfolio(pJson.portfolio)
      if (pJson.portfolio?.slug) {
        const prRes = await fetch(`/api/portfolios/${pJson.portfolio.slug}/prices`, { cache: 'no-store' })
        const prJson = await prRes.json()
        if (!prRes.ok) throw new Error(prJson.error || 'Failed to load prices')
        setPrices(prJson.prices)
      }
    } catch (e: any) {
      setError(e.message || 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug) return
    const body: any = { title: form.title, description: form.description || undefined, price: Number(form.price), imageUrl: form.imageUrl || undefined }
    const res = await fetch(`/api/portfolios/${slug}/prices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (!res.ok) { alert(json.error || 'Failed to add'); return }
    setForm({ title: '', description: '', price: '', imageUrl: null })
    await load()
  }

  const updatePrice = async (id: string, patch: Partial<Price>) => {
    if (!slug) return
    const res = await fetch(`/api/portfolios/${slug}/prices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.error || 'Update failed'); return }
    await load()
  }

  const removePrice = async (id: string) => {
    if (!slug) return
    if (!confirm('Delete this price?')) return
    const res = await fetch(`/api/portfolios/${slug}/prices/${id}`, { method: 'DELETE' })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.error || 'Delete failed'); return }
    await load()
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Commission Pricing</h1>
        {error ? <div className="text-red-500 mb-4">{error}</div> : null}
        {loading ? <div>Loading…</div> : null}
        {!loading && (
          <>
            <form onSubmit={addPrice} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded mb-6">
              <div className="md:col-span-2 font-semibold">Add Price</div>
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input className="w-full px-3 py-2 rounded border bg-transparent" value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Price (USD)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 rounded border bg-transparent" value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Description</label>
                <textarea className="w-full px-3 py-2 rounded border bg-transparent" rows={3} value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Example Image</label>
                <ImageUpload
                  type="commission"
                  currentImageUrl={form.imageUrl}
                  onImageChange={(url) => setForm(s => ({ ...s, imageUrl: url }))}
                  className="h-32"
                />
                <p className="text-xs text-gray-500 mt-1">Optional. Upload an example image for this pricing tier.</p>
              </div>
              <div className="md:col-span-2">
                <button className="px-4 py-2 rounded bg-emerald-600 text-white">Add</button>
              </div>
            </form>

            <div className="space-y-4">
              {prices.length === 0 ? (
                <div className="text-gray-500">No price points yet.</div>
              ) : (
                prices.map((p) => (
                  <div key={p.id} className="p-4 border rounded">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-center">
                      <div className="md:col-span-2">
                        <input className="w-full px-3 py-2 rounded border bg-transparent" defaultValue={p.title} onBlur={(e) => updatePrice(p.id, { title: e.target.value })} />
                      </div>
                      <div>
                        <input type="number" step="0.01" className="w-full px-3 py-2 rounded border bg-transparent" defaultValue={p.price} onBlur={(e) => updatePrice(p.id, { price: Number(e.target.value) })} />
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Example Image</div>
                        <ImageUpload
                          type="commission"
                          currentImageUrl={p.imageUrl}
                          onImageChange={(url) => updatePrice(p.id, { imageUrl: url })}
                          className="h-20"
                        />
                      </div>
                      <div>
                        <label className="text-sm mr-2">Active</label>
                        <input type="checkbox" defaultChecked={p.active} onChange={(e) => updatePrice(p.id, { active: e.target.checked } as any)} />
                      </div>
                      <div className="text-right">
                        <button onClick={() => removePrice(p.id)} className="px-3 py-2 rounded border border-red-600 text-red-600">Delete</button>
                      </div>
                      <div className="md:col-span-8">
                        <textarea className="w-full px-3 py-2 rounded border bg-transparent" placeholder="Description" defaultValue={p.description || ''} onBlur={(e) => updatePrice(p.id, { description: e.target.value || null as any })} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

