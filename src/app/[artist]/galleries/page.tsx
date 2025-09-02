import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import PlaceholderArt from '@/components/PlaceholderArt';

export default async function ArtistGalleries({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: artist }, include: { featuredItem: true } });
  if (!portfolio) return null;
  const galleries = await prisma.gallery.findMany({
    where: { userId: portfolio.userId, isPublic: true },
    orderBy: { createdAt: 'desc' },
    include: {
      featuredItem: true,
      items: {
        take: 1,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, imageUrl: true },
      }
    }
  });

  return (
    <div className="min-h-screen">
      <section className="relative">
        <div className="relative h-56 md:h-72 w-full bg-black">
          {portfolio.featuredItem?.imageUrl ? (
            <Image src={portfolio.featuredItem.imageUrl} alt="Featured galleries" fill className="object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><PlaceholderArt width={1200} height={288} /></div>
          )}
        </div>
        <div className="container mx-auto px-4 text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Galleries</h1>
          <p className="text-gray-400">Collections from {portfolio.displayName}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No public galleries yet.</div>
          ) : (
            galleries.map((g) => (
              <Link key={g.id} href={`/g/${g.slug}`} className="rounded-lg overflow-hidden bg-black shadow-lg block group">
                <div className="relative h-40">
                  {g.featuredItem?.imageUrl || g.items?.[0]?.imageUrl ? (
                    <Image src={(g.featuredItem?.imageUrl || g.items?.[0]?.imageUrl)!} alt={g.name} fill className="object-cover group-hover:opacity-90 transition" />
                  ) : (
                    <PlaceholderArt width={400} height={160} className="w-full h-full" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">{g.name}</h3>
                  <p className="text-gray-400">{g.description || 'A curated collection of works.'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
