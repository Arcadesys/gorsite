"use client"
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'
import { FaUser, FaEdit, FaSave, FaKey, FaEnvelope, FaBell, FaShieldAlt } from 'react-icons/fa';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastSignIn?: string;
  emailVerified: boolean;
}

interface ProfileSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  portfolioNotifications: boolean;
  commissionNotifications: boolean;
}

export default function ProfilePage() {
  const [userRole] = useState<'ARTIST' | 'ADMIN' | 'SUPERADMIN'>('ARTIST');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>({
    emailNotifications: true,
    marketingEmails: false,
    portfolioNotifications: true,
    commissionNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setProfileForm({
          name: data.profile?.name || '',
          email: data.profile?.email || '',
          avatar: data.profile?.avatar || '',
        });
        setSettings(data.settings || settings);
      } else {
        // Mock data for now
        const mockProfile = {
          id: '1',
          email: 'artist@example.com',
          name: 'Artist Name',
          avatar: 'https://via.placeholder.com/150',
          role: 'ARTIST',
          createdAt: '2024-01-15T10:30:00Z',
          lastSignIn: '2024-12-01T15:45:00Z',
          emailVerified: true,
        };
        setProfile(mockProfile);
        setProfileForm({
          name: mockProfile.name,
          email: mockProfile.email,
          avatar: mockProfile.avatar,
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditingProfile(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setEditingPassword(false);
        alert('Password updated successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (newSettings: ProfileSettings) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleSettingChange = (key: keyof ProfileSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <FaUser className="mr-3 text-2xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </h2>
              {editingProfile ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileForm({
                        name: profile?.name || '',
                        email: profile?.email || '',
                        avatar: profile?.avatar || '',
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                    disabled={saving}
                  >
                    <FaSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  disabled={!editingProfile}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!editingProfile}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                />
                {profile?.emailVerified && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <FaShieldAlt className="mr-1" />
                    Email verified
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar
                </label>
                <ImageUpload
                  type="profile"
                  currentImageUrl={profileForm.avatar}
                  onImageChange={(url) => setProfileForm({ ...profileForm, avatar: url || '' })}
                  disabled={!editingProfile}
                  className="h-32"
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Change Password
              </h2>
              {editingPassword ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPassword(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={changePassword}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                    disabled={saving}
                  >
                    <FaKey className="mr-2" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPassword(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
                >
                  <FaKey className="mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {editingPassword && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <FaBell className="mr-3 text-xl text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Notification Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email notifications for important updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Marketing Emails</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive newsletters and promotional content
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Portfolio Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when someone views or likes your artwork
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.portfolioNotifications}
                  onChange={(e) => handleSettingChange('portfolioNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Commission Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive alerts for new commission requests
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.commissionNotifications}
                  onChange={(e) => handleSettingChange('commissionNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Account Role</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.role}</p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {profile?.createdAt && formatDate(profile.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400">Last Sign In</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {profile?.lastSignIn ? formatDate(profile.lastSignIn) : 'Never'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400">Account ID</p>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{profile?.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}