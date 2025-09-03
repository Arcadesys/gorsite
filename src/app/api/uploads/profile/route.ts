import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser } from '@/lib/auth-helpers';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  
  // Auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const type = form.get('type') as string; // 'profile', 'banner', 'commission', 'logo', 'favicon'
  
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  
  if (!type || !['profile', 'banner', 'commission', 'logo', 'favicon'].includes(type)) {
    return NextResponse.json({ error: 'Type must be one of: profile, banner, commission, logo, favicon' }, { status: 400 });
  }

  // Basic validation
  const mime = (file as any).type || '';
  if (!mime.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
  }
  
  const size = (file as any).size || 0;
  if (size > 10 * 1024 * 1024) { // 10MB limit for profile images
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
  }

  try {
    // Convert and process image
    let buffer = Buffer.from(await file.arrayBuffer());
    
    // Resize based on type
    if (type === 'profile') {
      // Profile image: square, 400x400
      buffer = await sharp(buffer)
        .resize(400, 400, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else if (type === 'banner') {
      // Banner image: wide, max 1200x400
      buffer = await sharp(buffer)
        .resize(1200, 400, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else if (type === 'commission') {
      // Commission example image: max 800x600, maintain aspect ratio
      buffer = await sharp(buffer)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else if (type === 'logo') {
      // Logo: max 400x400, maintain aspect ratio
      buffer = await sharp(buffer)
        .resize(400, 400, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ quality: 90 })
        .toBuffer();
    } else if (type === 'favicon') {
      // Favicon: 64x64 square
      buffer = await sharp(buffer)
        .resize(64, 64, { 
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toBuffer();
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';
    const extension = ['logo', 'favicon'].includes(type) ? 'png' : 'jpg';
    const key = `users/${user.id}/${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    console.info('[image-upload] Starting upload', {
      userId: user.id,
      type,
      originalSize: size,
      processedSize: buffer.length,
      bucket,
      key,
    });

    // Ensure the user exists in our local database first
    await ensureLocalUser(user);

    // Upload to Supabase Storage
    const contentType = ['logo', 'favicon'].includes(type) ? 'image/png' : 'image/jpeg';
    const { data, error } = await supabase.storage.from(bucket).upload(key, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });
    
    if (error) {
      console.error('[image-upload] Storage upload error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    
    console.info('[image-upload] Upload complete', { 
      path: data.path, 
      publicUrl: pub.publicUrl,
      type 
    });
    
    return NextResponse.json({ 
      path: data.path, 
      publicUrl: pub.publicUrl,
      type 
    });
    
  } catch (e: any) {
    console.error('[image-upload] Unexpected error', { message: e?.message, stack: e?.stack });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}