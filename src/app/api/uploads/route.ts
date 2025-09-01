import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    console.warn('[uploads] Missing file in form-data');
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  // Basic validation: only allow images up to ~20MB
  const mime = (file as any).type || '';
  if (!mime.startsWith('image/')) {
    console.warn('[uploads] Rejected non-image file', { mime });
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
  }
  const size = (file as any).size || 0;
  if (size > 20 * 1024 * 1024) {
    console.warn('[uploads] Rejected oversized file', { size });
    return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 413 });
  }

  // Auth check: require user session
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.warn('[uploads] Unauthorized upload attempt', { error: userErr?.message });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const key = `users/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    console.info('[uploads] Starting upload', {
      userId: user.id,
      name: file.name,
      type: mime,
      size,
      bucket,
      key,
    });

    const { data, error } = await supabase.storage.from(bucket).upload(key, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      console.error('[uploads] Storage upload error', { message: error.message, name: (error as any).name });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    console.info('[uploads] Upload complete', { path: data.path, publicUrl: pub.publicUrl });
    return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl });
  } catch (e: any) {
    console.error('[uploads] Unexpected error', { message: e?.message, stack: e?.stack });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
