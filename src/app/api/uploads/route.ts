import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = getSupabaseServer(req, res);
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  // Auth check: require user session
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';
  const ext = file.name.split('.').pop() || 'png';
  const key = `users/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(key, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl }, { headers: res.headers });
}

