import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ArtistLinksPage({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params
  const slug = artist
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } })
  if (!portfolio) return notFound()

  const links = await prisma.link.findMany({
    where: { portfolioId: portfolio.id, isPublic: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{portfolio.displayName} Links</h1>
          {portfolio.description ? (
            <p className="text-gray-400">{portfolio.description}</p>
          ) : null}
        </div>

        {links.length === 0 ? (
          <div className="text-center text-gray-500">No links yet.</div>
        ) : (
          <ul className="space-y-4">
            {links.map((l) => (
              <li key={l.id} className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
                <Link href={l.url} target="_blank" className="flex items-center p-4 gap-4 hover:bg-black/40">
                  {l.imageUrl ? (
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-900 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold truncate">{l.title}</p>
                    <p className="text-sm text-gray-400 truncate">{l.url}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

