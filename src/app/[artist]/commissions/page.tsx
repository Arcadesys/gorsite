import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ArtistCommissionsPage({ params, searchParams }: { params: Promise<{ artist: string }>, searchParams?: { submitted?: string } }) {
  const { artist } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: artist } })
  if (!portfolio) return notFound()
  const tiers = await prisma.commissionPrice.findMany({
    where: { portfolioId: portfolio.id, active: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="min-h-screen">
      <section className="relative py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Commissions</h1>
          {portfolio.description ? (<p className="text-gray-400 max-w-2xl mx-auto">{portfolio.description}</p>) : null}
        </div>
      </section>
      <section className="py-12">
        {searchParams?.submitted ? (
          <div className="container mx-auto px-4 mb-6">
            <div className="p-4 rounded border border-emerald-700 bg-emerald-900/30 text-emerald-200">
              Thank you! Your commission request has been submitted.
            </div>
          </div>
        ) : null}
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No price points yet.</div>
          ) : (
            tiers.map((t) => (
              <div key={t.id} className="p-6 rounded-lg border bg-black">
                {t.imageUrl ? <img src={t.imageUrl} alt={t.title} className="rounded mb-4 w-full h-48 object-cover" /> : null}
                <h3 className="text-xl font-bold text-emerald-400">{t.title}</h3>
                {t.description ? <p className="text-gray-400 mt-2">{t.description}</p> : null}
                <div className="mt-4 text-white font-semibold">${t.price.toFixed(2)}</div>
                <Link href={`/${portfolio.slug}/commissions/request?tier=${t.id}`} className="inline-block mt-4 text-emerald-400">Request this</Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
