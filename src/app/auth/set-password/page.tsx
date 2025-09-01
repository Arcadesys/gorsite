'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { FaLock, FaCheck, FaExclamationCircle } from 'react-icons/fa';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { accentColor, colorMode } = useTheme();

  // Check if user is authenticated and needs to set password
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/admin/login?error=not_authenticated');
        return;
      }

      setUser(user);
    };

    checkAuth();
  }, [router]);

  const getButtonBgColor = () => {
    return colorMode === 'dark' ? `var(--${accentColor}-600)` : `var(--${accentColor}-500)`;
  };

  const getButtonHoverBgColor = () => {
    return colorMode === 'dark' ? `var(--${accentColor}-700)` : `var(--${accentColor}-600)`;
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message || 'Failed to set password');
      } else {
        setSuccess(true);
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: `var(--${accentColor}-500)` }}></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-md w-full space-y-8 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} p-10 rounded-xl shadow-lg text-center`}>
          <div>
            <FaCheck className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold" style={{ color: `var(--${accentColor}-400)` }}>
              Password Set Successfully!
            </h2>
            <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              You're being redirected to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        input:focus {
          --tw-ring-color: var(--${accentColor}-500);
        }
      `}</style>
      <div className={`max-w-md w-full space-y-8 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: `var(--${accentColor}-400)` }}>
            Set Your Password
          </h2>
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome! Please set a password for your account.
          </p>
          {user?.email && (
            <p className={`mt-1 text-sm ${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {user.email}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                  style={{ 
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="New password (minimum 6 characters)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                  style={{ 
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: getButtonBgColor(),
                borderColor: getButtonBgColor()
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = getButtonHoverBgColor())}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = getButtonBgColor())}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
              )}
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            After setting your password, you'll be able to access your artist dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}