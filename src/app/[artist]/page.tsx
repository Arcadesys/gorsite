import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import PlaceholderArt from '@/components/PlaceholderArt';

export default async function ArtistHome({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const slug = artist;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } });
  if (!portfolio) return notFound();

  const galleries = await prisma.gallery.findMany({
    where: { userId: portfolio.userId, isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <div className="min-h-screen">
      {/* Hero with desktop/mobile variants if provided */}
      <section className="relative">
        <div className="hidden md:block relative h-[380px] w-full bg-black">
          {portfolio.heroImageDark || portfolio.heroImageLight ? (
            <Image src={portfolio.heroImageDark || portfolio.heroImageLight!} alt={portfolio.displayName} fill className="object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><PlaceholderArt width={1200} height={380} /></div>
          )}
        </div>
        <div className="md:hidden relative h-64 w-full bg-black">
          {portfolio.heroImageMobile || portfolio.heroImageLight ? (
            <Image src={portfolio.heroImageMobile || portfolio.heroImageLight!} alt={portfolio.displayName} fill className="object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><PlaceholderArt width={400} height={256} /></div>
          )}
        </div>
      </section>
      <section className="py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{portfolio.displayName}</h1>
          {portfolio.about ? (
            <div className="prose prose-invert max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: portfolio.about }} />
          ) : (
            portfolio.description ? (<p className="text-gray-400 max-w-2xl mx-auto">{portfolio.description}</p>) : null
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Featured Galleries</h2>
            <Link href={`/galleries`} className="text-emerald-400 hover:text-emerald-300">View all</Link>
          </div>
          {galleries.length === 0 ? (
            <div className="text-center text-gray-500">No public galleries yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleries.map((g) => (
                <Link key={g.id} href={`/${portfolio.slug}/${g.slug}`} className="rounded-lg overflow-hidden bg-black shadow-lg">
                  <div className="relative h-56">
                    {/* In absence of cover image, show placeholder */}
                    <PlaceholderArt width={400} height={224} className="w-full h-full" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-emerald-400 mb-1">{g.name}</h3>
                    {g.description ? (
                      <p className="text-gray-400 line-clamp-2">{g.description}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
