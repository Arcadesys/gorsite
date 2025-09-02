import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/invitations - List all pending invitations
export async function GET(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  try {
    const invitations = await prisma.artistInvitation.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        invitedByUser: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include calculated fields
    const transformedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      customMessage: invitation.customMessage,
      invitedBy: invitation.invitedByUser?.email || 'Unknown',
      isExpired: new Date() > invitation.expiresAt,
      daysRemaining: Math.max(0, Math.ceil((invitation.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/signup?token=${invitation.token}`
    }))

    return NextResponse.json({
      invitations: transformedInvitations,
      total: transformedInvitations.length
    })

  } catch (error: any) {
    console.error('Get invitations error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch invitations' 
    }, { status: 500 })
  }
}

// DELETE /api/admin/invitations - Cancel/delete an invitation
export async function DELETE(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  try {
    const { invitationId } = await req.json()

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    await prisma.artistInvitation.delete({
      where: {
        id: invitationId
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Invitation cancelled successfully' 
    })

  } catch (error: any) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to cancel invitation' 
    }, { status: 500 })
  }
}