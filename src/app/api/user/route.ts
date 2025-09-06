import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser, isAdmin, isSuperAdmin } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  
  // Auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure user exists in local database
    const localUser = await ensureLocalUser(user);

    // Determine user role based on Supabase auth metadata and local database
    let role: 'ARTIST' | 'ADMIN' | 'SUPERADMIN' = 'ARTIST';
    
    if (isSuperAdmin(user)) {
      role = 'SUPERADMIN';
    } else if (isAdmin(user) || localUser.role === 'ADMIN') {
      role = 'ADMIN';
    } else {
      role = 'ARTIST';
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: localUser.name,
        role
      }
    });

  } catch (error) {
    console.error('[user] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}