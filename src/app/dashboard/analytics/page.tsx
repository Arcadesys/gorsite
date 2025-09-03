'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FaChartBar, FaEye, FaHeart, FaImages, FaCalendarAlt, FaArrowUp } from 'react-icons/fa';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalGalleries: number;
  totalArtworks: number;
  viewsThisMonth: number;
  likesThisMonth: number;
  topGalleries: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
  }>;
  topArtworks: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    imageUrl: string;
  }>;
  monthlyStats: Array<{
    month: string;
    views: number;
    likes: number;
  }>;
}

export default function AnalyticsPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for now
        setAnalytics({
          totalViews: 1247,
          totalLikes: 89,
          totalGalleries: 5,
          totalArtworks: 23,
          viewsThisMonth: 234,
          likesThisMonth: 12,
          topGalleries: [
            { id: '1', name: 'Fantasy Characters', views: 450, likes: 32 },
            { id: '2', name: 'Digital Paintings', views: 389, likes: 28 },
            { id: '3', name: 'Sketches', views: 256, likes: 18 },
          ],
          topArtworks: [
            { id: '1', title: 'Dragon Warrior', views: 123, likes: 15, imageUrl: 'https://via.placeholder.com/150' },
            { id: '2', title: 'Mystic Forest', views: 98, likes: 12, imageUrl: 'https://via.placeholder.com/150' },
            { id: '3', title: 'Character Study', views: 87, likes: 10, imageUrl: 'https://via.placeholder.com/150' },
          ],
          monthlyStats: [
            { month: 'Jan', views: 89, likes: 7 },
            { month: 'Feb', views: 156, likes: 12 },
            { month: 'Mar', views: 234, likes: 18 },
            { month: 'Apr', views: 312, likes: 25 },
            { month: 'May', views: 289, likes: 21 },
            { month: 'Jun', views: 167, likes: 14 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <FaChartBar className="mr-3 text-2xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your portfolio performance and engagement
              </p>
            </div>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FaEye className="text-2xl text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-xs text-green-600">
                      +{analytics.viewsThisMonth} this month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FaHeart className="text-2xl text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.totalLikes}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                    <p className="text-xs text-green-600">
                      +{analytics.likesThisMonth} this month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FaImages className="text-2xl text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.totalArtworks}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Artworks</p>
                    <p className="text-xs text-gray-500">
                      in {analytics.totalGalleries} galleries
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FaArrowUp className="text-2xl text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.round((analytics.viewsThisMonth / analytics.totalViews) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Performance Over Time
              </h2>
              <div className="grid grid-cols-6 gap-4">
                {analytics.monthlyStats.map((stat, index) => (
                  <div key={stat.month} className="text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex flex-col space-y-1">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{
                            height: `${(stat.views / Math.max(...analytics.monthlyStats.map(s => s.views))) * 100}px`,
                            minHeight: '20px',
                            width: '20px'
                          }}
                        ></div>
                        <div
                          className="bg-red-500 rounded-b"
                          style={{
                            height: `${(stat.likes / Math.max(...analytics.monthlyStats.map(s => s.likes))) * 40}px`,
                            minHeight: '10px',
                            width: '20px'
                          }}
                        ></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{stat.month}</p>
                        <p className="text-xs text-blue-600">{stat.views}v</p>
                        <p className="text-xs text-red-600">{stat.likes}l</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Views</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Likes</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Galleries */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Top Performing Galleries
                </h2>
                <div className="space-y-4">
                  {analytics.topGalleries.map((gallery, index) => (
                    <div key={gallery.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3 w-6">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {gallery.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <FaEye className="mr-1" />
                              {gallery.views}
                            </span>
                            <span className="flex items-center">
                              <FaHeart className="mr-1" />
                              {gallery.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Artworks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Top Performing Artworks
                </h2>
                <div className="space-y-4">
                  {analytics.topArtworks.map((artwork, index) => (
                    <div key={artwork.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3 w-6">
                          #{index + 1}
                        </span>
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {artwork.title}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <FaEye className="mr-1" />
                              {artwork.views}
                            </span>
                            <span className="flex items-center">
                              <FaHeart className="mr-1" />
                              {artwork.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Insights & Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Most Engaging Content
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your "{analytics.topGalleries[0]?.name}" gallery has the highest engagement rate. 
                    Consider creating more content in this style.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Growth Opportunity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You've gained {analytics.viewsThisMonth} views this month. 
                    Keep uploading regularly to maintain momentum.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}