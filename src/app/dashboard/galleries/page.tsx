'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistCredit from '@/components/ArtistCredit';
import { FaPlus, FaImages, FaEye, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  _count?: {
    items: number;
  };
  items?: GalleryItem[];
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
}

export default function GalleriesPage() {
  const router = useRouter();
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/galleries');
      if (response.ok) {
        const data = await response.json();
        setGalleries(data);
      }
    } catch (error) {
      console.error('Failed to fetch galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGalleries(galleries.filter(g => g.id !== galleryId));
      } else {
        alert('Failed to delete gallery');
      }
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      alert('Failed to delete gallery');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading galleries...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Galleries
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize and manage your artwork collections
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              href="/dashboard/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
            >
              <FaUpload className="mr-2" />
              Upload Art
            </Link>
            <Link
              href="/dashboard/galleries/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              New Gallery
            </Link>
          </div>
        </div>

        {/* Galleries Grid */}
        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Gallery Preview */}
                <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
                  {gallery.items && gallery.items.length > 0 ? (
                    <div className="grid grid-cols-2 h-full">
                      {gallery.items.slice(0, 4).map((item, index) => (
                        <img
                          key={item.id}
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          style={{
                            gridColumn: gallery.items!.length === 1 ? 'span 2' : undefined,
                            gridRow: gallery.items!.length === 1 ? 'span 2' : undefined,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FaImages className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No artworks</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        gallery.isPublic
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {gallery.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                      {gallery.name}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Link
                        href={`/dashboard/galleries/${gallery.id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="Edit gallery"
                      >
                        <FaEdit size={16} />
                      </Link>
                      <button
                        onClick={() => deleteGallery(gallery.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete gallery"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>

                  {gallery.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaImages className="mr-1" />
                      <span>{gallery._count?.items || 0} artworks</span>
                    </div>
                    <span>{formatDate(gallery.createdAt)}</span>
                  </div>

                  {/* Recent Artworks with Attribution */}
                  {gallery.items && gallery.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-1">
                        {gallery.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {item.title}
                            </span>
                            <ArtistCredit
                              artistName={item.artistName}
                              artistPortfolioSlug={item.artistPortfolioSlug}
                              artistExternalUrl={item.artistExternalUrl}
                              isOriginalWork={item.isOriginalWork}
                              className="text-xs"
                              showLabel={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/dashboard/galleries/${gallery.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition text-sm"
                    >
                      Manage
                    </Link>
                    {gallery.isPublic && (
                      <Link
                        href={`/g/${gallery.slug}`}
                        target="_blank"
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700 transition text-sm inline-flex items-center justify-center"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FaImages className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No galleries yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start organizing your artwork by creating your first gallery. Galleries help you group related pieces together.
            </p>
            <Link
              href="/dashboard/galleries/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Your First Gallery
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}