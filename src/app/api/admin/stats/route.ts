import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get system overview statistics
export async function GET(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  try {
    // Get invitation statistics
    const [
      totalInvitations,
      pendingInvitations,
      expiredInvitations
    ] = await Promise.all([
      prisma.artistInvitation.count(),
      prisma.artistInvitation.count({
        where: { status: 'PENDING' }
      }),
      prisma.artistInvitation.count({
        where: {
          status: 'PENDING',
          expiresAt: { lt: new Date() }
        }
      })
    ])

    // Get user statistics from Supabase
    const admin = getSupabaseAdmin()
    const { data: users, error: usersError } = await (admin as any).auth.admin.listUsers()
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    const totalUsers = users?.users?.length || 0
    const confirmedUsers = users?.users?.filter((u: any) => u.email_confirmed_at)?.length || 0
    const unconfirmedUsers = totalUsers - confirmedUsers

    // Get recent activity
    const recentInvitations = await prisma.artistInvitation.findMany({
      where: { status: 'PENDING' },
      include: {
        invitedByUser: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          confirmed: confirmedUsers,
          unconfirmed: unconfirmedUsers
        },
        invitations: {
          total: totalInvitations,
          pending: pendingInvitations,
          expired: expiredInvitations,
          active: pendingInvitations - expiredInvitations
        }
      },
      recentActivity: recentInvitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        invitedBy: inv.invitedByUser?.email || 'Unknown',
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        isExpired: new Date() > inv.expiresAt
      }))
    })

  } catch (error: any) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch statistics' 
    }, { status: 500 })
  }
}