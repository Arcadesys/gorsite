'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ArtistUpload from '@/components/ArtistUpload';

interface Gallery {
  id: string;
  name: string;
  slug: string;
}

interface UserPortfolio {
  slug: string;
  displayName: string;
}

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio | undefined>();
  const [loading, setLoading] = useState(true);
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST'); // TODO: Get from auth
  const [preSelectedGallery, setPreSelectedGallery] = useState<string>('');

  useEffect(() => {
    // Check for pre-selected gallery from URL params
    const galleryParam = searchParams.get('gallery');
    if (galleryParam) {
      setPreSelectedGallery(galleryParam);
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
          setUserPortfolio(portfolioData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <DashboardLayout userRole={userRole}>
      <ArtistUpload 
        galleries={galleries}
        userPortfolio={userPortfolio}
        preSelectedGallery={preSelectedGallery}
      />
    </DashboardLayout>
  );
}