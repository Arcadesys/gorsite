'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUpload, 
  FaImage, 
  FaPlus, 
  FaCheck, 
  FaTrash, 
  FaSave, 
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaCloudUploadAlt
} from 'react-icons/fa';
import ArtistAttribution from '@/components/ArtistAttribution';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  altText: string;
  tags: string[];
  artistName: string;
  artistPortfolioSlug: string;
  artistExternalUrl: string;
  isOriginalWork: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

interface Gallery {
  id: string;
  name: string;
  slug: string;
}

interface BulkArtworkUploadProps {
  galleries: Gallery[];
  userPortfolio?: {
    slug: string;
    displayName: string;
  };
  preSelectedGallery?: string;
  onUploadComplete?: (uploadedItems: number) => void;
}

export default function BulkArtworkUpload({ 
  galleries, 
  userPortfolio, 
  preSelectedGallery,
  onUploadComplete 
}: BulkArtworkUploadProps) {
  const router = useRouter();
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(preSelectedGallery || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ success: 0, error: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const createUploadItem = (file: File): UploadItem => {
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    return {
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      title: nameWithoutExt,
      description: '',
      altText: '',
      tags: [],
      artistName: userPortfolio?.displayName || '',
      artistPortfolioSlug: userPortfolio?.slug || '',
      artistExternalUrl: '',
      isOriginalWork: true,
      status: 'pending'
    };
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File size must be less than 20MB';
    }
    return null;
  };

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: UploadItem[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newItems.push(createUploadItem(file));
      }
    });

    if (errors.length > 0) {
      alert(`Some files could not be added:\n${errors.join('\n')}`);
    }

    if (newItems.length > 0) {
      setUploadItems(prev => [...prev, ...newItems]);
    }
  }, [userPortfolio]);

  const handleInputChange = useCallback((files: FileList | null) => {
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }, []);

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setUploadItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const uploadSingleItem = async (item: UploadItem): Promise<boolean> => {
    try {
      updateItem(item.id, { status: 'uploading', progress: 0 });

      // Upload file
      const fileFormData = new FormData();
      fileFormData.append('file', item.file);
      
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: fileFormData,
      });
      
      updateItem(item.id, { progress: 50 });

      if (!uploadResponse.ok) {
        let errMsg = 'Upload failed';
        try {
          const j = await uploadResponse.json();
          errMsg = j?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const uploadResult = await uploadResponse.json();
      
      // Create gallery item
      const itemData = {
        title: item.title,
        description: item.description || undefined,
        imageUrl: uploadResult.publicUrl,
        altText: item.altText || undefined,
        tags: item.tags,
        artistName: item.artistName || undefined,
        artistPortfolioSlug: item.artistPortfolioSlug || undefined,
        artistExternalUrl: item.artistExternalUrl || undefined,
        isOriginalWork: item.isOriginalWork,
      };
      
      const itemResponse = await fetch(`/api/galleries/${selectedGallery}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      
      updateItem(item.id, { progress: 90 });

      if (!itemResponse.ok) {
        throw new Error('Failed to create gallery item');
      }
      
      updateItem(item.id, { status: 'success', progress: 100 });
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      updateItem(item.id, { status: 'error', error: errorMsg });
      return false;
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedGallery) {
      alert('Please select a gallery');
      return;
    }

    const pendingItems = uploadItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      alert('No items to upload');
      return;
    }

    // Validate that all pending items have required fields
    const invalidItems = pendingItems.filter(item => !item.title.trim());
    if (invalidItems.length > 0) {
      alert(`Please add titles for all items. ${invalidItems.length} item(s) are missing titles.`);
      return;
    }

    setIsUploading(true);
    setUploadStats({ success: 0, error: 0, total: pendingItems.length });

    let successCount = 0;
    let errorCount = 0;

    // Upload items one by one to avoid overwhelming the server
    for (const item of pendingItems) {
      const success = await uploadSingleItem(item);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      setUploadStats({ success: successCount, error: errorCount, total: pendingItems.length });
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(successCount);
    }

    if (successCount > 0 && errorCount === 0) {
      // All successful - redirect after a moment
      setTimeout(() => {
        router.push(`/dashboard/galleries/${selectedGallery}`);
      }, 2000);
    }
  };

  const clearCompleted = () => {
    setUploadItems(prev => {
      const toRemove = prev.filter(item => item.status === 'success');
      toRemove.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return prev.filter(item => item.status !== 'success');
    });
  };

  const clearErrors = () => {
    setUploadItems(prev => {
      const toRemove = prev.filter(item => item.status === 'error');
      toRemove.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return prev.filter(item => item.status !== 'error');
    });
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      uploadItems.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <FaImage className="text-gray-400" />;
      case 'uploading':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
    }
  };

  const pendingCount = uploadItems.filter(item => item.status === 'pending').length;
  const successCount = uploadItems.filter(item => item.status === 'success').length;
  const errorCount = uploadItems.filter(item => item.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Bulk Artwork Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple artworks at once with drag and drop
        </p>
      </div>

      {/* Gallery Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target Gallery <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={selectedGallery}
            onChange={(e) => setSelectedGallery(e.target.value)}
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
            onClick={() => router.push('/dashboard/galleries/new')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            title="Create new gallery"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleInputChange(e.target.files)}
          className="hidden"
        />
        
        <FaCloudUploadAlt className={`mx-auto text-4xl mb-4 transition-colors ${
          dragOver ? 'text-blue-500' : 'text-gray-400'
        }`} />
        <p className={`text-lg font-medium mb-2 transition-colors ${
          dragOver 
            ? 'text-blue-700 dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {dragOver ? 'Drop images here!' : 'Drop images here or click to select'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          PNG, JPG, GIF up to 20MB each • Multiple files supported
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            dragOver 
              ? 'bg-blue-700 hover:bg-blue-800 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <FaUpload className="inline mr-2" />
          Select Files
        </button>
      </div>

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Queue Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Upload Queue ({uploadItems.length} items)
                </h2>
                {isUploading && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadStats.success + uploadStats.error} / {uploadStats.total} processed
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {successCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition"
                  >
                    Clear {successCount} completed
                  </button>
                )}
                {errorCount > 0 && (
                  <button
                    onClick={clearErrors}
                    className="text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition"
                  >
                    Clear {errorCount} errors
                  </button>
                )}
                <button
                  onClick={handleBulkUpload}
                  disabled={isUploading || !selectedGallery || pendingCount === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaSave className="inline mr-2" />
                      Upload All ({pendingCount})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Queue Items */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-20 border-b border-gray-200 dark:border-gray-600">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-24 border-b border-gray-200 dark:border-gray-600">Preview</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-48 border-b border-gray-200 dark:border-gray-600">Title <span className="text-red-500">*</span></th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Description</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-32 border-b border-gray-200 dark:border-gray-600">Tags</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300 w-20 border-b border-gray-200 dark:border-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      item.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                      item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                      item.status === 'uploading' ? 'bg-blue-50 dark:bg-blue-900/20' : 
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {item.status === 'uploading' && item.progress !== undefined && (
                          <div className="flex flex-col">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{item.progress}%</span>
                            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {item.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-20 truncate" title={item.error}>
                          {item.error}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <img
                          src={item.previewUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                        {item.status === 'success' && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <FaCheck size={10} />
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <FaTimes size={10} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                        disabled={item.status === 'uploading' || item.status === 'success'}
                        className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
                          !item.title ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' : 
                          'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
                        placeholder="Artwork title (required)"
                        required
                      />
                      {!item.title && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Title required</p>
                      )}
                    </td>
                    <td className="p-3">
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        disabled={item.status === 'uploading' || item.status === 'success'}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed resize-none transition-colors"
                        rows={2}
                        placeholder="Optional description..."
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.tags.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                          updateItem(item.id, { tags });
                        }}
                        disabled={item.status === 'uploading' || item.status === 'success'}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        placeholder="tag1, tag2"
                      />
                    </td>
                    <td className="p-3">
                      {item.status !== 'uploading' && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Complete Status */}
      {uploadStats.total > 0 && !isUploading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Upload Complete
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadStats.success} successful
                    </span>
                  </div>
                  {uploadStats.error > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadStats.error} failed
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadStats.total} total
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(uploadStats.success / uploadStats.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload completion: {Math.round((uploadStats.success / uploadStats.total) * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {uploadStats.success > 0 && uploadStats.error === 0 && (
                <div className="text-green-600 dark:text-green-400">
                  <FaCheck className="text-3xl" />
                </div>
              )}
              {uploadStats.error > 0 && (
                <div className="text-orange-600 dark:text-orange-400">
                  <FaExclamationTriangle className="text-3xl" />
                </div>
              )}
            </div>
          </div>
          
          {uploadStats.success > 0 && uploadStats.error === 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium">
                🎉 All artworks uploaded successfully! 
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Redirecting to gallery in a moment...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}