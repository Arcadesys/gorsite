import React from 'react';

interface ArtistAttributionProps {
  artistName?: string;
  artistPortfolioSlug?: string;
  artistExternalUrl?: string;
  isOriginalWork?: boolean;
  onChange: (field: string, value: any) => void;
  showPortfolioLookup?: boolean;
}

export default function ArtistAttribution({
  artistName = '',
  artistPortfolioSlug = '',
  artistExternalUrl = '',
  isOriginalWork = true,
  onChange,
  showPortfolioLookup = true
}: ArtistAttributionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Artist Attribution
      </h3>
      
      {/* Original Work Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isOriginalWork"
          checked={isOriginalWork}
          onChange={(e) => onChange('isOriginalWork', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isOriginalWork" className="text-sm text-gray-700 dark:text-gray-300">
          This is original work (uncheck if commissioned or collaborative)
        </label>
      </div>

      {/* Artist Name */}
      <div>
        <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Artist Name {!isOriginalWork && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="artistName"
          value={artistName}
          onChange={(e) => onChange('artistName', e.target.value)}
          placeholder={isOriginalWork ? "Your name (optional)" : "Artist's name"}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {!isOriginalWork && !artistName && (
          <p className="mt-1 text-sm text-red-600">Artist name is required for commissioned/collaborative work</p>
        )}
      </div>

      {/* Portfolio Link (for platform artists) */}
      {showPortfolioLookup && (
        <div>
          <label htmlFor="artistPortfolioSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Artist's Portfolio (if they're on this platform)
          </label>
          <input
            type="text"
            id="artistPortfolioSlug"
            value={artistPortfolioSlug}
            onChange={(e) => onChange('artistPortfolioSlug', e.target.value)}
            placeholder="portfolio-slug"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the portfolio slug if the artist has a profile on this platform
          </p>
        </div>
      )}

      {/* External URL */}
      <div>
        <label htmlFor="artistExternalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Artist's Website/Social Media
        </label>
        <input
          type="url"
          id="artistExternalUrl"
          value={artistExternalUrl}
          onChange={(e) => onChange('artistExternalUrl', e.target.value)}
          placeholder="https://artist-website.com or https://twitter.com/artist"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <p className="mt-1 text-sm text-gray-500">
          Link to the artist's website, social media, or portfolio for referrals
        </p>
      </div>
    </div>
  );
}