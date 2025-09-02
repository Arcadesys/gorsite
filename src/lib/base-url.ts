export function getBaseUrl() {
  // Prefer explicit public base URL
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (raw) {
    const candidate = raw.startsWith('http') ? raw : `https://${raw}`;
    try {
      const url = new URL(candidate);
      // Guard against localhost in production
      if (
        process.env.NODE_ENV === 'production' &&
        /localhost|127\.0\.0\.1/i.test(url.hostname)
      ) {
        throw new Error('Invalid BASE_URL in production');
      }
      return url.origin;
    } catch {
      // fall through to other detection
    }
  }

  // Vercel-provided URL (domain only, needs https)
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Non-production: safe localhost default
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  // In production, require a proper base URL
  throw new Error('Base URL not configured. Set NEXT_PUBLIC_BASE_URL or VERCEL_URL.');
}

