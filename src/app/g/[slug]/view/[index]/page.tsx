"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type GalleryItem = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  altText?: string | null;
  tags?: string | null;
  createdAt: string;
  artistPortfolioSlug?: string | null;
};

type PublicGalleryResponse = {
  gallery: { id: string; name: string; slug: string; description?: string | null };
  items: GalleryItem[];
  ownerPortfolioSlug?: string | null;
};

export default function GalleryViewerPage() {
  const params = useParams<{ slug: string; index: string }>();
  const router = useRouter();
  const [data, setData] = useState<PublicGalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  const slug = params?.slug;
  const currentIndex = useMemo(() => {
    const n = parseInt(params?.index || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [params?.index]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/galleries/${slug}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load gallery");
        const json = (await res.json()) as PublicGalleryResponse;
        if (active) setData(json);
      } catch (e) {
        // swallow; page will render a minimal error state
      } finally {
        if (active) setLoading(false);
      }
    }
    if (slug) load();
    return () => {
      active = false;
    };
  }, [slug]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!data) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") router.push(`/g/${slug}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, currentIndex, slug]);

  const total = data?.items?.length || 0;
  const clampedIndex = Math.max(0, Math.min(currentIndex, Math.max(0, total - 1)));
  const item = total > 0 ? data!.items[clampedIndex] : undefined;

  const canPrev = clampedIndex > 0;
  const canNext = clampedIndex < total - 1;

  const navigateTo = (idx: number) => router.push(`/g/${slug}/view/${idx}`);
  const prev = () => canPrev && navigateTo(clampedIndex - 1);
  const next = () => canNext && navigateTo(clampedIndex + 1);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <Link href={`/g/${slug}`} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm">
            ← Back to gallery
          </Link>
          {data?.gallery?.name ? (
            <span className="text-sm text-gray-300">{data.gallery.name}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCTA(true)} className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium">
            Artist Offers
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Left click area */}
        <button
          aria-label="Previous"
          onClick={prev}
          disabled={!canPrev}
          className={`absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-${canPrev ? "pointer" : "default"} ${canPrev ? "hover:bg-white/5" : "opacity-40"}`}
        />
        {/* Right click area */}
        <button
          aria-label="Next"
          onClick={next}
          disabled={!canNext}
          className={`absolute right-0 top-0 bottom-0 w-1/4 z-10 cursor-${canNext ? "pointer" : "default"} ${canNext ? "hover:bg-white/5" : "opacity-40"}`}
        />

        {/* Image or loading */}
        <div className="relative w-full h-full flex items-center justify-center">
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : item ? (
            // Use object-contain to keep it within viewport
            <div className="relative w-full h-full">
              <Image
                src={item.imageUrl}
                alt={item.altText || item.title}
                fill
                sizes="100vw"
                className="!object-contain select-none !rounded-none"
                priority
              />
            </div>
          ) : (
            <div className="text-gray-400">No image</div>
          )}
        </div>

        {/* Caption */}
        {item ? (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{item.title}</div>
                  {item.description ? (
                    <div className="text-sm text-gray-300 mt-1 line-clamp-3">{item.description}</div>
                  ) : null}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {clampedIndex + 1} / {total}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* CTA Modal */}
      {showCTA && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCTA(false)} />
          <div className="relative z-10 max-w-lg w-full mx-4 rounded-lg shadow-xl" style={{ backgroundColor: "#0b0b0b" }}>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="text-lg font-semibold">Support the Artist</div>
              <button onClick={() => setShowCTA(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4 text-gray-200">
              <p>
                Love this piece? Explore commission options, join the mailing list, or follow for updates.
              </p>
              <div className="flex flex-wrap gap-3">
                {data?.ownerPortfolioSlug ? (
                  <Link
                    href={`/${data.ownerPortfolioSlug}/commissions`}
                    className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-medium"
                  >
                    View Commission Pricing
                  </Link>
                ) : null}
                {item?.artistPortfolioSlug ? (
                  <Link
                    href={`/${item.artistPortfolioSlug}`}
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                  >
                    Visit Artist Portfolio
                  </Link>
                ) : null}
                {data?.ownerPortfolioSlug ? (
                  <Link
                    href={`/${data.ownerPortfolioSlug}`}
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                  >
                    Join Mailing List (Coming Soon)
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded bg-white/5 text-gray-400">Artist links unavailable</span>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-white/10 text-right">
              <button onClick={() => setShowCTA(false)} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
