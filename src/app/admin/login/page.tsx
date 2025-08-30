'use client';

import { useState } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import { FaGoogle, FaFacebook, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { accentColor, colorMode } = useTheme();

  // Get button background color based on mode
  const getButtonBgColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-600)`;
    } else {
      return `var(--${accentColor}-500)`;
    }
  };

  // Get button hover background color based on mode
  const getButtonHoverBgColor = () => {
    if (colorMode === 'dark') {
      return `var(--${accentColor}-700)`;
    } else {
      return `var(--${accentColor}-600)`;
    }
  };

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        body: { email, password },
      });
      
      if (result?.error) {
        setError(typeof result.error === 'string' ? result.error : 'Login failed');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle social login
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    try {
      await signIn(provider, { redirectTo: '/admin/dashboard' });
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
            Artist Admin Login
          </h2>
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to manage your portfolio and commissions
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                  style={{ 
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                  style={{ 
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ 
                backgroundColor: getButtonBgColor(),
                borderColor: getButtonBgColor()
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = getButtonHoverBgColor())}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = getButtonBgColor())}
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
                  <FaEnvelope className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
              )}
              Sign in with Email
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${colorMode === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                colorMode === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
              Google
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                colorMode === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
              Facebook
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            This login is for the artist only. If you&apos;re looking to commission artwork, please visit the <a href="/commissions" className="font-medium transition-colors" style={{ color: `var(--${accentColor}-400)` }}>commissions page</a>.
          </p>
        </div>

        <div className="text-center mt-4">
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Don&apos;t have an account?{' '}
            <Link
              href="/admin/login"
              className="font-medium hover:underline"
              style={{ color: `var(--${accentColor}-500)` }}
            >
              Contact the admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}