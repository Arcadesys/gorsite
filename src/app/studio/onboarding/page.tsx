"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { getSupabaseBrowser } from '@/lib/supabase';

type OnboardingMeta = {
  done?: boolean;
  steps?: {
    branding?: boolean;
    prices?: boolean;
  };
};

export default function OnboardingPage() {
  const { accentColor, colorMode } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioExists, setPortfolioExists] = useState(false);
  const [pricesCount, setPricesCount] = useState<number>(0);
  const [onboarding, setOnboarding] = useState<OnboardingMeta>({ done: false, steps: {} });

  const c400 = `var(--${accentColor}-400)`;
  const c600 = `var(--${accentColor}-600)`;

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/admin/login?error=not_authenticated');
          return;
        }

        const meta = (user.user_metadata?.onboarding as OnboardingMeta) || { done: false, steps: {} };
        setOnboarding(meta);

        // Portfolio exists?
        const p = await fetch('/api/studio/portfolio', { cache: 'no-store' });
        setPortfolioExists(p.ok);

        // Prices count
        const pr = await fetch('/api/studio/prices', { cache: 'no-store' });
        if (pr.ok) {
          const data = await pr.json();
          setPricesCount(Array.isArray(data.prices) ? data.prices.length : 0);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load onboarding state');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const requirements = useMemo(() => ({
    portfolio: portfolioExists,
    branding: Boolean(onboarding.steps?.branding),
    prices: pricesCount > 0 || Boolean(onboarding.steps?.prices),
  }), [portfolioExists, pricesCount, onboarding]);

  const allDone = requirements.portfolio && requirements.branding && requirements.prices;

  async function updateOnboarding(next: Partial<OnboardingMeta>) {
    try {
      const supabase = getSupabaseBrowser();
      const merged: OnboardingMeta = {
        done: next.done ?? onboarding.done ?? false,
        steps: {
          branding: next.steps?.branding ?? onboarding.steps?.branding ?? false,
          prices: next.steps?.prices ?? onboarding.steps?.prices ?? false,
        },
      };
      const { error } = await supabase.auth.updateUser({ data: { onboarding: merged } });
      if (error) throw error;
      setOnboarding(merged);
    } catch (e: any) {
      setError(e.message || 'Failed to update onboarding');
    }
  }

  const Step = ({ ok, title, description, action }: { ok: boolean; title: string; description?: string; action?: React.ReactNode }) => (
    <div className={`flex items-start gap-3 p-3 rounded border ${ok ? 'border-emerald-600/50 bg-emerald-950/30' : colorMode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${ok ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>✓</div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        {description ? <div className="text-sm opacity-80">{description}</div> : null}
      </div>
      {action}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: c400 }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-gray-400">Let’s get your studio ready for production.</p>
      </div>

      {error ? (
        <div className="p-3 rounded border border-red-600/40 bg-red-950/20 text-sm text-red-300">{error}</div>
      ) : null}

      <div className={`${colorMode === 'dark' ? 'bg-gray-900' : 'bg-white'} border rounded p-4 space-y-3`}>
        <Step
          ok={requirements.portfolio}
          title="Portfolio assigned"
          description={requirements.portfolio ? 'Your portfolio slug is linked to your account.' : 'Ask an admin to create a portfolio and assign it to you.'}
          action={
            requirements.portfolio ? (
              <button className="px-3 py-2 text-xs rounded border" onClick={() => router.push('/studio/portfolio')}>Open</button>
            ) : (
              <span className="text-xs opacity-70">Admin action required</span>
            )
          }
        />

        <Step
          ok={requirements.branding}
          title="Customize branding"
          description="Set your display name, accent color, and hero images."
          action={
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-xs rounded border" onClick={() => router.push('/studio/portfolio')}>Configure</button>
              {!requirements.branding ? (
                <button
                  className="px-3 py-2 text-xs rounded text-white"
                  style={{ backgroundColor: c600 }}
                  onClick={() => updateOnboarding({ steps: { branding: true } })}
                >
                  Mark done
                </button>
              ) : null}
            </div>
          }
        />

        <Step
          ok={requirements.prices}
          title="Add at least one commission price"
          description={pricesCount > 0 ? `You have ${pricesCount} price${pricesCount === 1 ? '' : 's'} configured.` : 'Define your first commission price to accept requests.'}
          action={
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-xs rounded border" onClick={() => router.push('/studio/prices')}>Set prices</button>
              {pricesCount === 0 && !onboarding.steps?.prices ? (
                <button
                  className="px-3 py-2 text-xs rounded text-white"
                  style={{ backgroundColor: c600 }}
                  onClick={() => updateOnboarding({ steps: { prices: true } })}
                >
                  Mark done
                </button>
              ) : null}
            </div>
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={!allDone}
          className={`px-4 py-2 rounded text-white disabled:opacity-50`}
          style={{ backgroundColor: c600 }}
          onClick={async () => {
            await updateOnboarding({ done: true });
            router.push('/studio');
          }}
        >
          {allDone ? 'Finish and go to Studio' : 'Complete steps to finish'}
        </button>
        <button className="px-4 py-2 rounded border" onClick={() => router.push('/studio')}>Skip for now</button>
      </div>
    </div>
  );
}

