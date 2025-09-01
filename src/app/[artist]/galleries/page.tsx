import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ArtistGalleries({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: artist } });
  if (!portfolio) return null;
  const galleries = await prisma.gallery.findMany({
    where: { userId: portfolio.userId, isPublic: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen">
      <section className="relative py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galleries</h1>
          <p className="text-gray-400">Collections from {portfolio.displayName}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No public galleries yet.</div>
          ) : (
            galleries.map((g) => (
              <Link key={g.id} href={`/g/${g.slug}`} className="rounded-lg overflow-hidden bg-black shadow-lg">
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

