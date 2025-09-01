import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function CommissionRequestPage({ params, searchParams }: { params: { artist: string }, searchParams: { tier?: string } }) {
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: params.artist } })
  if (!portfolio) return redirect(`/${params.artist}/commissions`)
  const tierId = searchParams.tier
  const tier = tierId ? await prisma.commissionPrice.findFirst({ where: { id: tierId, portfolioId: portfolio.id } }) : null

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Commission Request</h1>
        {tier ? (
          <div className="mb-6 p-4 rounded border">
            <div className="font-semibold">Selected: {tier.title}</div>
            <div className="text-sm text-gray-400">${tier.price.toFixed(2)}</div>
          </div>
        ) : null}
        <form action={`/${portfolio.slug}/commissions/request/submit`} method="post" className="space-y-4">
          <input type="hidden" name="tierId" value={tier?.id || ''} />
          <div>
            <label className="block text-sm mb-1">Your Name</label>
            <input name="clientName" className="w-full px-3 py-2 rounded border bg-transparent" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Your Email</label>
            <input type="email" name="clientEmail" className="w-full px-3 py-2 rounded border bg-transparent" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" className="w-full px-3 py-2 rounded border bg-transparent" rows={6} required />
          </div>
          <button className="px-4 py-2 rounded bg-emerald-600 text-white">Submit Request</button>
        </form>
      </div>
    </div>
  )
}

