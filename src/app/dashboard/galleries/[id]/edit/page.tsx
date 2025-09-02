'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';

interface Gallery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
}

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditGalleryPage({ params }: EditGalleryPageProps) {
  const router = useRouter();
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [galleryId, setGalleryId] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isPublic: true,
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setGalleryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (galleryId) {
      fetchGallery();
    }
  }, [galleryId]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/galleries/${galleryId}`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          isPublic: data.isPublic ?? true,
        });
      } else {
        console.error('Failed to fetch gallery');
        router.push('/dashboard/galleries');
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
      router.push('/dashboard/galleries');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlugFromName(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/galleries/${galleryId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update gallery');
      }
    } catch (error) {
      console.error('Failed to update gallery:', error);
      alert('Failed to update gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gallery? This will also delete all artworks in it. This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete the gallery and all its contents. Are you absolutely sure?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/galleries');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete gallery');
      }
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      alert('Failed to delete gallery');
    } finally {
      setDeleting(false);
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
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href={`/dashboard/galleries/${galleryId}`}
              className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Gallery
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Gallery Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gallery Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Enter gallery name"
              />
            </div>

            {/* Slug */}
            <div className="mb-6">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="gallery-url-slug"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This will be used in the gallery URL. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe your gallery (optional)"
              />
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this gallery public
                </span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Public galleries can be viewed by anyone with the link.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <Link
                href={`/dashboard/galleries/${galleryId}`}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition inline-flex items-center"
              >
                Cancel
              </Link>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaTrash className="mr-2" />
              {deleting ? 'Deleting...' : 'Delete Gallery'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}