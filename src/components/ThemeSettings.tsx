'use client';

import { useState } from 'react';
import { FaCog, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import type { AccentColor } from '@/context/ThemeContext';

export default function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { accentColor, setAccentColor, colorMode, toggleColorMode } = useTheme();

  const colorOptions = [
    { name: 'Pink', value: 'pink' },
    { name: 'Purple', value: 'purple' },
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Orange', value: 'orange' },
  ];

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const handleColorChange = (color: string) => {
    setAccentColor(color as AccentColor);
  };

  // Get the appropriate button background color based on mode
  const getButtonBgColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-600)`;
    } else {
      return `var(--${accentColor}-500)`;
    }
  };

  // Get the appropriate button hover background color based on mode
  const getButtonHoverBgColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-700)`;
    } else {
      return `var(--${accentColor}-600)`;
    }
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={toggleSettings}
        className="fixed bottom-6 right-6 z-50 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:rotate-45"
        aria-label="Theme Settings"
        style={{ 
          backgroundColor: getButtonBgColor(),
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = getButtonHoverBgColor())}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = getButtonBgColor())}
      >
        <FaCog className="text-xl" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-gray-500/70 flex items-center justify-center z-50 p-4">
          <div className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg max-w-md w-full p-6 relative shadow-xl`}>
            <button
              onClick={toggleSettings}
              className={`absolute top-4 right-4 ${colorMode === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
              aria-label="Close settings"
            >
              <FaTimes />
            </button>
            
            <h2 
              className="text-2xl font-bold mb-6" 
              style={{ 
                color: colorMode === 'dark' 
                  ? `var(--${accentColor}-400)` 
                  : `var(--${accentColor}-600)`
              }}
            >
              Site Settings
            </h2>
            
            {/* Color Mode Toggle */}
            <div className="mb-6">
              <h3 className={`font-medium mb-3 ${colorMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Color Mode
              </h3>
              <button
                onClick={toggleColorMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                  colorMode === 'dark' 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {colorMode === 'dark' ? (
                  <>
                    <FaSun className="text-yellow-400" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="text-indigo-600" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Accent Color Selection */}
            <div className="mb-6">
              <h3 className={`font-medium mb-3 ${colorMode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Accent Color
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={`w-full aspect-square rounded-full transition ${
                      accentColor === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' 
                        : 'hover:opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: colorMode === 'dark' 
                        ? `var(--${color.value}-500)` 
                        : `var(--${color.value}-500)`
                    }}
                    aria-label={`Set color to ${color.name}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div className={`border-t ${colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'} pt-4 mt-4`}>
              <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Your settings are automatically saved and will persist between visits.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 