'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FaCog, FaSave, FaGlobe, FaEnvelope, FaShieldAlt, FaImage, FaPalette, FaUsers } from 'react-icons/fa';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  logoUrl?: string;
  faviconUrl?: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  requireAdminApproval: boolean;
  maxUploadSize: number; // in MB
  allowedFileTypes: string[];
  defaultTheme: 'light' | 'dark' | 'system';
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  featuredArtistsLimit: number;
  enableCommissions: boolean;
  enableAnalytics: boolean;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    discord?: string;
  };
}

export default function SettingsPage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Artist Portfolio Platform',
    siteDescription: 'A platform for artists to showcase their work',
    siteUrl: 'https://yoursite.com',
    contactEmail: 'contact@yoursite.com',
    allowRegistration: true,
    requireEmailVerification: true,
    requireAdminApproval: false,
    maxUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    defaultTheme: 'system',
    maintenanceMode: false,
    featuredArtistsLimit: 6,
    enableCommissions: true,
    enableAnalytics: true,
    socialLinks: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.settings });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <FaCog /> },
    { id: 'appearance', name: 'Appearance', icon: <FaPalette /> },
    { id: 'users', name: 'User Settings', icon: <FaUsers /> },
    { id: 'uploads', name: 'Uploads', icon: <FaImage /> },
    { id: 'features', name: 'Features', icon: <FaShieldAlt /> },
  ];

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaCog className="mr-3 text-2xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Site Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure platform settings and preferences
              </p>
            </div>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
          >
            <FaSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    General Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Featured Artists Limit
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.featuredArtistsLimit}
                        onChange={(e) => handleInputChange('featuredArtistsLimit', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Social Media Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks.twitter || ''}
                          onChange={(e) => handleSocialChange('twitter', e.target.value)}
                          placeholder="@username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks.instagram || ''}
                          onChange={(e) => handleSocialChange('instagram', e.target.value)}
                          placeholder="@username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Facebook
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks.facebook || ''}
                          onChange={(e) => handleSocialChange('facebook', e.target.value)}
                          placeholder="Page name"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discord
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks.discord || ''}
                          onChange={(e) => handleSocialChange('discord', e.target.value)}
                          placeholder="Invite link"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Appearance Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={settings.logoUrl || ''}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Favicon URL
                      </label>
                      <input
                        type="url"
                        value={settings.faviconUrl || ''}
                        onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Theme
                      </label>
                      <select
                        value={settings.defaultTheme}
                        onChange={(e) => handleInputChange('defaultTheme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">Follow System</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* User Settings */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    User Registration & Management
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Allow Registration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow new users to sign up for accounts
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.allowRegistration}
                        onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Require Email Verification</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Require users to verify their email before accessing the platform
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Require Admin Approval</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Require admin approval before new accounts can be activated
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.requireAdminApproval}
                        onChange={(e) => handleInputChange('requireAdminApproval', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Settings */}
              {activeTab === 'uploads' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Upload Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxUploadSize}
                        onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Allowed File Types
                      </label>
                      <input
                        type="text"
                        value={settings.allowedFileTypes.join(', ')}
                        onChange={(e) => handleInputChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                        placeholder="jpg, png, gif, webp"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Settings */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Feature Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Enable Commissions</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow artists to receive and manage commission requests
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableCommissions}
                        onChange={(e) => handleInputChange('enableCommissions', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Enable Analytics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow artists to view analytics for their portfolios
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableAnalytics}
                        onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Maintenance Mode</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Put the site in maintenance mode (only admins can access)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                        className="h-4 w-4 text-red-600"
                      />
                    </div>

                    {settings.maintenanceMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={settings.maintenanceMessage || ''}
                          onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                          rows={3}
                          placeholder="We're performing maintenance and will be back soon!"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}