'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistUpload from '@/components/ArtistUpload';
import BulkArtworkUpload from '@/components/BulkArtworkUpload';
import { FaUpload, FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

interface Gallery {
  id: string;
  name: string;
  slug: string;
}

interface UserPortfolio {
  slug: string;
  displayName: string;
}

type UploadMode = 'choose' | 'single' | 'bulk';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio | undefined>();
  const [loading, setLoading] = useState(true);
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST'); // TODO: Get from auth
  const [preSelectedGallery, setPreSelectedGallery] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<UploadMode>('choose');

  useEffect(() => {
    // Check for pre-selected gallery from URL params
    const galleryParam = searchParams.get('gallery');
    if (galleryParam) {
      setPreSelectedGallery(galleryParam);
    }

    // Check for mode preference from URL params
    const modeParam = searchParams.get('mode');
    if (modeParam === 'bulk' || modeParam === 'single') {
      setUploadMode(modeParam);
    }
    
    const fetchData = async () => {
      try {
        // Fetch user's galleries
        const galleriesResponse = await fetch('/api/galleries');
        if (galleriesResponse.ok) {
          const galleriesData = await galleriesResponse.json();
          setGalleries(galleriesData);
        }

        // Fetch user's portfolio info
        const portfolioResponse = await fetch('/api/studio/portfolio');
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          setUserPortfolio(portfolioData.portfolio);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleUploadComplete = (uploadedCount: number) => {
    // Could show a toast notification here
    console.log(`${uploadedCount} artworks uploaded successfully`);
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mode selection screen
  if (uploadMode === 'choose') {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Upload Artwork
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you'd like to upload your artwork
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Upload Option */}
            <div 
              onClick={() => setUploadMode('single')}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FaUpload className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Single Upload
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload one artwork at a time with detailed metadata entry
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 text-left">
                  <li>• Detailed metadata forms</li>
                  <li>• Artist attribution tools</li>
                  <li>• Perfect for individual pieces</li>
                  <li>• Step-by-step process</li>
                </ul>
              </div>
            </div>

            {/* Bulk Upload Option */}
            <div 
              onClick={() => setUploadMode('bulk')}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 cursor-pointer hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all group"
            >
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <FaCloudUploadAlt className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Bulk Upload
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload multiple artworks at once with inline editing
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 text-left">
                  <li>• Drag & drop multiple files</li>
                  <li>• Table-based metadata editing</li>
                  <li>• Queue management</li>
                  <li>• Perfect for collections</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can always switch modes later from the upload interface
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Single upload mode
  if (uploadMode === 'single') {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="mb-4">
          <button
            onClick={() => setUploadMode('choose')}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <FaArrowLeft />
            Back to upload options
          </button>
        </div>
        <ArtistUpload 
          galleries={galleries}
          userPortfolio={userPortfolio}
          preSelectedGallery={preSelectedGallery}
        />
      </DashboardLayout>
    );
  }

  // Bulk upload mode
  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-4">
        <button
          onClick={() => setUploadMode('choose')}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to upload options
        </button>
      </div>
      <BulkArtworkUpload 
        galleries={galleries}
        userPortfolio={userPortfolio}
        preSelectedGallery={preSelectedGallery}
        onUploadComplete={handleUploadComplete}
      />
    </DashboardLayout>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <DashboardLayout userRole="ARTIST">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <UploadPageContent />
    </Suspense>
  );
}