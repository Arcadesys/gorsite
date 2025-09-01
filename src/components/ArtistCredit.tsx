import React from 'react';
import Link from 'next/link';

interface ArtistCreditProps {
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function ArtistCredit({
  artistName,
  artistPortfolioSlug,
  artistExternalUrl,
  isOriginalWork = true,
  className = '',
  showLabel = true
}: ArtistCreditProps) {
  // Don't show anything if it's original work and no artist name is provided
  if (isOriginalWork && !artistName) {
    return null;
  }

  // Don't show anything if no artist information is available
  if (!artistName && !artistPortfolioSlug && !artistExternalUrl) {
    return null;
  }

  const renderArtistLink = () => {
    // Priority: Portfolio slug (internal link) > External URL > Just name
    if (artistPortfolioSlug) {
      return (
        <Link 
          href={`/${artistPortfolioSlug}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {artistName || artistPortfolioSlug}
        </Link>
      );
    }
    
    if (artistExternalUrl) {
      return (
        <a 
          href={artistExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {artistName || 'Artist'}
          <span className="ml-1 text-xs">↗</span>
        </a>
      );
    }
    
    if (artistName) {
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {artistName}
        </span>
      );
    }
    
    return null;
  };

  const label = isOriginalWork ? 'By' : 'Art by';

  return (
    <div className={`text-sm ${className}`}>
      {showLabel && (
        <span className="text-gray-500 dark:text-gray-400 mr-1">
          {label}:
        </span>
      )}
      {renderArtistLink()}
      {!isOriginalWork && (
        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
          Commissioned
        </span>
      )}
    </div>
  );
}