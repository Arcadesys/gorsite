import { notFound } from 'next/navigation';
import Image from 'next/image';
import PlaceholderArt from '@/components/PlaceholderArt';

async function getGallery(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/public/galleries/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function GalleryBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getGallery(slug);
  if (!data) return notFound();
  const { gallery, items } = data as any;

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
  );
}

