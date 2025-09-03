import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase'

function isAdmin(user: any) {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  )
}

export async function GET(req: NextRequest) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where: any = {}
  // Artists see their own commissions; admins see all
  if (!isAdmin(user)) {
    where.userId = user.id
  }

  const commissions = await prisma.commission.findMany({
    where,
    orderBy: [
      { queuePosition: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  return NextResponse.json({ commissions })
}

