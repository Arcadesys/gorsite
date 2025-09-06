'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistCredit from '@/components/ArtistCredit';
import { FaImages, FaUpload, FaEye, FaHeart, FaPlus } from 'react-icons/fa';

interface DashboardStats {
  totalGalleries: number;
  totalArtworks: number;
  totalViews: number;
  totalLikes: number;
}

interface RecentArtwork {
  id: string;
  title: string;
  imageUrl: string;
  galleryName: string;
  createdAt: string;
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
}

export default function DashboardHome() {
  const [userRole, setUserRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [stats, setStats] = useState<DashboardStats>({
    totalGalleries: 0,
    totalArtworks: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get user info and role
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserRole(userData.user.role);
        }

        // Get dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalGalleries: statsData.totalGalleries,
            totalArtworks: statsData.totalArtworks,
            totalViews: statsData.totalViews,
            totalLikes: statsData.totalLikes,
          });
        }

        // Get recent artworks
        const artworksResponse = await fetch('/api/dashboard/recent-artworks?limit=6');
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json();
          setRecentArtworks(artworksData.artworks || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userRole === 'ARTIST' ? 'Artist Studio' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'ARTIST' 
              ? 'Manage your artwork, galleries, and portfolio'
              : 'Manage the platform and all artists'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/upload"
              className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition group"
            >
              <FaUpload className="text-2xl mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Upload Artwork</h3>
              <p className="text-sm opacity-90">Add new art to your galleries</p>
            </Link>
            
            <Link
              href="/dashboard/galleries"
              className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition group"
            >
              <FaImages className="text-2xl mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Manage Galleries</h3>
              <p className="text-sm opacity-90">Organize your artwork</p>
            </Link>
            
            <Link
              href="/dashboard/galleries/new"
              className="p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition group"
            >
              <FaPlus className="text-2xl mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">New Gallery</h3>
              <p className="text-sm opacity-90">Create a new collection</p>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FaImages className="text-2xl text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalGalleries}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Galleries</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FaUpload className="text-2xl text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalArtworks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Artworks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FaEye className="text-2xl text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FaHeart className="text-2xl text-red-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalLikes}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Artworks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Artworks
            </h2>
            <Link
              href="/dashboard/galleries"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          
          {recentArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      in {artwork.galleryName}
                    </p>
                    <ArtistCredit
                      artistName={artwork.artistName}
                      artistPortfolioSlug={artwork.artistPortfolioSlug}
                      artistExternalUrl={artwork.artistExternalUrl}
                      isOriginalWork={artwork.isOriginalWork}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(artwork.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FaImages className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No artworks yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your portfolio by uploading your first artwork
              </p>
              <Link
                href="/dashboard/upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
              >
                <FaUpload className="mr-2" />
                Upload First Artwork
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}