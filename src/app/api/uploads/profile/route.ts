import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser } from '@/lib/auth-helpers';
import sharp from 'sharp';
import { sendUploadFailureAlert } from '@/lib/email';
import { createRouteLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const logger = createRouteLogger('/api/uploads/profile')
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  
  // Auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    logger.warn('Unauthorized upload attempt', { error: userErr?.message })
    await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: userErr?.message || 'Unauthorized', status: 401, reqId: logger.reqId })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const type = form.get('type') as string; // 'profile', 'banner', 'commission', 'logo', 'favicon'
  
  if (!(file instanceof File)) {
    logger.warn('Missing file in form-data', { userEmail: user.email, userId: user.id })
    await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: 'Missing file in form-data', userEmail: user.email, userId: user.id, status: 400, reqId: logger.reqId })
    return NextResponse.json({ error: 'Missing file', requestId: logger.reqId }, { status: 400 });
  }
  
  if (!type || !['profile', 'banner', 'commission', 'logo', 'favicon'].includes(type)) {
    return NextResponse.json({ error: 'Type must be one of: profile, banner, commission, logo, favicon' }, { status: 400 });
  }

  // Basic validation
  const mime = (file as any).type || '';
  if (!mime.startsWith('image/')) {
    logger.warn('Rejected non-image file', { mime, userId: user.id })
    await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: 'Non-image MIME', userEmail: user.email, userId: user.id, mime, status: 400, reqId: logger.reqId })
    return NextResponse.json({ error: 'Only image uploads are allowed', requestId: logger.reqId }, { status: 400 });
  }
  
  const size = (file as any).size || 0;
  if (size > 10 * 1024 * 1024) { // 10MB limit for profile images
    logger.warn('Rejected oversized file', { size, userId: user.id })
    await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: 'File too large', userEmail: user.email, userId: user.id, size, status: 413, reqId: logger.reqId })
    return NextResponse.json({ error: 'File too large (max 10MB)', requestId: logger.reqId }, { status: 413 });
  }

  try {
    // Convert and process image
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const originalMime = (file as any).type || 'application/octet-stream';
    const originalExt = (file.name.split('.').pop() || '').toLowerCase();

    let buffer = originalBuffer;
    let processed = false;
    let extension = ['logo', 'favicon'].includes(type) ? 'png' : 'jpg';
    let contentType = ['logo', 'favicon'].includes(type) ? 'image/png' : 'image/jpeg';

    try {
      // Resize based on type
      if (type === 'profile') {
        // Profile image: square, 400x400
        buffer = await sharp(originalBuffer)
          .resize(400, 400, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 90 })
          .toBuffer();
        processed = true;
      } else if (type === 'banner') {
        // Banner image: wide, max 1200x400
        buffer = await sharp(originalBuffer)
          .resize(1200, 400, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 90 })
          .toBuffer();
        processed = true;
      } else if (type === 'commission') {
        // Commission example image: max 800x600, maintain aspect ratio
        buffer = await sharp(originalBuffer)
          .resize(800, 600, { 
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        processed = true;
      } else if (type === 'logo') {
        // Logo: max 400x400, maintain aspect ratio
        buffer = await sharp(originalBuffer)
          .resize(400, 400, { 
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ quality: 90 })
          .toBuffer();
        processed = true;
      } else if (type === 'favicon') {
        // Favicon: 64x64 square
        buffer = await sharp(originalBuffer)
          .resize(64, 64, { 
            fit: 'cover',
            position: 'center'
          })
          .png()
          .toBuffer();
        processed = true;
      }
    } catch (procErr) {
      // If Sharp processing (with resize) fails, try a plain decode->encode for HEIC/HEIF
      const isHeicLike = /heic|heif/.test(originalMime) || /heic|heif/.test(originalExt);
      try {
        if (isHeicLike) {
          buffer = await sharp(originalBuffer)
            .toFormat(['logo', 'favicon'].includes(type) ? 'png' : 'jpeg', { quality: 90 as any })
            .toBuffer();
          processed = true;
          extension = ['logo', 'favicon'].includes(type) ? 'png' : 'jpg';
          contentType = ['logo', 'favicon'].includes(type) ? 'image/png' : 'image/jpeg';
          console.warn('[image-upload] Resize failed; converted HEIC/HEIF to web format without resizing', { type });
        } else {
          throw procErr;
        }
      } catch (convErr) {
        // If conversion also fails, fall back to original file
        console.warn('[image-upload] Sharp processing failed; uploading original file instead', { error: (procErr as Error).message, type, convError: (convErr as Error).message });
        buffer = originalBuffer;
        processed = false;
        // Use original extension/content type to avoid mismatches
        extension = originalExt || extension;
        contentType = originalMime || contentType;
      }
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';
    const key = `users/${user.id}/${type}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    logger.info('Starting upload', {
      userId: user.id,
      type,
      originalSize: size,
      processedSize: buffer.length,
      processed,
      bucket,
      key,
    });

    // Ensure the user exists in our local database first
    await ensureLocalUser(user);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(key, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });
    
    if (error) {
      logger.error('Storage upload error', { error })
      await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: error.message, userEmail: user.email, userId: user.id, fileName: (file as any).name, mime: contentType, size, status: 500, reqId: logger.reqId })
      return NextResponse.json({ error: error.message, requestId: logger.reqId }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    
    logger.info('Upload complete', { path: data.path, publicUrl: pub.publicUrl, type, processed })
    return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl, type, processed, requestId: logger.reqId });
    
  } catch (e: any) {
    logger.error('Unexpected error', { message: e?.message, stack: e?.stack })
    await sendUploadFailureAlert({ route: '/api/uploads/profile', reason: e?.message || 'Unexpected error', userEmail: user.email, userId: user.id, fileName: (file as any)?.name, mime: (file as any)?.type, size: (file as any)?.size, status: 500, reqId: logger.reqId })
    return NextResponse.json({ error: 'Upload failed', requestId: logger.reqId }, { status: 500 });
  }
}
