'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FaPalette, FaUser, FaImages, FaEye, FaHeart, FaExternalLinkAlt, FaSearch, FaFilter } from 'react-icons/fa';

interface Artist {
  id: string;
  email: string;
  displayName?: string;
  portfolioSlug?: string;
  isPublic: boolean;
  createdAt: string;
  lastActiveAt?: string;
  stats: {
    totalGalleries: number;
    totalArtworks: number;
    totalViews: number;
    totalLikes: number;
  };
  profileImage?: string;
  bio?: string;
}

export default function ArtistsPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most-active, most-views
  const [filterBy, setFilterBy] = useState('all'); // all, public, private

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    filterAndSortArtists();
  }, [artists, searchTerm, sortBy, filterBy]);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/admin/artists');
      if (response.ok) {
        const data = await response.json();
        setArtists(data.artists || []);
      } else {
        // Mock data for now
        const mockArtists = [
          {
            id: '1',
            email: 'artist1@example.com',
            displayName: 'Digital Dreams',
            portfolioSlug: 'digital-dreams',
            isPublic: true,
            createdAt: '2024-01-15T10:30:00Z',
            lastActiveAt: '2024-12-01T15:45:00Z',
            stats: {
              totalGalleries: 5,
              totalArtworks: 23,
              totalViews: 1247,
              totalLikes: 89,
            },
            profileImage: 'https://via.placeholder.com/150',
            bio: 'Creating digital art and fantasy illustrations',
          },
          {
            id: '2',
            email: 'artist2@example.com',
            displayName: 'Pixel Master',
            portfolioSlug: 'pixel-master',
            isPublic: true,
            createdAt: '2024-02-20T14:20:00Z',
            lastActiveAt: '2024-11-28T09:30:00Z',
            stats: {
              totalGalleries: 3,
              totalArtworks: 45,
              totalViews: 2156,
              totalLikes: 156,
            },
            profileImage: 'https://via.placeholder.com/150',
            bio: 'Pixel art specialist and game asset creator',
          },
          {
            id: '3',
            email: 'artist3@example.com',
            displayName: 'Sketch Studio',
            portfolioSlug: '',
            isPublic: false,
            createdAt: '2024-03-10T08:15:00Z',
            lastActiveAt: '2024-11-25T12:00:00Z',
            stats: {
              totalGalleries: 2,
              totalArtworks: 12,
              totalViews: 456,
              totalLikes: 34,
            },
            bio: 'Traditional sketches and concept art',
          },
        ];
        setArtists(mockArtists);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArtists = () => {
    let filtered = [...artists];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.portfolioSlug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by visibility
    if (filterBy === 'public') {
      filtered = filtered.filter(artist => artist.isPublic);
    } else if (filterBy === 'private') {
      filtered = filtered.filter(artist => !artist.isPublic);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-active':
          if (!a.lastActiveAt && !b.lastActiveAt) return 0;
          if (!a.lastActiveAt) return 1;
          if (!b.lastActiveAt) return -1;
          return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
        case 'most-views':
          return b.stats.totalViews - a.stats.totalViews;
        default:
          return 0;
      }
    });

    setFilteredArtists(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading artists...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaPalette className="mr-3 text-2xl text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                All Artists
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and overview all artist portfolios
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredArtists.length} of {artists.length} artists
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search artists by name, email, or portfolio..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-active">Most Active</option>
                <option value="most-views">Most Views</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Artists</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Artist Header */}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {artist.profileImage ? (
                        <img
                          src={artist.profileImage}
                          alt={artist.displayName || artist.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {artist.displayName || artist.email}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            artist.isPublic
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {artist.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {artist.email}
                      </p>
                      
                      {artist.portfolioSlug && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          /{artist.portfolioSlug}
                        </p>
                      )}
                      
                      {artist.bio && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <FaImages className="text-purple-600 mr-1" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {artist.stats.totalArtworks}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        in {artist.stats.totalGalleries} galleries
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <FaEye className="text-blue-600 mr-1" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {artist.stats.totalViews.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                        <FaHeart className="text-red-500 mr-1" />
                        {artist.stats.totalLikes} likes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Joined {formatDate(artist.createdAt)}
                      </p>
                      {artist.lastActiveAt && (
                        <p className="text-gray-500 dark:text-gray-500">
                          Active {getTimeAgo(artist.lastActiveAt)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {artist.isPublic && artist.portfolioSlug && (
                        <a
                          href={`/${artist.portfolioSlug}`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaExternalLinkAlt className="mr-1" />
                          View
                        </a>
                      )}
                      
                      <button className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FaPalette className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || filterBy !== 'all' ? 'No artists found' : 'No artists yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterBy !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Artists will appear here as they sign up and create portfolios'
              }
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {artists.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Artists</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {artists.filter(a => a.isPublic).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Public Portfolios</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {artists.reduce((sum, a) => sum + a.stats.totalArtworks, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Artworks</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {artists.reduce((sum, a) => sum + a.stats.totalViews, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}