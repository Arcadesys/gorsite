'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaImage, FaPlus, FaCheck } from 'react-icons/fa';
import ArtistAttribution from '@/components/ArtistAttribution';

interface UploadFormData {
  title: string;
  description: string;
  altText: string;
  tags: string[];
  galleryId: string;
  artistName: string;
  artistPortfolioSlug: string;
  artistExternalUrl: string;
  isOriginalWork: boolean;
}

interface Gallery {
  id: string;
  name: string;
  slug: string;
}

interface ArtistUploadProps {
  galleries: Gallery[];
  userPortfolio?: {
    slug: string;
    displayName: string;
  };
  preSelectedGallery?: string;
}

export default function ArtistUpload({ galleries, userPortfolio, preSelectedGallery }: ArtistUploadProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    altText: '',
    tags: [],
    galleryId: preSelectedGallery || '',
    artistName: userPortfolio?.displayName || '',
    artistPortfolioSlug: userPortfolio?.slug || '',
    artistExternalUrl: '',
    isOriginalWork: true,
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-fill title from filename if not set
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }, [formData.title]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title || !formData.galleryId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload file first
      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);
      
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: fileFormData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Create gallery item with attribution
      const itemData = {
        title: formData.title,
        description: formData.description || undefined,
        imageUrl: uploadResult.publicUrl,
        altText: formData.altText || undefined,
        tags: formData.tags,
        artistName: formData.artistName || undefined,
        artistPortfolioSlug: formData.artistPortfolioSlug || undefined,
        artistExternalUrl: formData.artistExternalUrl || undefined,
        isOriginalWork: formData.isOriginalWork,
      };
      
      const itemResponse = await fetch(`/api/galleries/${formData.galleryId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      
      if (!itemResponse.ok) {
        throw new Error('Failed to create gallery item');
      }
      
      setUploadSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/galleries/${formData.galleryId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const createNewGallery = () => {
    router.push('/dashboard/galleries/new');
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-100 dark:bg-green-900 p-8 rounded-lg">
          <FaCheck className="mx-auto text-4xl text-green-600 dark:text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Upload Successful!
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Your artwork has been added to the gallery. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Upload Artwork
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add new artwork to your galleries with proper attribution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
            {previewUrl ? (
              <div className="text-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-48 object-contain mx-auto mb-4 rounded"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {selectedFile?.name}
                </p>
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="text-center">
                <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose an image to upload
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  PNG, JPG, GIF up to 20MB
                </p>
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <FaUpload className="inline mr-2" />
                  Select File
                </button>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Gallery Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gallery <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.galleryId}
                onChange={(e) => handleInputChange('galleryId', e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select a gallery</option>
                {galleries.map((gallery) => (
                  <option key={gallery.id} value={gallery.id}>
                    {gallery.name}
                  </option>
                ))}
              </select>
              <button
                onClick={createNewGallery}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                title="Create new gallery"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter artwork title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Describe your artwork..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => handleInputChange('altText', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Describe the image for screen readers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="fantasy, digital art, character design"
              />
              <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
            </div>
          </div>

          {/* Artist Attribution */}
          <ArtistAttribution
            artistName={formData.artistName}
            artistPortfolioSlug={formData.artistPortfolioSlug}
            artistExternalUrl={formData.artistExternalUrl}
            isOriginalWork={formData.isOriginalWork}
            onChange={handleInputChange}
            showPortfolioLookup={true}
          />

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !formData.title || !formData.galleryId}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="inline mr-2" />
                Upload Artwork
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}