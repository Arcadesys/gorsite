'use client';

import { useState, useRef, useCallback } from 'react';
import { FaUpload, FaInfoCircle, FaTimes, FaPlus } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (imageData: {
    file: File;
    altText: string;
    description: string;
    tags: string[];
  }) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [altTextTooltip, setAltTextTooltip] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { accentColor, colorMode } = useTheme();

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file selection
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  // Process the selected file
  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setErrors({ file: 'Please select an image file (PNG, JPG, GIF, etc.)' });
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    
    // Create a preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setSelectedFile(file);
  };

  // Handle button click to open file dialog
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  // Add a tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!selectedFile) {
      newErrors.file = 'Please select an image file';
    }
    
    if (!altText.trim()) {
      newErrors.altText = 'Alt text is required for accessibility';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the form data
    if (selectedFile) {
      onImageUpload({
        file: selectedFile,
        altText,
        description,
        tags
      });
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setAltText('');
      setDescription('');
      setTags([]);
      setErrors({});
    }
  };

  return (
    <div className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <h2 className="text-xl font-bold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
        Upload New Artwork
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/20` 
              : `${colorMode === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`
          } ${errors.file ? 'border-red-500' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          
          {previewUrl ? (
            <div className="relative">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-lg"
                width={256}
                height={256}
                style={{ objectFit: 'contain', maxHeight: '16rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="py-8">
              <FaUpload className="mx-auto h-12 w-12 mb-4" style={{ color: `var(--${accentColor}-400)` }} />
              <p className={`${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Drag and drop your image here, or
              </p>
              <button
                type="button"
                onClick={onButtonClick}
                className="px-4 py-2 rounded-md text-white transition-colors"
                style={{ backgroundColor: `var(--${accentColor}-500)` }}
              >
                Browse Files
              </button>
              <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
          
          {errors.file && (
            <p className="mt-2 text-red-500 text-sm">{errors.file}</p>
          )}
        </div>
        
        {/* Alt Text Field */}
        <div>
          <div className="flex items-center mb-1">
            <label htmlFor="alt-text" className={`block font-medium ${colorMode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Alt Text <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-gray-500"
              onMouseEnter={() => setAltTextTooltip(true)}
              onMouseLeave={() => setAltTextTooltip(false)}
            >
              <FaInfoCircle />
            </button>
            {altTextTooltip && (
              <div className="absolute z-10 w-72 p-3 mt-1 ml-8 text-sm rounded-md shadow-lg bg-black text-white">
                Your website developer was blind, alt text good, be kind to developer kthx 😊
                <div className="absolute w-2 h-2 bg-black transform rotate-45 -ml-1 mt-2"></div>
              </div>
            )}
          </div>
          <input
            id="alt-text"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className={`w-full px-3 py-2 rounded-md ${
              colorMode === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border focus:outline-none focus:ring-2 ${
              errors.altText ? 'border-red-500 focus:ring-red-500' : `focus:ring-${accentColor}-500`
            }`}
            placeholder="Describe the image for visually impaired users"
          />
          {errors.altText && (
            <p className="mt-1 text-red-500 text-sm">{errors.altText}</p>
          )}
        </div>
        
        {/* Description Field */}
        <div>
          <label htmlFor="description" className={`block font-medium mb-1 ${colorMode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-md ${
              colorMode === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } border focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
            placeholder="Add a description for this artwork"
          />
        </div>
        
        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className={`block font-medium mb-1 ${colorMode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Tags
          </label>
          <div className="flex items-center">
            <input
              id="tags"
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className={`flex-grow px-3 py-2 rounded-l-md ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
              placeholder="Add tags (e.g., sketch, digital, portrait)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 rounded-r-md text-white"
              style={{ backgroundColor: `var(--${accentColor}-500)` }}
            >
              <FaPlus />
            </button>
          </div>
          <p className={`mt-1 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Press Enter or click the + button to add a tag
          </p>
          
          {/* Tag Display */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <div 
                key={tag}
                className="flex items-center px-3 py-1 rounded-full text-white text-sm"
                style={{ backgroundColor: `var(--${accentColor}-500)` }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 focus:outline-none"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md text-white transition-colors"
            style={{ backgroundColor: `var(--${accentColor}-500)`, hover: `var(--${accentColor}-600)` }}
          >
            Upload Artwork
          </button>
        </div>
      </form>
    </div>
  );
} 