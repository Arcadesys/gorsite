"use client"
import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

type Commission = {
  id: string
  clientName: string
  clientEmail: string
  description: string
  type: string
  status: string
  priority: string
  price: number | null
  queuePosition: number | null
  createdAt: string
}

const statusOptions = ['REQUESTED','APPROVED','IN_PROGRESS','REVISION','COMPLETED','DELIVERED','CANCELLED','REJECTED']
const priorityOptions = ['LOW','NORMAL','HIGH','URGENT']

export default function DashboardCommissionsPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST')
  const [items, setItems] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/commissions', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setItems(json.commissions || [])
    } catch (e: any) {
      setError(e.message || 'Error loading')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const patch = async (id: string, body: Partial<Commission>) => {
    const res = await fetch(`/api/commissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.error || 'Update failed'); return }
    await load()
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Commissions Queue</h1>
        <p className="text-gray-400 mb-6">Manage incoming requests. Reorder via queue position, update status and priority.</p>
        {error ? <div className="text-red-500 mb-4">{error}</div> : null}
        {loading ? <div>Loading…</div> : null}
        {!loading && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-gray-500">No commission requests yet.</div>
            ) : (
              items.map((c) => (
                <div key={c.id} className="p-4 border rounded">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                    <div className="md:col-span-2">
                      <div className="font-semibold">{c.clientName}</div>
                      <div className="text-sm text-gray-400">{c.clientEmail}</div>
                    </div>
                    <div>
                      <div className="text-sm">Type</div>
                      <div className="font-semibold">{c.type}</div>
                      {typeof c.price === 'number' ? <div className="text-sm text-gray-400">${c.price.toFixed(2)}</div> : null}
                    </div>
                    <div>
                      <div className="text-sm">Status</div>
                      <select defaultValue={c.status} onChange={(e) => patch(c.id, { status: e.target.value as any })} className="w-full px-2 py-2 rounded border bg-transparent">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="text-sm">Priority</div>
                      <select defaultValue={c.priority} onChange={(e) => patch(c.id, { priority: e.target.value as any })} className="w-full px-2 py-2 rounded border bg-transparent">
                        {priorityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="text-sm">Queue</div>
                      <input type="number" className="w-full px-3 py-2 rounded border bg-transparent" defaultValue={c.queuePosition ?? 0} onBlur={(e) => patch(c.id, { queuePosition: Number(e.target.value) } as any)} />
                    </div>
                    <div className="md:col-span-6">
                      <div className="text-sm mb-1">Description</div>
                      <textarea className="w-full px-3 py-2 rounded border bg-transparent" defaultValue={c.description} onBlur={(e) => patch(c.id, { description: e.target.value } as any)} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

