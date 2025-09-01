import Link from "next/link";
import Image from "next/image";
import PlaceholderArt from "@/components/PlaceholderArt";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "The Arcade Art Gallery",
  description: "Preview all active artist portfolios",
};

type PortfolioCard = {
  slug: string;
  displayName: string;
  description: string | null;
  heroImageDark: string | null;
  heroImageLight: string | null;
};

async function getActivePortfolios(): Promise<PortfolioCard[]> {
  return prisma.portfolio.findMany({
    where: { user: { status: 'ACTIVE' } },
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      displayName: true,
      description: true,
      heroImageDark: true,
      heroImageLight: true,
    },
  });
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
          {portfolios.length === 0 ? (
            <div className="text-center text-gray-400">No active portfolios yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map((p) => {
                const hero = p.heroImageDark || p.heroImageLight || null;
                return (
                  <Link key={p.slug} href={`/${p.slug}`} className="group rounded-lg overflow-hidden bg-black border border-gray-800 shadow-lg block">
                    <div className="relative h-48 w-full">
                      {hero ? (
                        <Image src={hero} alt={p.displayName} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                          <PlaceholderArt width={400} height={192} className="w-full h-full" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-emerald-400 mb-1">{p.displayName}</h3>
                      <p className="text-gray-400 line-clamp-2">{p.description || `/${p.slug}`}</p>
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
