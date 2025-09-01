export const RESERVED_SLUGS = new Set<string>([
  'admin', 'api', 'studio', 'auth', 'login', 'logout', 'signup', 'register',
  'dashboard', 'system', 'uploads', 'static', 'public', 'next', 'favicon',
  'assets', 'g', 'gallery', 'galleries', 'pricing', 'prices', 'commissions'
])

export function sanitizeSlug(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(String(slug || '').toLowerCase())
}

export function baseFromEmail(email?: string | null): string {
  const local = String(email || '').toLowerCase().split('@')[0] || 'artist'
  let base = sanitizeSlug(local)
  if (!base || base.length < 3) base = 'artist'
  if (isReservedSlug(base)) base = 'artist'
  return base
}

