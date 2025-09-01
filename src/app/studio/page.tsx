"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function StudioHome() {
  const { accentColor, colorMode } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/studio/portfolio', { cache: 'no-store' });
        if (res.status === 404) {
          setPortfolio(null);
        } else if (res.ok) {
          const data = await res.json();
          setPortfolio(data.portfolio);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Failed to load portfolio');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const c400 = `var(--${accentColor}-400)`;
  const c600 = `var(--${accentColor}-600)`;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: c400 }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome to your Studio</h1>
      <p className="text-gray-400">Manage your portfolio branding, galleries and commission prices.</p>

      {/* Portfolio URL Display */}
      {portfolio && (
        <div className={`${colorMode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'} border border-blue-500/50 rounded p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{ color: c400 }}>Your Gallery URL</h3>
              <p className="text-sm mt-1">
                <a 
                  href={`/${portfolio.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-mono"
                  style={{ color: c400 }}
                >
                  artpop.vercel.app/{portfolio.slug}
                </a>
              </p>
            </div>
            <button 
              onClick={() => router.push('/studio/portfolio')}
              className="px-3 py-1 rounded text-sm border"
              style={{ borderColor: c400, color: c400 }}
            >
              Manage URL
            </button>
          </div>
        </div>
      )}

      {/* Simple onboarding wizard */}
      <div className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border rounded p-4`}>
        <div className="font-semibold mb-3" style={{ color: c400 }}>Getting Started</div>
        <ol className="list-decimal ml-5 space-y-2">
          <li>
            {portfolio ? (
              <span>
                Review your portfolio settings and branding —
                <button className="underline ml-1" onClick={() => router.push('/studio/portfolio')}>Open Portfolio Settings</button>
              </span>
            ) : (
              <span>
                Set up your portfolio and artist URL —
                <button className="underline ml-1" onClick={() => router.push('/studio/portfolio')}>Configure Portfolio</button>
              </span>
            )}
          </li>
          <li>
            Define your commission prices —
            <button className="underline ml-1" onClick={() => router.push('/studio/prices')}>Set Prices</button>
          </li>
          <li>
            Upload or curate gallery items for your site —
            <button className="underline ml-1" onClick={() => router.push('/studio/galleries')}>Manage Galleries</button>
          </li>
        </ol>
        {!portfolio ? (
          <div className="mt-4 text-sm text-yellow-400">
            Complete your portfolio setup to make your gallery discoverable.
          </div>
        ) : null}
        <div className="mt-4">
          <button onClick={() => router.push('/studio/portfolio')} className="px-4 py-2 rounded text-white" style={{ backgroundColor: c600 }}>
            {portfolio ? 'Configure Portfolio' : 'Set Up Portfolio' }
          </button>
        </div>
        {error ? <div className="mt-3 text-sm text-red-500">{error}</div> : null}
      </div>
    </div>
  )
}
