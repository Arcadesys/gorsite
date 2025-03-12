'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full space-y-8 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: `var(--${accentColor}-400)` }}>
            Create an Account
          </h2>
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Register to access the admin dashboard
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

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10`}
                  style={{ 
                    focusRing: `var(--${accentColor}-500)`,
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
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
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10`}
                  style={{ 
                    focusRing: `var(--${accentColor}-500)`,
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10`}
                  style={{ 
                    focusRing: `var(--${accentColor}-500)`,
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Password"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 ${
                    colorMode === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:z-10`}
                  style={{ 
                    focusRing: `var(--${accentColor}-500)`,
                    borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                  }}
                  placeholder="Confirm Password"
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
                  <FaUser className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
              )}
              Register
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link 
              href="/admin/login" 
              className="font-medium transition-colors"
              style={{ color: `var(--${accentColor}-400)` }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 