'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import UploadButton from '@/components/UploadButton';
import { FaCheck, FaExclamationCircle, FaGlobe, FaSpinner } from 'react-icons/fa';

export default function StudioPortfolioPage() {
  const { accentColor, colorMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [originalSlug, setOriginalSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/studio/portfolio', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setForm(data.portfolio);
        setOriginalSlug(data.portfolio.slug);
        setSlugAvailable(true); // Current slug is available (it's theirs)
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Check slug availability (debounced)
  useEffect(() => {
    const checkSlug = async (slug: string) => {
      if (!slug || slug === originalSlug || slug.length < 3) {
        setSlugAvailable(slug === originalSlug ? true : null);
        return;
      }

      setCheckingSlug(true);
      try {
        const res = await fetch(`/api/studio/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch (err) {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    };

    const timer = setTimeout(() => {
      if (form.slug) {
        checkSlug(form.slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.slug, originalSlug]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    // Validate slug if it changed
    if (form.slug !== originalSlug) {
      if (!form.slug || form.slug.length < 3) {
        setError('Artist URL must be at least 3 characters');
        return;
      }
      if (!/^[a-z0-9-]+$/.test(form.slug)) {
        setError('Artist URL can only contain lowercase letters, numbers, and hyphens');
        return;
      }
      if (slugAvailable === false) {
        setError('This artist URL is already taken');
        return;
      }
    }

    try {
      const res = await fetch('/api/studio/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      setSaveSuccess(true);
      setOriginalSlug(form.slug); // Update original slug after successful save
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const set = (k: string, v: any) => {
    setForm((s: any) => ({ ...s, [k]: v }));
    if (k === 'slug') {
      // Clean the slug input
      const cleanSlug = v.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanSlug !== v) {
        setForm((s: any) => ({ ...s, [k]: cleanSlug }));
        return;
      }
      setSlugAvailable(null);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    set('slug', value);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your portfolio branding and public URL</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaCheck className="mr-2" />
            <span>Portfolio settings saved successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={save} className="space-y-6 max-w-4xl">
        {/* Artist URL Section */}
        <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center mb-4">
            <FaGlobe className="mr-2" style={{ color: `var(--${accentColor}-400)` }} />
            <h2 className="text-lg font-semibold" style={{ color: `var(--${accentColor}-400)` }}>
              Your Artist URL
            </h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Artist URL (Slug)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-sm ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    artpop.vercel.app/
                  </span>
                </div>
                <input 
                  className={`w-full px-3 py-3 pl-28 rounded border bg-transparent ${
                    form.slug !== originalSlug && slugAvailable === false ? 'border-red-500' : 
                    form.slug !== originalSlug && slugAvailable === true ? 'border-green-500' : ''
                  }`}
                  style={{
                    borderColor: form.slug !== originalSlug ? (
                      slugAvailable === false ? '#ef4444' : 
                      slugAvailable === true ? '#10b981' : 
                      `var(--${accentColor}-400)`
                    ) : undefined
                  }}
                  value={form.slug || ''} 
                  onChange={handleSlugChange}
                  placeholder="your-artist-name"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingSlug && <FaSpinner className="animate-spin h-4 w-4 text-gray-400" />}
                  {!checkingSlug && form.slug !== originalSlug && slugAvailable === true && (
                    <FaCheck className="h-4 w-4 text-green-500" />
                  )}
                  {!checkingSlug && form.slug !== originalSlug && slugAvailable === false && (
                    <FaExclamationCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              {form.slug !== originalSlug && (
                <div className="mt-2 text-sm">
                  {slugAvailable === false && (
                    <p className="text-red-500">❌ This URL is already taken</p>
                  )}
                  {slugAvailable === true && (
                    <p className="text-green-500">✅ This URL is available!</p>
                  )}
                  {slugAvailable === null && form.slug && form.slug.length >= 3 && !checkingSlug && (
                    <p className="text-gray-500">Checking availability...</p>
                  )}
                </div>
              )}
              
              <div className="mt-2">
                <p className={`text-xs ${colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This is your public URL where people can find your art gallery.
                </p>
                {form.slug && (
                  <p className="text-sm mt-1">
                    <span className="text-gray-500">Your gallery will be at: </span>
                    <a 
                      href={`/${form.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono underline"
                      style={{ color: `var(--${accentColor}-400)` }}
                    >
                      artpop.vercel.app/{form.slug}
                    </a>
                  </p>
                )}
              </div>

              {originalSlug && originalSlug !== form.slug && (
                <div className={`mt-3 p-3 rounded border ${colorMode === 'dark' ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-yellow-100 border-yellow-400'}`}>
                  <p className={`text-sm ${colorMode === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <strong>⚠️ URL Change Warning:</strong> Changing your URL will break existing links to your gallery. 
                    Make sure to update any social media profiles or bookmarks that point to your old URL.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Details Section */}
        <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
            Portfolio Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input 
                className="w-full px-3 py-2 rounded border bg-transparent" 
                value={form.displayName || ''} 
                onChange={e => set('displayName', e.target.value)}
                placeholder="Your Artist Name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo</label>
              <div className="flex items-center gap-2">
                <input 
                  className="flex-1 px-3 py-2 rounded border bg-transparent" 
                  value={form.logoUrl || ''} 
                  onChange={e => set('logoUrl', e.target.value)}
                  placeholder="https://…/logo.png"
                />
                <UploadButton label="Upload" onUploaded={(url) => set('logoUrl', url)} />
              </div>
              {form.logoUrl ? (
                <div className="mt-2">
                  <img src={form.logoUrl} alt="Logo preview" className="h-12 rounded border bg-white p-1 object-contain" />
                  <p className="text-xs text-gray-500 mt-1">Suggested: transparent PNG/SVG</p>
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <select 
                className="w-full px-3 py-2 rounded border bg-transparent" 
                value={form.accentColor || 'green'} 
                onChange={e => set('accentColor', e.target.value)}
              >
                {['green','pink','purple','blue','orange'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color Mode</label>
              <select 
                className="w-full px-3 py-2 rounded border bg-transparent" 
                value={form.colorMode || 'dark'} 
                onChange={e => set('colorMode', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <input 
              className="w-full px-3 py-2 rounded border bg-transparent" 
              value={form.description || ''} 
              onChange={e => set('description', e.target.value)}
              placeholder="A brief description of your art style or focus"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">About (HTML allowed)</label>
            <textarea 
              className="w-full px-3 py-2 rounded border bg-transparent" 
              rows={6} 
              value={form.about || ''} 
              onChange={e => set('about', e.target.value)}
              placeholder="Tell visitors about yourself, your art journey, your inspiration..."
            />
          </div>
        </div>

        {/* Hero Images Section */}
        <div className={`p-6 rounded-lg border ${colorMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: `var(--${accentColor}-400)` }}>
            Hero Images
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Image (Light Mode)</label>
              <div className="flex items-center gap-2">
                <input 
                  className="flex-1 px-3 py-2 rounded border bg-transparent" 
                  value={form.heroImageLight || ''} 
                  onChange={e => set('heroImageLight', e.target.value)}
                  placeholder="/path/to/light-hero.jpg"
                />
                <UploadButton
                  label="Upload"
                  onUploaded={(url) => set('heroImageLight', url)}
                />
              </div>
              {form.heroImageLight ? (
                <div className="mt-2">
                  <img src={form.heroImageLight} alt="Hero Light preview" className="max-h-32 rounded border" />
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hero Image (Dark Mode)</label>
              <div className="flex items-center gap-2">
                <input 
                  className="flex-1 px-3 py-2 rounded border bg-transparent" 
                  value={form.heroImageDark || ''} 
                  onChange={e => set('heroImageDark', e.target.value)}
                  placeholder="/path/to/dark-hero.jpg"
                />
                <UploadButton
                  label="Upload"
                  onUploaded={(url) => set('heroImageDark', url)}
                />
              </div>
              {form.heroImageDark ? (
                <div className="mt-2">
                  <img src={form.heroImageDark} alt="Hero Dark preview" className="max-h-32 rounded border" />
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hero Image (Mobile)</label>
              <div className="flex items-center gap-2">
                <input 
                  className="flex-1 px-3 py-2 rounded border bg-transparent" 
                  value={form.heroImageMobile || ''} 
                  onChange={e => set('heroImageMobile', e.target.value)}
                  placeholder="/path/to/mobile-hero.jpg"
                />
                <UploadButton
                  label="Upload"
                  onUploaded={(url) => set('heroImageMobile', url)}
                />
              </div>
              {form.heroImageMobile ? (
                <div className="mt-2">
                  <img src={form.heroImageMobile} alt="Hero Mobile preview" className="max-h-32 rounded border" />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={form.slug !== originalSlug && slugAvailable !== true}
            className="px-6 py-3 rounded font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: `var(--${accentColor}-600)` }}
          >
            Save Portfolio Settings
          </button>
          
          {form.slug && (
            <a
              href={`/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded font-semibold border transition-colors"
              style={{ 
                borderColor: `var(--${accentColor}-400)`,
                color: `var(--${accentColor}-400)`
              }}
            >
              View Live Gallery
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
