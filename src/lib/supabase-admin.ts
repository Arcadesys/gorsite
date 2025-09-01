import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function findUserIdByEmail(admin: ReturnType<typeof getSupabaseAdmin>, email: string) {
  let page = 1
  const perPage = 200
  for (let i = 0; i < 10; i++) {
    const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const found = data?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
    if (found) return found.id as string
    if (!data || data.users.length < perPage) break
    page++
  }
  return null
}

