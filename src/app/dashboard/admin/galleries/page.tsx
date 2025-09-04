'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistCredit from '@/components/ArtistCredit';
import { FaImages, FaEye, FaUser, FaEnvelope, FaCalendarAlt, FaCrown, FaUserShield, FaShieldAlt } from 'react-icons/fa';

interface AdminGallery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  _count: {
    items: number;
  };
  items?: AdminGalleryItem[];
}

interface AdminGalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
}

export default function AdminGalleriesPage() {
  const router = useRouter();
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('SUPERADMIN');
  const [galleries, setGalleries] = useState<AdminGallery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGalleries = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/galleries');
      if (response.ok) {
        const data = await response.json();
        setGalleries(data);
      } else if (response.status === 403) {
        // Not a superadmin
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch galleries:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <FaUserShield className="text-blue-600" title="Admin" />;
      default:
        return <FaUser className="text-green-600" title="User" />;
    }
  };

  const getUserStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-200' },
      DEACTIVATED: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkText: 'dark:text-yellow-200' },
      DELETED: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900', darkText: 'dark:text-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading all galleries...</p>
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
          <div className="flex items-center">
            <FaShieldAlt className="text-3xl text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                All Galleries
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Superadmin view of all galleries across the platform for diagnostic purposes
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <FaCrown className="text-purple-600 mr-2" />
                <span className="text-purple-800 dark:text-purple-200 font-medium">
                  {galleries.length} Total Galleries
                </span>
              </div>
            </div>
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
                      {gallery.items.slice(0, 4).map((item) => (
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
                  </div>

                  {gallery.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  {/* User Information */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getUserRoleIcon(gallery.user.role)}
                        <span className="ml-2 font-medium text-sm text-gray-900 dark:text-gray-100">
                          {gallery.user.name}
                        </span>
                      </div>
                      {getUserStatusBadge(gallery.user.status)}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <FaEnvelope className="mr-1" />
                      <span className="truncate">{gallery.user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <FaImages className="mr-1" />
                      <span>{gallery._count.items} artworks</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      <span>{formatDate(gallery.createdAt)}</span>
                    </div>
                  </div>

                  {/* Recent Artworks with Attribution */}
                  {gallery.items && gallery.items.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
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

                  <div className="flex gap-2">
                    {gallery.isPublic && (
                      <Link
                        href={`/g/${gallery.slug}`}
                        target="_blank"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition text-sm inline-flex items-center justify-center"
                      >
                        <FaEye className="mr-1" />
                        View Public
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/galleries/${gallery.id}`}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-center hover:bg-gray-700 transition text-sm"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FaImages className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No galleries found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              There are currently no galleries on the platform.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}