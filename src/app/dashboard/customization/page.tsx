'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ColorPicker from '@/components/ColorPicker';
import { FaPalette, FaSave, FaEye, FaExternalLinkAlt } from 'react-icons/fa';

interface PortfolioCustomization {
  primaryColor: string;
  secondaryColor: string;
  footerText?: string;
  slug?: string;
  isPublic?: boolean;
}

export default function CustomizationPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customization, setCustomization] = useState<PortfolioCustomization>({
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    footerText: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCustomization();
  }, []);

  const fetchCustomization = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolio/customization');
      if (response.ok) {
        const data = await response.json();
        setCustomization({
          primaryColor: data.primaryColor || '#10b981',
          secondaryColor: data.secondaryColor || '#059669',
          footerText: data.footerText || '',
          slug: data.slug,
          isPublic: data.isPublic,
        });
      }
    } catch (error) {
      console.error('Failed to fetch customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomization = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/portfolio/customization', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryColor: customization.primaryColor,
          secondaryColor: customization.secondaryColor,
          footerText: customization.footerText,
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Customization saved successfully');
      } else {
        console.error('Failed to save customization');
      }
    } catch (error) {
      console.error('Failed to save customization:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PortfolioCustomization, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPreviewUrl = () => {
    if (customization.slug && customization.isPublic) {
      return `/${customization.slug}`;
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customization...</p>
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
            <FaPalette className="mr-3 text-2xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Portfolio Customization
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize the look and feel of your portfolio page
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {getPreviewUrl() && (
              <a
                href={getPreviewUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition inline-flex items-center"
              >
                <FaExternalLinkAlt className="mr-2" />
                View Live
              </a>
            )}
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition inline-flex items-center"
            >
              <FaEye className="mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            
            <button
              onClick={saveCustomization}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customization Controls */}
          <div className="space-y-6">
            {/* Color Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Color Settings
              </h2>
              
              <div className="space-y-4">
                <ColorPicker
                  label="Primary Accent Color"
                  value={customization.primaryColor}
                  onChange={(color) => handleInputChange('primaryColor', color)}
                />
                
                <ColorPicker
                  label="Secondary Accent Color"
                  value={customization.secondaryColor}
                  onChange={(color) => handleInputChange('secondaryColor', color)}
                />
              </div>
            </div>

            {/* Footer Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Footer Settings
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Footer Text
                </label>
                <textarea
                  value={customization.footerText || ''}
                  onChange={(e) => handleInputChange('footerText', e.target.value)}
                  placeholder="© 2024 Your Name. All rights reserved."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This text will appear at the bottom of your portfolio page. Leave empty for default.
                </p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Live Preview
            </h2>
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Preview content with applied colors */}
              <div className="bg-black text-white p-4">
                <div className="h-24 bg-gray-800 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Hero Image Area</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Your Portfolio Name</h3>
                <p className="text-gray-300 text-sm">Artist description goes here...</p>
              </div>
              
              <div className="bg-gray-900 p-4">
                <h4 className="font-semibold mb-3" style={{ color: customization.primaryColor }}>
                  Featured Galleries
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black rounded p-2">
                    <div className="h-16 bg-gray-800 rounded mb-2"></div>
                    <div className="text-xs" style={{ color: customization.primaryColor }}>
                      Gallery Name
                    </div>
                  </div>
                  <div className="bg-black rounded p-2">
                    <div className="h-16 bg-gray-800 rounded mb-2"></div>
                    <div className="text-xs" style={{ color: customization.primaryColor }}>
                      Gallery Name
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer preview */}
              <div className="bg-black border-t border-gray-800 p-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-2">
                    {customization.footerText || '© 2024 Your Name. All rights reserved.'}
                  </div>
                  <div className="flex justify-center space-x-4">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: customization.primaryColor }}
                    ></div>
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: customization.secondaryColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}