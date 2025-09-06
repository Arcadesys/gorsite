'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistCredit from '@/components/ArtistCredit';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaUpload } from 'react-icons/fa';

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  featuredItemId?: string | null;
}

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  tags?: string;
  position?: number;
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
  createdAt: string;
}

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const router = useRouter();
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryId, setGalleryId] = useState<string>('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setGalleryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (galleryId) {
      fetchGalleryData();
    }
  }, [galleryId]);

  const fetchGalleryData = async () => {
    try {
      // Fetch gallery info
      const galleryResponse = await fetch(`/api/galleries/${galleryId}`);
      if (galleryResponse.ok) {
        const galleryData = await galleryResponse.json();
        setGallery(galleryData);
      }

      // Fetch gallery items
      const itemsResponse = await fetch(`/api/galleries/${galleryId}/items`);
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Failed to fetch gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery-items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
      } else {
        alert('Failed to delete artwork');
      }
    } catch (error) {
      console.error('Failed to delete artwork:', error);
      alert('Failed to delete artwork');
    }
  };

  const setFeaturedForGallery = async (itemId: string) => {
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredItemId: itemId }),
      });
      if (response.ok) {
        const updated = await response.json();
        setGallery(updated);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Failed to set featured image');
      }
    } catch (e) {
      console.error('Failed to set featured image', e);
      alert('Failed to set featured image');
    }
  };

  const setFeaturedForPortfolio = async (itemId: string) => {
    try {
      const response = await fetch(`/api/studio/portfolio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredItemId: itemId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.error || 'Failed to set main featured image');
      } else {
        alert('Set as main featured image');
      }
    } catch (e) {
      console.error('Failed to set main featured image', e);
      alert('Failed to set main featured image');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const parseTags = (tagsString?: string): string[] => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading gallery...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!gallery) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Gallery not found
          </h1>
          <Link
            href="/dashboard/galleries"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to galleries
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/dashboard/galleries"
              className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <FaArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {gallery.name}
              </h1>
              {gallery.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {gallery.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  gallery.isPublic
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {gallery.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/dashboard/upload?gallery=${galleryId}&mode=bulk`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition inline-flex items-center justify-center"
            >
              <FaUpload className="mr-2" />
              Bulk Upload
            </Link>
            <Link
              href={`/dashboard/upload?gallery=${galleryId}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center justify-center"
            >
              <FaUpload className="mr-2" />
              Add Artwork
            </Link>
            <Link
              href={`/dashboard/galleries/${galleryId}/edit`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition inline-flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Edit Gallery
            </Link>
            {gallery.isPublic && (
              <Link
                href={`/g/${gallery.slug}`}
                target="_blank"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-flex items-center justify-center"
              >
                <FaEye className="mr-2" />
                View Public
              </Link>
            )}
          </div>
        </div>

        {/* Gallery Items */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImageUrl(item.imageUrl)}>
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageUrl(item.imageUrl);
                        }}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
                        title="View full image"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/artworks/${item.id}/edit`);
                        }}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
                        title="Edit artwork"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition"
                        title="Delete artwork"
                      >
                        <FaTrash size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeaturedForGallery(item.id);
                        }}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
                        title="Set as gallery featured"
                      >
                        ⭐
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeaturedForPortfolio(item.id);
                        }}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
                        title="Set as main featured"
                      >
                        🏠
                      </button>
                    </div>
                  </div>
                  {gallery?.featuredItemId === item.id && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Featured</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Artist Attribution */}
                  <ArtistCredit
                    artistName={item.artistName}
                    artistPortfolioSlug={item.artistPortfolioSlug}
                    artistExternalUrl={item.artistExternalUrl}
                    isOriginalWork={item.isOriginalWork}
                    className="mb-2"
                  />

                  {/* Tags */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {parseTags(item.tags).slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {parseTags(item.tags).length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{parseTags(item.tags).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FaUpload className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No artworks in this gallery
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start building your collection by adding your first artwork to this gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/dashboard/upload?gallery=${galleryId}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                Add Single Artwork
              </Link>
              <Link
                href={`/dashboard/upload?gallery=${galleryId}&mode=bulk`}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition inline-flex items-center justify-center"
              >
                <FaUpload className="mr-2" />
                Bulk Upload
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4" onClick={() => setSelectedImageUrl(null)}>
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition z-10"
              title="Close"
            >
              ✕
            </button>
            <img
              src={selectedImageUrl}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
