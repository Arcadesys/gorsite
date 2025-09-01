import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/users/[id] - Delete a user account (superadmin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()

    // Check if user exists in Supabase
    const { data: user, error: getUserError } = await (admin as any).auth.admin.getUserById(id)
    if (getUserError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent superadmin from deleting themselves
    if (user.email === result.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete from Supabase Auth first
    const { error: deleteError } = await (admin as any).auth.admin.deleteUser(id)
    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Update local database record to mark as deleted (soft delete to preserve data integrity)
    await prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        deactivatedAt: new Date(),
        email: null, // Clear email to allow reuse
      },
    }).catch(() => {
      // User might not exist in local DB, that's OK
    })

    return NextResponse.json({ ok: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id] - Update user status (superadmin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  const { id } = params
  const { action, role } = await req.json().catch(() => ({}))

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()

    // Check if user exists
    const { data: user, error: getUserError } = await (admin as any).auth.admin.getUserById(id)
    if (getUserError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent superadmin from affecting themselves
    if (user.email === result.user.email) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
    }

    switch (action) {
      case 'deactivate':
        // Deactivate user in Supabase (ban them)
        const { error: banError } = await (admin as any).auth.admin.updateUserById(id, {
          ban_duration: '876000h', // ~100 years (effectively permanent)
          user_metadata: {
            ...user.user_metadata,
            deactivated: true,
            deactivated_at: new Date().toISOString(),
          }
        })
        if (banError) {
          console.error('Supabase ban error:', banError)
          return NextResponse.json({ error: banError.message }, { status: 500 })
        }

        // Update local database
        await prisma.user.update({
          where: { id },
          data: {
            status: 'DEACTIVATED',
            deactivatedAt: new Date(),
          },
        }).catch(() => {
          // User might not exist in local DB, that's OK
        })

        return NextResponse.json({ ok: true, message: 'User deactivated successfully' })

      case 'activate':
        // Reactivate user in Supabase (unban them)
        const { error: unbanError } = await (admin as any).auth.admin.updateUserById(id, {
          ban_duration: 'none',
          user_metadata: {
            ...user.user_metadata,
            deactivated: false,
            deactivated_at: null,
          }
        })
        if (unbanError) {
          console.error('Supabase unban error:', unbanError)
          return NextResponse.json({ error: unbanError.message }, { status: 500 })
        }

        // Update local database
        await prisma.user.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            deactivatedAt: null,
          },
        }).catch(() => {
          // User might not exist in local DB, that's OK
        })

        return NextResponse.json({ ok: true, message: 'User activated successfully' })

      case 'update_role':
        if (!role) {
          return NextResponse.json({ error: 'Role is required for update_role action' }, { status: 400 })
        }

        const roles = role.toLowerCase() === 'admin' ? ['admin'] : ['artist']
        const userMeta: any = role.toLowerCase() === 'admin'
          ? { is_admin: true, role: 'ADMIN' }
          : { is_admin: false, role: 'ARTIST' }

        const { error: updateError } = await (admin as any).auth.admin.updateUserById(id, {
          user_metadata: { ...user.user_metadata, ...userMeta },
          app_metadata: { ...user.app_metadata, roles },
        })
        if (updateError) {
          console.error('Supabase role update error:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true, message: 'User role updated successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}