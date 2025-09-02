'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';
import { FaUser, FaLock, FaEnvelope, FaCheck, FaExclamationCircle, FaPalette } from 'react-icons/fa';
import { validatePassword, getPasswordRequirements } from '@/lib/password-validation';

type InvitationData = {
  id: string;
  email: string;
  customMessage?: string;
  inviterName?: string;
  expiresAt: string;
  status: string;
};

function SignupForm() {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    slug: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [step, setStep] = useState(1);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { accentColor, colorMode } = useTheme();

  const getButtonBgColor = () => {
    return colorMode === 'dark' ? `var(--${accentColor}-600)` : `var(--${accentColor}-500)`;
  };

  const getButtonHoverBgColor = () => {
    return colorMode === 'dark' ? `var(--${accentColor}-700)` : `var(--${accentColor}-600)`;
  };

  // Validate the invitation token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/signup/validate-invitation?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Invalid or expired invitation');
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
      } catch (err) {
        setError('Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/signup/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch (err) {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  // Debounced slug checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug) {
        checkSlugAvailability(formData.slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug }));
    setSlugAvailable(null);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!formData.slug) {
      setError('Please choose your artist URL');
      return;
    }
    
    if (formData.slug.length < 3) {
      setError('Artist URL must be at least 3 characters');
      return;
    }
    
    if (slugAvailable === false) {
      setError('This artist URL is already taken');
      return;
    }
    
    if (!formData.displayName) {
      setError('Please enter your display name');
      return;
    }
    
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use the shared password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: formData.email,
          slug: formData.slug,
          displayName: formData.displayName,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/studio/onboarding');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: `var(--${accentColor}-500)` }}></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-md w-full space-y-8 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} p-10 rounded-xl shadow-lg text-center`}>
          <div>
            <FaExclamationCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-red-500">
              Invitation Error
            </h2>
            <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: `var(--${accentColor}-600)` }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
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
              Welcome to The Arcade Art Gallery!
            </h2>
            <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Your account has been created successfully. You're being redirected to set up your first gallery...
            </p>
            <div className="mt-4 text-sm">
              <p className="font-semibold">Your artist URL: <span className="font-mono text-green-500">/{formData.slug}</span></p>
            </div>
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
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold" style={{ color: `var(--${accentColor}-400)` }}>
            Join The Arcade Art Gallery
          </h2>
          <p className={`mt-2 text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome! You've been invited to showcase your art.
          </p>
        </div>

        {/* Custom Message */}
        {invitation?.customMessage && (
          <div className={`p-4 rounded-lg ${colorMode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'} border border-blue-500/50`}>
            <p className={`text-sm ${colorMode === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
              <strong>Personal message:</strong> {invitation.customMessage}
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-4 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'text-white' : 'text-gray-400'
          }`} style={{ backgroundColor: step >= 1 ? `var(--${accentColor}-500)` : '#374151' }}>
            1
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'text-white' : 'text-gray-400'
          }`} style={{ backgroundColor: step >= 2 ? `var(--${accentColor}-500)` : '#374151' }}>
            2
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Step 1: Enter email, choose slug and display name */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
            <div className="space-y-4">
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
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                      colorMode === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                    style={{ 
                      borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>
                <p className={`mt-1 text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will be used for your artist account
                </p>
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                  Choose Your Artist URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      artpop.vercel.app/
                    </span>
                  </div>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-28 ${
                      colorMode === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                    style={{ 
                      borderColor: slugAvailable === false ? '#ef4444' : slugAvailable === true ? '#10b981' : 
                        colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                    }}
                    placeholder="your-artist-name"
                  />
                  {checkingSlug && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    </div>
                  )}
                  {slugAvailable === true && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheck className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                {slugAvailable === false && (
                  <p className="mt-1 text-sm text-red-500">This URL is already taken</p>
                )}
                {slugAvailable === true && (
                  <p className="mt-1 text-sm text-green-500">Available!</p>
                )}
                <p className={`mt-1 text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will be your unique URL where people can find your art
                </p>
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`${colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                      colorMode === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                    style={{ 
                      borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                    }}
                    placeholder="Your Artist Name"
                  />
                </div>
                <p className={`mt-1 text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This is how your name will appear on your portfolio
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.slug || !formData.displayName || slugAvailable !== true}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: getButtonBgColor(),
                borderColor: getButtonBgColor()
              }}
            >
              Continue to Password Setup
            </button>
          </form>
        )}

        {/* Step 2: Set password */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleFinalSubmit}>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email: <span className="font-mono font-bold">{formData.email}</span>
                </p>
                <p className={`text-sm ${colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your URL will be: <span className="font-mono font-bold">/{formData.slug}</span>
                </p>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-400 underline mt-1"
                >
                  Change Details
                </button>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Create Password
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
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                      colorMode === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                    style={{ 
                      borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                    }}
                    placeholder="Create a secure password"
                  />
                </div>
                <div className={`mt-2 text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password requirements:
                  <ul className="mt-1 ml-4 list-disc">
                    {getPasswordRequirements().map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
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
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 pl-10 ${
                      colorMode === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:z-10 focus:ring-opacity-50`}
                    style={{ 
                      borderColor: colorMode === 'dark' ? `var(--${accentColor}-800)` : `var(--${accentColor}-200)`
                    }}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: getButtonBgColor(),
                  borderColor: getButtonBgColor()
                }}
              >
                {loading ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <FaPalette className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                )}
                {loading ? 'Creating Your Gallery...' : 'Create My Artist Profile'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <p className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            By creating an account, you agree to showcase your art with The Arcade Art Gallery.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}