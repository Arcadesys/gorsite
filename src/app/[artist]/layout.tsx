import { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import { SiteProvider } from '@/context/SiteContext';
import ApplySiteTheme from '@/components/ApplySiteTheme';

export default async function ArtistLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { artist: string };
}) {
  const slug = params.artist;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } });
  const galleries = portfolio
    ? await prisma.gallery.findMany({
        where: { userId: portfolio.userId, isPublic: true },
        orderBy: [{ createdAt: 'asc' }],
        select: { slug: true, name: true },
      })
    : [];

  // If portfolio not found, render children without site context (will 404 in page)
  const value = portfolio
    ? {
        slug: portfolio.slug,
        displayName: portfolio.displayName,
        description: portfolio.description,
        accentColor: (portfolio.accentColor as any) || 'green',
        colorMode: (portfolio.colorMode as any) || 'dark',
        logoUrl: portfolio.logoUrl,
        heroImageLight: portfolio.heroImageLight,
        heroImageDark: portfolio.heroImageDark,
        heroImageMobile: portfolio.heroImageMobile,
        about: portfolio.about,
        galleries,
      }
    : null;

  if (!value) return <>{children}</>;

  return (
    <SiteProvider value={value}>
      <ApplySiteTheme />
      {children}
    </SiteProvider>
  );
}
