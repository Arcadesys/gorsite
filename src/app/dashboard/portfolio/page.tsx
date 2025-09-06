'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ImageUpload from '@/components/ImageUpload';
import { FaUser, FaEdit, FaSave, FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';

interface Portfolio {
  id: string;
  slug: string;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  isPublic: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    artstation?: string;
    deviantart?: string;
  };
}

export default function PortfolioPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Portfolio>>({});
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const fetchPortfolio = async () => {
    console.log('Fetching portfolio data...');
    try {
      const response = await fetch('/api/studio/portfolio');
      if (response.ok) {
        const data = await response.json();
        console.log('Portfolio fetched:', data.portfolio);
        setPortfolio(data.portfolio);
        setFormData(data.portfolio || {});
      } else {
        console.error('Failed to fetch portfolio, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataToSave?: Partial<Portfolio>) => {
    setSaving(true);
    const saveData = dataToSave || formData;
    console.log('Saving portfolio...', saveData);
    console.log('🔍 Form data keys:', Object.keys(saveData));
    console.log('🔍 profileImageUrl in saveData:', saveData.profileImageUrl);
    console.log('🔍 bannerImageUrl in saveData:', saveData.bannerImageUrl);
    try {
      const response = await fetch('/api/studio/portfolio', {
        method: portfolio ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Portfolio saved successfully:', data.portfolio);
        console.log('🔍 Returned profileImageUrl:', data.portfolio.profileImageUrl);
        setPortfolio(data.portfolio);
        setFormData(data.portfolio);
      } else {
        const error = await response.json();
        console.error('Failed to save portfolio:', error);
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = () => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout
    const newTimeout = setTimeout(() => {
      console.log('Debounced save triggered');
      handleSave();
      setSaveTimeout(null);
    }, 1000); // Auto-save after 1 second of no changes
    
    setSaveTimeout(newTimeout);
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('Input changed:', field, value);
    
    // Update formData with the new value
    const newFormData = { ...formData, [field]: value };
    console.log('🔍 Updated formData:', { 
      profileImageUrl: newFormData.profileImageUrl, 
      bannerImageUrl: newFormData.bannerImageUrl 
    });
    setFormData(newFormData);
    
    // For image uploads, save immediately with the new data
    if (field === 'profileImageUrl' || field === 'bannerImageUrl') {
      console.log('Image upload detected, saving immediately with new data');
      // Clear any pending timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        setSaveTimeout(null);
      }
      // Save immediately for images with the updated data
      setTimeout(() => handleSave(newFormData), 100);
    } else {
      // For text fields, use debounced save
      debouncedSave();
    }
  };

  const handleSocialChange = (platform: string, value: string) => {
    console.log('Social link changed:', platform, value);
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
    debouncedSave();
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaUser className="mr-3 text-2xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Portfolio Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your public artist profile
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {portfolio?.isPublic && portfolio?.slug && (
              <a
                href={`/${portfolio.slug}`}
                target="_blank"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-flex items-center"
              >
                <FaExternalLinkAlt className="mr-2" />
                View Public
              </a>
            )}
            
            {saving && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg inline-flex items-center">
                <FaSave className="mr-2 animate-pulse" />
                Auto-saving...
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Basic Information
              </h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{typeof window !== 'undefined' ? window.location.host : ''}/</span>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your-artist-name"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This will be your public portfolio URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Your Artist Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://your-website.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Tell people about your art and yourself..."
              />
            </div>

            {/* Images */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Profile Images
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Image
              </label>
              <ImageUpload
                type="profile"
                currentImageUrl={formData.profileImageUrl}
                onImageChange={(url) => handleInputChange('profileImageUrl', url)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Image
              </label>
              <ImageUpload
                type="banner"
                currentImageUrl={formData.bannerImageUrl}
                onImageChange={(url) => handleInputChange('bannerImageUrl', url)}
              />
            </div>

            {/* Social Links */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Social Links
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="text"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ArtStation
              </label>
              <input
                type="text"
                value={formData.socialLinks?.artstation || ''}
                onChange={(e) => handleSocialChange('artstation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DeviantArt
              </label>
              <input
                type="text"
                value={formData.socialLinks?.deviantart || ''}
                onChange={(e) => handleSocialChange('deviantart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="username"
              />
            </div>

            {/* Visibility */}
            <div className="md:col-span-2 mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic || false}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <label htmlFor="isPublic" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaGlobe className="mr-2" />
                  Make portfolio public
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                When enabled, your portfolio will be visible at /{formData.slug || 'your-slug'}
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {portfolio && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Preview
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              {formData.bannerImageUrl && (
                <div className="h-32 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <img
                    src={formData.bannerImageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  {formData.profileImageUrl && (
                    <img
                      src={formData.profileImageUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-lg"
                      style={{ marginTop: formData.bannerImageUrl ? '-2rem' : '0' }}
                    />
                  )}
                  <div className="flex-1" style={{ marginTop: formData.bannerImageUrl ? '-1rem' : '0' }}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formData.displayName || 'Your Name'}
                    </h3>
                    {formData.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formData.location}</p>
                    )}
                    {formData.bio && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{formData.bio}</p>
                    )}
                    {formData.website && (
                      <a 
                        href={formData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}