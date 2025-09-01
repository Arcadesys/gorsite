import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import PlaceholderArt from '@/components/PlaceholderArt'

export default async function ArtistGalleryPage({ params }: { params: Promise<{ artist: string, gallery: string }> }) {
  const { artist, gallery: gallerySlug } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: artist } })
  if (!portfolio) return notFound()
  const gallery = await prisma.gallery.findUnique({ where: { userId_slug: { userId: portfolio.userId, slug: gallerySlug } } })
  if (!gallery || !gallery.isPublic) return notFound()
  const items = await prisma.galleryItem.findMany({ where: { galleryId: gallery.id }, orderBy: [{ position: 'asc' }, { createdAt: 'desc' }] })

  return (
    <div className="min-h-screen">
      <section className="relative py-16 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{gallery.name}</h1>
          {gallery.description ? (
            <p className="text-gray-300 max-w-2xl mx-auto">{gallery.description}</p>
          ) : null}
        </div>
      </section>

      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No items in this gallery yet.</div>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="rounded-lg overflow-hidden bg-black shadow-lg">
                <div className="relative h-64">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.altText || item.title} fill className="object-cover" />
                  ) : (
                    <PlaceholderArt width={400} height={256} className="w-full h-full" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">{item.title}</h3>
                  {item.description ? <p className="text-gray-400 mb-2">{item.description}</p> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

