'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { FaImage, FaUser, FaCalendar, FaTag, FaExternalLinkAlt, FaEye, FaLink } from 'react-icons/fa';

interface Upload {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  tags?: string;
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    role: string;
    status: string;
  };
  galleryName: string;
  gallerySlug: string;
  galleryIsPublic: boolean;
  gallery: {
    id: string;
  };
  artistPortfolio?: {
    id: string;
    slug: string;
    displayName: string;
  };
}

export default function AdminUploadsPage() {
  const { accentColor, colorMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadUploads = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Check if user is superadmin
      const isAdmin = Boolean(
        (user as any)?.app_metadata?.roles?.includes?.('admin') ||
        (typeof (user as any)?.user_metadata?.role === 'string' && (user as any).user_metadata.role.toLowerCase() === 'admin') ||
        (user as any)?.user_metadata?.is_admin === true
      );
      
      const superEmail = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'austen@thearcades.me').toLowerCase();
      const isSuperAdmin = isAdmin && (String((user as any)?.email || '').toLowerCase() === superEmail);

      if (!isSuperAdmin) {
        router.push('/dashboard');
        return;
      }

      setUserRole('SUPERADMIN');
      await loadUploads();
      setLoading(false);
    };

    checkAuthAndLoadUploads();
  }, [router]);

  const loadUploads = async () => {
    try {
      const response = await fetch('/api/admin/uploads');
      if (!response.ok) {
        throw new Error('Failed to load uploads');
      }
      const data = await response.json();
      setUploads(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load uploads');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRoleColor = (role: string, status: string) => {
    if (status !== 'ACTIVE') return 'text-gray-400';
    if (role === 'ADMIN') return 'text-purple-600';
    return 'text-green-600';
  };

  const getUserRoleLabel = (role: string, status: string) => {
    const roleLabel = role === 'ADMIN' ? 'Admin' : 'Artist';
    return status === 'ACTIVE' ? roleLabel : `${roleLabel} (${status.toLowerCase()})`;
  };

  const getTags = (tagsString?: string) => {
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: `var(--${accentColor}-500)` }}></div>
            <p className="text-gray-600 dark:text-gray-400">Loading uploads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaImage className="mr-3" size={24} style={{ color: `var(--${accentColor}-500)` }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: `var(--${accentColor}-500)` }}>
                All Uploads
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                System-wide view of all uploaded artwork ({uploads.length} total)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {uploads.length === 0 ? (
          <div className="text-center py-12">
            <FaImage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No uploads found</h3>
            <p className="text-gray-600 dark:text-gray-400">No artwork has been uploaded to the system yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uploads.map((upload) => (
              <div 
                key={upload.id} 
                className={`rounded-lg border overflow-hidden ${
                  colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* Image */}
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  <img
                    src={upload.imageUrl}
                    alt={upload.altText || upload.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {upload.galleryIsPublic && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                    {!upload.isOriginalWork && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Attributed
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {upload.title}
                  </h3>

                  {/* User Info */}
                  <div className="flex items-center mb-2">
                    <FaUser className="mr-2 text-gray-400" size={12} />
                    <div className="text-sm">
                      <span className={`font-medium ${getUserRoleColor(upload.user.role, upload.user.status)}`}>
                        {upload.user.name || upload.user.email}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({getUserRoleLabel(upload.user.role, upload.user.status)})
                      </span>
                    </div>
                  </div>

                  {/* Gallery Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Gallery: <span className="font-medium">{upload.galleryName}</span>
                  </div>

                  {/* Artist Attribution */}
                  {upload.artistName && (
                    <div className="mb-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FaUser className="mr-1" size={10} />
                        <span className="font-medium">Artist:</span>
                      </div>
                      <div className="ml-3">
                        <span className="text-gray-900 dark:text-gray-100">{upload.artistName}</span>
                        {upload.artistPortfolioSlug && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            (@{upload.artistPortfolioSlug})
                          </span>
                        )}
                        {upload.artistExternalUrl && (
                          <a 
                            href={upload.artistExternalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FaLink className="inline" size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {upload.tags && getTags(upload.tags).length > 0 && (
                    <div className="flex items-center mb-2">
                      <FaTag className="mr-2 text-gray-400" size={12} />
                      <div className="flex flex-wrap gap-1">
                        {getTags(upload.tags).slice(0, 3).map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {getTags(upload.tags).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{getTags(upload.tags).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Date */}
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <FaCalendar className="mr-2" size={10} />
                    {formatDate(upload.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {upload.galleryIsPublic && (
                      <a
                        href={`/${upload.user.name || upload.user.email?.split('@')[0] || 'artist'}/${upload.gallerySlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <FaEye className="mr-1" size={10} />
                        View Public
                      </a>
                    )}
                    <a
                      href={`/dashboard/galleries/${upload.gallery.id}`}
                      className="flex items-center text-xs px-3 py-1 rounded border"
                      style={{ 
                        borderColor: `var(--${accentColor}-400)`, 
                        color: `var(--${accentColor}-600)` 
                      }}
                    >
                      <FaExternalLinkAlt className="mr-1" size={10} />
                      Inspect
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}