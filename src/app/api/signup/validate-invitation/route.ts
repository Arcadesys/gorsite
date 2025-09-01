import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/signup/validate-invitation - Validate invitation token
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const invitation = await prisma.artistInvitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: { name: true, email: true }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: invitation.status === 'ACCEPTED' ? 'Invitation already used' : 'Invitation is no longer valid' 
      }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await prisma.artistInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        customMessage: invitation.customMessage,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        expiresAt: invitation.expiresAt.toISOString(),
        status: invitation.status
      }
    })
  } catch (error: any) {
    console.error('Invitation validation error:', error)
    return NextResponse.json({ 
      error: 'Failed to validate invitation' 
    }, { status: 500 })
  }
}