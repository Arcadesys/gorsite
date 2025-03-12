'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import ImageUploader from './components/ImageUploader';
import Image from 'next/image';

// Mock data for gallery images
const MOCK_GALLERY = [
  {
    id: '1',
    title: 'Fantasy Dragon',
    imageUrl: '/placeholder-cat1.svg',
    altText: 'A majestic dragon perched on a mountain cliff at sunset',
    description: 'Digital painting of a fantasy dragon with iridescent scales.',
    tags: ['digital', 'fantasy', 'dragon'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '2',
    title: 'Cyberpunk City',
    imageUrl: '/placeholder-cat2.svg',
    altText: 'Futuristic cyberpunk cityscape with neon lights and flying vehicles',
    description: 'Concept art for a cyberpunk city scene with heavy rain and neon lighting.',
    tags: ['digital', 'cyberpunk', 'cityscape'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: '3',
    title: 'Character Sketch',
    imageUrl: '/placeholder-cat3.svg',
    altText: 'Pencil sketch of a female warrior character with detailed armor',
    description: 'Quick character sketch for a fantasy RPG project.',
    tags: ['sketch', 'character', 'fantasy'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
];

export default function GalleryPage() {
  const [gallery, setGallery] = useState(MOCK_GALLERY);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const { accentColor, colorMode } = useTheme();

  // Handle image upload
  const handleImageUpload = async (imageData: {
    file: File;
    altText: string;
    description: string;
    tags: string[];
  }) => {
    setIsUploading(true);
    
    try {
      // In a real app, you would upload the file to a server or cloud storage
      // For now, we'll just create a local URL and add it to our mock gallery
      const newImage = {
        id: Date.now().toString(),
        title: imageData.file.name.split('.')[0], // Use filename as title
        imageUrl: URL.createObjectURL(imageData.file),
        altText: imageData.altText,
        description: imageData.description,
        tags: imageData.tags,
        createdAt: new Date(),
      };
      
      setGallery([newImage, ...gallery]);
      setIsUploading(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Image uploaded successfully!'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to upload image. Please try again.'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Handle image deletion
  const handleDeleteImage = (id: string) => {
    setGallery(gallery.filter(img => img.id !== id));
    setDeleteConfirmId(null);
  };

  // Request delete confirmation
  const requestDeleteConfirmation = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Filter gallery by search term and active tag
  const filteredGallery = gallery.filter(img => {
    const matchesSearch = searchTerm === '' || 
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.altText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = activeTag === null || img.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from gallery
  const allTags = Array.from(new Set(gallery.flatMap(img => img.tags)));

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: `var(--${accentColor}-400)` }}>
        Gallery Management
      </h1>
      
      {/* Notification */}
      {notification && (
        <div 
          className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-red-100 border-red-500 text-red-700'
          } border-l-4`}
        >
          {notification.message}
        </div>
      )}
      
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg flex flex-col items-center`}>
            <FaSpinner className="animate-spin text-4xl mb-4" style={{ color: `var(--${accentColor}-500)` }} />
            <p className={`${colorMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>Uploading image...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image Uploader */}
        <div className="lg:col-span-1">
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
        
        {/* Right Column - Gallery List */}
        <div className="lg:col-span-2">
          <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
              Gallery Items
            </h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-md ${
                    colorMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                  placeholder="Search by title, description, or tag"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <select
                  value={activeTag || ''}
                  onChange={(e) => setActiveTag(e.target.value || null)}
                  className={`pl-10 pr-8 py-2 rounded-md ${
                    colorMode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Gallery Items */}
            {filteredGallery.length === 0 ? (
              <div className="text-center py-8">
                <p className={`${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No gallery items found. Upload some artwork!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGallery.map((item) => (
                  <div 
                    key={item.id}
                    className={`${colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 flex flex-col md:flex-row gap-4 ${deleteConfirmId === item.id ? 'border-2 border-red-500' : ''}`}
                  >
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-32 h-32 flex-shrink-0">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.altText}
                        className="w-full h-full object-cover rounded-lg"
                        width={128}
                        height={128}
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold" style={{ color: `var(--${accentColor}-400)` }}>
                        {item.title}
                      </h3>
                      <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-1`}>
                        {item.description}
                      </p>
                      <p className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Alt Text: {item.altText}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs text-white"
                            style={{ 
                              backgroundColor: `var(--${accentColor}-500)`
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Added: {formatDate(item.createdAt)}
                        </span>
                        
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 text-sm">Are you sure?</span>
                            <button
                              onClick={() => handleDeleteImage(item.id)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              className={`p-2 rounded-full ${colorMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              style={{ color: `var(--${accentColor}-400)` }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => requestDeleteConfirmation(item.id)}
                              className={`p-2 rounded-full ${colorMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} text-red-500`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 