import Link from "next/link";
import Image from "next/image";
import PlaceholderArt from "@/components/PlaceholderArt";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "The Arcade Art Gallery - Featured Artists",
  description: "Discover unique portfolios from our talented community of artists with their profile pictures and latest work",
};

type PortfolioCard = {
  slug: string;
  displayName: string;
  description: string | null;
  heroImageDark: string | null;
  heroImageLight: string | null;
  profileImageUrl: string | null;
};

async function getActivePortfolios(): Promise<PortfolioCard[]> {
  try {
    return await prisma.portfolio.findMany({
      where: { user: { status: 'ACTIVE' } },
      orderBy: { createdAt: 'desc' },
      select: {
        slug: true,
        displayName: true,
        description: true,
        heroImageDark: true,
        heroImageLight: true,
        profileImageUrl: true,
      },
    });
  } catch (error: any) {
    // Handle database connection issues during build
    if (error?.message?.includes('Environment variable not found: DATABASE_URL') || 
        error?.code === 'P1001') {
      console.warn('Database not available during build, returning empty portfolios');
      return [];
    }
    throw error;
  }
}

export default async function Home() {
  const portfolios = await getActivePortfolios();

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-emerald-400 mb-4">
            The Arcade Art Gallery
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Explore previews from all active artist portfolios.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Artists</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Discover unique portfolios from our talented community of artists</p>
          </div>
          {portfolios.length === 0 ? (
            <div className="text-center text-gray-400">No active portfolios yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map((p) => {
                const hero = p.heroImageDark || p.heroImageLight || null;
                return (
                  <Link key={p.slug} href={`/${p.slug}`} className="group rounded-xl overflow-hidden bg-black border border-gray-700 shadow-xl hover:shadow-2xl block transform hover:scale-[1.02] transition-all duration-300 hover:border-emerald-400/50">
                    <div className="relative h-52 w-full">
                      {hero ? (
                        <Image src={hero} alt={p.displayName} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" priority={portfolios.indexOf(p) < 3} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                          <PlaceholderArt width={400} height={208} className="w-full h-full opacity-60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      {/* Profile Picture Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3">
                        {p.profileImageUrl ? (
                          <div className="relative flex-shrink-0">
                            <Image 
                              src={p.profileImageUrl} 
                              alt={`${p.displayName} profile`} 
                              width={56} 
                              height={56} 
                              className="rounded-full border-3 border-white shadow-lg object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 rounded-full ring-2 ring-emerald-400/30 group-hover:ring-emerald-400/70 transition-all duration-300" />
                            {/* Online indicator dot */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-3 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {/* Online indicator dot */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 truncate drop-shadow-sm">{p.displayName}</h3>
                          <p className="text-gray-200 text-sm truncate drop-shadow-sm opacity-90">{p.description ? p.description.substring(0, 45) + (p.description.length > 45 ? '...' : '') : `Visit /${p.slug}`}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
