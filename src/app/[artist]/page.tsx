import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import PlaceholderArt from '@/components/PlaceholderArt';

export default async function ArtistHome({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const slug = artist;
  const portfolio = await prisma.portfolio.findUnique({ 
    where: { slug },
    select: {
      id: true,
      slug: true,
      displayName: true,
      description: true,
      about: true,
      heroImageLight: true,
      heroImageDark: true,
      heroImageMobile: true,
      userId: true,
      primaryColor: true,
      secondaryColor: true,
      footerText: true,
    }
  }) as any;
  if (!portfolio) return notFound();

  const galleries = await prisma.gallery.findMany({
    where: { userId: portfolio.userId, isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      featuredItem: true,
      items: {
        take: 1,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, imageUrl: true },
      },
    },
  });

  // Use user's custom colors or defaults
  const primaryColor = portfolio.primaryColor || '#10b981';
  const secondaryColor = portfolio.secondaryColor || '#059669';

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
            <Link 
              href={`/galleries`} 
              className="hover:opacity-80 transition-opacity"
              style={{ color: primaryColor }}
            >
              View all
            </Link>
          </div>
          {galleries.length === 0 ? (
            <div className="text-center text-gray-500">No public galleries yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleries.map((g) => (
                <Link key={g.id} href={`/${portfolio.slug}/${g.slug}`} className="rounded-lg overflow-hidden bg-black shadow-lg group">
                  <div className="relative h-56">
                    {g.featuredItem?.imageUrl || g.items?.[0]?.imageUrl ? (
                      <Image src={(g.featuredItem?.imageUrl || g.items?.[0]?.imageUrl)!} alt={g.name} fill className="object-cover" />
                    ) : (
                      <PlaceholderArt width={400} height={224} className="w-full h-full" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 
                      className="text-xl font-bold mb-1 group-hover:opacity-80 transition-opacity"
                      style={{ color: primaryColor }}
                    >
                      {g.name}
                    </h3>
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

      {/* Custom Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {portfolio.footerText ? (
              <p className="text-gray-400 mb-4">{portfolio.footerText}</p>
            ) : (
              <p className="text-gray-400 mb-4">
                © {new Date().getFullYear()} {portfolio.displayName}. All rights reserved.
              </p>
            )}
            
            {/* Color accent indicators */}
            <div className="flex justify-center items-center space-x-4">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
                title="Primary Color"
              ></div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: secondaryColor }}
                title="Secondary Color"
              ></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
