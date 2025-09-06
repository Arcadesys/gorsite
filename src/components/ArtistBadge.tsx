'use client';

import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

interface ArtistBadgeProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    portfolios?: {
      slug: string;
      displayName: string;
      profileImageUrl?: string | null;
    }[];
  };
  className?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ArtistBadge({ 
  user, 
  className = '', 
  showName = true, 
  size = 'md' 
}: ArtistBadgeProps) {
  const portfolio = user.portfolios?.[0];
  const displayName = portfolio?.displayName || user.name || 'Unknown Artist';
  const profileImage = portfolio?.profileImageUrl || user.image;
  const portfolioSlug = portfolio?.slug;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const badge = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600`}>
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUser className="text-gray-500 dark:text-gray-400" size={iconSizes[size]} />
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {displayName}
        </span>
      )}
    </div>
  );

  if (portfolioSlug) {
    return (
      <Link 
        href={`/${portfolioSlug}`} 
        className="hover:opacity-80 transition-opacity group"
        title={`View ${displayName}'s portfolio`}
      >
        <div className={`inline-flex items-center gap-2 ${className} group-hover:scale-105 transition-transform`}>
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors`}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-500 dark:text-gray-400" size={iconSizes[size]} />
            )}
          </div>
          {showName && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {displayName}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600`}>
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUser className="text-gray-500 dark:text-gray-400" size={iconSizes[size]} />
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {displayName}
        </span>
      )}
    </div>
  );
}