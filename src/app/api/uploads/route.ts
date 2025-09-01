import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser } from '@/lib/auth-helpers';
import sharp from 'sharp';

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

  // Convert file to buffer and validate with Sharp
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    console.info('[uploads] Image metadata', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    });
    
    // Additional validation - ensure image has reasonable dimensions
    if (!metadata.width || !metadata.height || metadata.width < 1 || metadata.height < 1) {
      console.warn('[uploads] Invalid image dimensions', metadata);
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
    }
  } catch (error) {
    console.warn('[uploads] Image validation failed', { error: (error as Error).message });
    return NextResponse.json({ error: 'Invalid image file format' }, { status: 400 });
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
      userEmail: user.email,
      name: file.name,
      type: mime,
      size,
      bucket,
      key,
    });

    // Ensure the user exists in our local database first
    await ensureLocalUser(user);

    // Use the validated buffer for upload
    const { data, error } = await supabase.storage.from(bucket).upload(key, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: mime,
    });
    if (error) {
      console.error('[uploads] Storage upload error', { 
        message: error.message, 
        name: (error as any).name,
        statusCode: (error as any).statusCode,
        details: error 
      });
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
