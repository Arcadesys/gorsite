'use client';

import { useState } from 'react';
import { FaEnvelope, FaExclamationCircle, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { accentColor, colorMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(data.message);
      setEmail(''); // Clear the form

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full space-y-8 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: `var(--${accentColor}-400)` }}>
            Reset Your Password
          </h2>
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <FaCheck className="mr-2" />
              <span>{success}</span>
            </div>
            <div className="mt-2 text-sm">
              Check your email for the reset link. It may take a few minutes to arrive.
            </div>
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                  style={{ 
                    '--tw-ring-color': `var(--${accentColor}-500)`
                  } as React.CSSProperties}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ 
                  backgroundColor: `var(--${accentColor}-600)`,
                  borderColor: `var(--${accentColor}-600)`
                }}
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
                    <FaEnvelope className="h-5 w-5 text-white" />
                  </span>
                )}
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className={`inline-flex items-center text-sm hover:underline ${
              colorMode === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Login
          </Link>
        </div>

        {success && (
          <div className="text-center mt-4">
            <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess('');
                  setEmail('');
                }}
                className="font-medium hover:underline"
                style={{ color: `var(--${accentColor}-500)` }}
              >
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}