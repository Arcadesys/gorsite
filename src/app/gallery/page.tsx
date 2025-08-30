'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FaSearch, FaTimes } from 'react-icons/fa';
import PlaceholderArt from '@/components/PlaceholderArt';

// Mock data for gallery items
const GALLERY_ITEMS = [
  {
    id: '1',
    title: 'Celestial Guardian',
    description: 'A celestial being guarding the gateway between realms.',
    category: 'character',
    imageUrl: '/placeholder-art.jpg',
    year: 2023,
  },
  {
    id: '2',
    title: 'Neon Streets',
    description: 'Cyberpunk cityscape with neon lights and rain-slicked streets.',
    category: 'environment',
    imageUrl: '/placeholder-art.jpg',
    year: 2023,
  },
  {
    id: '3',
    title: 'Dragon Queen',
    description: 'Portrait of a regal dragon queen with scales and horns.',
    category: 'character',
    imageUrl: '/placeholder-art.jpg',
    year: 2022,
  },
  {
    id: '4',
    title: 'Ancient Temple',
    description: 'Ruins of an ancient temple hidden in a misty forest.',
    category: 'environment',
    imageUrl: '/placeholder-art.jpg',
    year: 2022,
  },
  {
    id: '5',
    title: 'Mech Warrior',
    description: 'Futuristic mech warrior with advanced weaponry.',
    category: 'character',
    imageUrl: '/placeholder-art.jpg',
    year: 2022,
  },
  {
    id: '6',
    title: 'Enchanted Forest',
    description: 'Magical forest with glowing flora and mystical creatures.',
    category: 'environment',
    imageUrl: '/placeholder-art.jpg',
    year: 2021,
  },
  {
    id: '7',
    title: 'Space Explorer',
    description: 'Astronaut exploring an alien planet with strange vegetation.',
    category: 'character',
    imageUrl: '/placeholder-art.jpg',
    year: 2021,
  },
  {
    id: '8',
    title: 'Desert Oasis',
    description: 'Hidden oasis in a vast desert with ancient architecture.',
    category: 'environment',
    imageUrl: '/placeholder-art.jpg',
    year: 2021,
  },
  {
    id: '9',
    title: 'Elven Ranger',
    description: 'Elven ranger with bow and magical arrows in a forest setting.',
    category: 'character',
    imageUrl: '/placeholder-art.jpg',
    year: 2020,
  },
];

const GalleryPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  const { accentColor, colorMode } = useTheme();
  const palette = accentColor === 'green' ? 'emerald' : accentColor;
  const c400 = `var(--${palette}-400)`;
  const c500 = `var(--${palette}-500)`;
  const c600 = `var(--${palette}-600)`;
  
  const filteredItems = GALLERY_ITEMS.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const handleItemClick = (item: typeof GALLERY_ITEMS[0]) => {
    setSelectedItem(item);
  };
  
  const closeModal = () => {
    setSelectedItem(null);
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
            Art <span style={{ color: c400 }}>Gallery</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore my collection of digital artwork and illustrations
          </p>
        </div>
      </section>
      
      {/* Filter and Search */}
      <section className="py-8 sticky top-0 z-10 border-b border-gray-800" style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full transition`}
                style={{
                  backgroundColor: filter === 'all' ? c600 : (colorMode === 'dark' ? '#111827' : '#f3f4f6'),
                  color: filter === 'all' ? '#fff' : (colorMode === 'dark' ? '#d1d5db' : '#111827'),
                }}
              >
                All Works
              </button>
              <button
                onClick={() => setFilter('character')}
                className={`px-4 py-2 rounded-full transition`}
                style={{
                  backgroundColor: filter === 'character' ? c600 : (colorMode === 'dark' ? '#111827' : '#f3f4f6'),
                  color: filter === 'character' ? '#fff' : (colorMode === 'dark' ? '#d1d5db' : '#111827'),
                }}
              >
                Characters
              </button>
              <button
                onClick={() => setFilter('environment')}
                className={`px-4 py-2 rounded-full transition`}
                style={{
                  backgroundColor: filter === 'environment' ? c600 : (colorMode === 'dark' ? '#111827' : '#f3f4f6'),
                  color: filter === 'environment' ? '#fff' : (colorMode === 'dark' ? '#d1d5db' : '#111827'),
                }}
              >
                Environments
              </button>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery..."
                className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 py-2 pl-10 text-white focus:outline-none"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Gallery Grid */}
      <section className="py-16" style={{ backgroundColor: colorMode === 'dark' ? '#111827' : '#f3f4f6' }}>
        <div className="container mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl text-gray-400">No artwork found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg overflow-hidden transition cursor-pointer"
                  style={{ backgroundColor: colorMode === 'dark' ? '#000' : '#fff', boxShadow: colorMode === 'dark' ? '0 10px 15px -10px rgba(0,0,0,0.7)' : '0 10px 15px -10px rgba(0,0,0,0.1)' }}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative h-64">
                    <PlaceholderArt width={400} height={256} className="w-full h-full" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold" style={{ color: c400 }}>{item.title}</h3>
                      <span className="text-gray-500 text-sm">{item.year}</span>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                    <span className="inline-block bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                      {item.category === 'character' ? 'Character' : 'Environment'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full transition z-10"
              >
                <FaTimes />
              </button>
              <div className="relative h-[50vh]">
                <PlaceholderArt width={800} height={600} className="w-full h-full" />
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold" style={{ color: c400 }}>{selectedItem.title}</h2>
                <span className="text-gray-500">{selectedItem.year}</span>
              </div>
              <p className="text-gray-300 mb-6">{selectedItem.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {selectedItem.category === 'character' ? 'Character' : 'Environment'}
                </span>
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  Digital Art
                </span>
              </div>
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Interested in similar artwork?</h3>
                <div className="flex gap-4">
                  <a
                    href="/commissions"
                    className="text-white font-bold py-2 px-6 rounded-full transition"
                    style={{ backgroundColor: c600 }}
                  >
                    Commission Me
                  </a>
                  <button
                    onClick={closeModal}
                    className="bg-transparent hover:bg-gray-800 text-white border border-gray-700 font-bold py-2 px-6 rounded-full transition"
                  >
                    Back to Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage; 
