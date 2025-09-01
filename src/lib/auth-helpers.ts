import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase'

export type SupabaseUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
}

// Create a Supabase server client for Route Handlers and return the response holder
export function getRouteSupabase(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = getSupabaseServer(req, res)
  return { supabase, res }
}

// Require an authenticated user; returns { user, res } or a NextResponse with 401
export async function requireUser(req: NextRequest): Promise<
  | { user: SupabaseUser; res: NextResponse }
  | NextResponse
> {
  const { supabase, res } = getRouteSupabase(req)
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { user: data.user as SupabaseUser, res }
}

// Check if user is an admin
export function isAdmin(user: SupabaseUser): boolean {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  )
}

// Check if user is a superadmin (has special privileges like user management)
export function isSuperAdmin(user: SupabaseUser): boolean {
  const superEmail = (process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me').toLowerCase()
  const userEmail = (user?.email || '').toLowerCase()
  
  return isAdmin(user) && userEmail === superEmail
}

// Require superadmin privileges; returns { user, res } or a NextResponse with 403
export async function requireSuperAdmin(req: NextRequest): Promise<
  | { user: SupabaseUser; res: NextResponse }
  | NextResponse
> {
  const result = await requireUser(req)
  if (result instanceof NextResponse) {
    return result
  }
  
  if (!isSuperAdmin(result.user)) {
    return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 })
  }
  
  return result
}

// Check if user needs to change their password
export function requiresPasswordChange(user: SupabaseUser): boolean {
  return Boolean(user?.user_metadata?.force_password_change === true)
}

// Ensure a matching local User row exists for the Supabase auth user.
// This keeps existing Prisma relations working without NextAuth.
export async function ensureLocalUser(user: SupabaseUser) {
  // Minimal fields; keep existing values if present
  const id = user.id
  const email = user.email ?? undefined
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined)

  await prisma.user.upsert({
    where: { id },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
    },
    create: {
      id,
      email: email ?? undefined,
      name: name ?? undefined,
    },
  })
}
