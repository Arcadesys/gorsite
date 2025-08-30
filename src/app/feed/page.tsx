'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FaTwitter, FaInstagram, FaDeviantart, FaTumblr, FaExternalLinkAlt, FaArtstation } from 'react-icons/fa';
import Image from 'next/image';

// Mock data for social posts
const MOCK_POSTS = [
  {
    id: '1',
    platform: 'twitter',
    content: 'Just finished this new character design! What do you think? #digitalart #characterdesign',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://twitter.com/gorathartist/status/1234567890',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: '2',
    platform: 'instagram',
    content: 'Work in progress for my latest commission. Loving how the colors are coming together! #wip #commission',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://instagram.com/p/ABC123',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: '3',
    platform: 'deviantart',
    content: 'New artwork uploaded to my gallery! This one took me about 20 hours to complete. #fantasy #illustration',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://deviantart.com/gorathartist/art/12345',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: '4',
    platform: 'tumblr',
    content: 'Sketches from my sketchbook this week. Trying some new character concepts. #sketch #conceptart',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://gorathartist.tumblr.com/post/12345',
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: '5',
    platform: 'twitter',
    content: 'Commission slots are open! DM me for details. #commissions #digitalart',
    imageUrl: null,
    postUrl: 'https://twitter.com/gorathartist/status/9876543210',
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  },
  {
    id: '6',
    platform: 'instagram',
    content: 'Behind the scenes of my creative process. Swipe to see the progression! #process #digitalart',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://instagram.com/p/XYZ789',
    postedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
  },
  {
    id: '7',
    platform: 'deviantart',
    content: 'Thank you for 10,000 followers! As a celebration, I\'m doing a giveaway. Check the link for details! #giveaway #milestone',
    imageUrl: '/placeholder-art.jpg',
    postUrl: 'https://deviantart.com/gorathartist/art/67890',
    postedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
  },
  {
    id: '8',
    platform: 'tumblr',
    content: 'Answering some frequently asked questions about my art process and tools. #faq #tutorial',
    imageUrl: null,
    postUrl: 'https://gorathartist.tumblr.com/post/67890',
    postedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
  },
];

const SocialFeedPage = () => {
  const [posts] = useState(MOCK_POSTS);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { accentColor, colorMode } = useTheme();
  const palette = accentColor === 'green' ? 'emerald' : accentColor;
  const c400 = `var(--${palette}-400)`;
  const c500 = `var(--${palette}-500)`;
  const c600 = `var(--${palette}-600)`;

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.platform === filter);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FaTwitter size={24} className="text-[#1DA1F2]" />;
      case 'instagram':
        return <FaInstagram size={24} className="text-[#E1306C]" />;
      case 'deviantart':
        return <FaDeviantart size={24} className="text-[#05CC47]" />;
      case 'tumblr':
        return <FaTumblr size={24} className="text-[#36465D]" />;
      case 'artstation':
        return <FaArtstation size={24} className="text-[#13B9FD]" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'Twitter';
      case 'instagram':
        return 'Instagram';
      case 'deviantart':
        return 'DeviantArt';
      case 'tumblr':
        return 'Tumblr';
      case 'artstation':
        return 'ArtStation';
      default:
        return platform;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20"
        style={{ background: `linear-gradient(to bottom, var(--${palette}-900), ${colorMode === 'dark' ? '#000' : '#fff'})` }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colorMode === 'dark' ? '#fff' : '#111827' }}>
            Social <span style={{ color: c400 }}>Feed</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Stay updated with my latest posts across all platforms
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-gray-800" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full transition`}
              style={{
                backgroundColor: filter === 'all' ? c600 : (colorMode === 'dark' ? '#111827' : '#f3f4f6'),
                color: filter === 'all' ? '#fff' : (colorMode === 'dark' ? '#d1d5db' : '#111827'),
              }}
            >
              All Platforms
            </button>
            <button
              onClick={() => setFilter('twitter')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                filter === 'twitter'
                  ? 'bg-[#1DA1F2] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaTwitter /> Twitter
            </button>
            <button
              onClick={() => setFilter('instagram')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                filter === 'instagram'
                  ? 'bg-[#E1306C] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaInstagram /> Instagram
            </button>
            <button
              onClick={() => setFilter('deviantart')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                filter === 'deviantart'
                  ? 'bg-[#05CC47] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaDeviantart /> DeviantArt
            </button>
            <button
              onClick={() => setFilter('tumblr')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                filter === 'tumblr'
                  ? 'bg-[#36465D] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaTumblr /> Tumblr
            </button>
            <button
              onClick={() => setFilter('artstation')}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                filter === 'artstation'
                  ? 'bg-[#13B9FD] text-white'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FaArtstation /> ArtStation
            </button>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: c500 }}></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl text-gray-400">No posts found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <div key={post.id} className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/10 transition">
                  {post.imageUrl && (
                    <div className="relative h-64">
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                      <Image 
                        src="/placeholder-art.jpg"
                        alt={post.title || "Social media post"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 3} // Prioritize loading for the first few images
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-bold text-white">{getPlatformName(post.platform)}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{formatDate(post.postedAt)}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    <a 
                      href={post.postUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition flex items-center gap-1 text-sm"
                      style={{ color: c400 }}
                    >
                      View Original Post <FaExternalLinkAlt size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Follow CTA */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8" style={{ color: c400 }}>Follow Me</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Stay connected and never miss an update by following me on these platforms
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://twitter.com/gorathartist" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2"
            >
              <FaTwitter size={20} /> Twitter
            </a>
            <a 
              href="https://instagram.com/gorathartist" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#E1306C] hover:bg-[#c62c60] text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2"
            >
              <FaInstagram size={20} /> Instagram
            </a>
            <a 
              href="https://deviantart.com/gorathartist" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#05CC47] hover:bg-[#04b53e] text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2"
            >
              <FaDeviantart size={20} /> DeviantArt
            </a>
            <a 
              href="https://gorathartist.tumblr.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#36465D] hover:bg-[#2e3c4f] text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2"
            >
              <FaTumblr size={20} /> Tumblr
            </a>
            <a 
              href="https://artstation.com/gorathartist" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#13B9FD] hover:bg-[#11a0d8] text-white font-bold py-3 px-8 rounded-full transition flex items-center gap-2"
            >
              <FaArtstation size={20} /> ArtStation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialFeedPage; 
