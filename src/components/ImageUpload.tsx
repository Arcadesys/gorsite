'use client';

import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';

interface ImageUploadProps {
  type: 'profile' | 'banner' | 'commission' | 'logo' | 'favicon';
  currentImageUrl?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({ 
  type, 
  currentImageUrl, 
  onImageChange, 
  className = '', 
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/uploads/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onImageChange(data.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    if (disabled || uploading) return;
    onImageChange(null);
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const getUploadText = () => {
    if (type === 'profile') {
      return 'Upload Profile Image (400x400, square crop)';
    }
    return 'Upload Banner Image (1200x400, wide crop)';
  };

  const getPreviewStyle = () => {
    if (type === 'profile') {
      return 'w-32 h-32 rounded-full';
    }
    return 'w-full h-32 rounded-lg';
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {currentImageUrl ? (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={currentImageUrl}
              alt={`${type} preview`}
              className={`${getPreviewStyle()} object-cover border border-gray-300 dark:border-gray-600`}
            />
            {!disabled && !uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                  title="Remove image"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          
          {!disabled && !uploading && (
            <button
              onClick={handleClick}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Change Image
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${type === 'profile' ? 'aspect-square' : 'aspect-[3/1]'}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <FaSpinner className="text-2xl animate-spin text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <FaUpload className="text-2xl text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getUploadText()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max 10MB • JPG, PNG, GIF, WebP
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}