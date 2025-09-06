import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser } from '@/lib/auth-helpers';
import sharp from 'sharp';
import { sendUploadFailureAlert } from '@/lib/email';
import { createRouteLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const logger = createRouteLogger('/api/uploads');
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  
  // Auth check first to avoid leaking validation differences
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    logger.warn('Unauthorized upload attempt', { error: userErr?.message });
    await sendUploadFailureAlert({ route: '/api/uploads', reason: userErr?.message || 'Unauthorized', status: 401, reqId: logger.reqId });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    logger.warn('Missing file in form-data', { userEmail: user.email, userId: user.id });
    await sendUploadFailureAlert({ route: '/api/uploads', reason: 'Missing file in form-data', userEmail: user.email, userId: user.id, status: 400, reqId: logger.reqId });
    return NextResponse.json({ error: 'Missing file', requestId: logger.reqId }, { status: 400 });
  }

  // Basic validation: only allow images up to ~20MB
  const mime = (file as any).type || '';
  if (!mime.startsWith('image/')) {
    logger.warn('Rejected non-image file', { mime, userId: user.id });
    await sendUploadFailureAlert({ route: '/api/uploads', reason: 'Non-image MIME', userEmail: user.email, userId: user.id, mime, status: 400, reqId: logger.reqId });
    return NextResponse.json({ error: 'Only image uploads are allowed', requestId: logger.reqId }, { status: 400 });
  }
  const size = (file as any).size || 0;
  if (size > 20 * 1024 * 1024) {
    logger.warn('Rejected oversized file', { size, userId: user.id });
    await sendUploadFailureAlert({ route: '/api/uploads', reason: 'File too large', userEmail: user.email, userId: user.id, size, status: 413, reqId: logger.reqId });
    return NextResponse.json({ error: 'File too large (max 20MB)', requestId: logger.reqId }, { status: 413 });
  }

  // Convert file to buffer and attempt metadata validation with Sharp.
  // If Sharp cannot parse (e.g. HEIC/HEIF on some platforms), continue without blocking the upload.
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  try {
    const metadata = await sharp(buffer).metadata();
    logger.info('Image metadata', { width: metadata.width, height: metadata.height, format: metadata.format, size: metadata.size });
    // Additional validation - ensure image has reasonable dimensions
    if (!metadata.width || !metadata.height || metadata.width < 1 || metadata.height < 1) {
      logger.warn('Invalid image dimensions', metadata as any);
      await sendUploadFailureAlert({ route: '/api/uploads', reason: 'Invalid image dimensions', userEmail: user.email, userId: user.id, fileName: file.name, mime, size, status: 400, reqId: logger.reqId });
      return NextResponse.json({ error: 'Invalid image file', requestId: logger.reqId }, { status: 400 });
    }
  } catch (error) {
    // Non-fatal: allow upload to proceed for formats Sharp can't decode (e.g., HEIC),
    // since we already validated MIME and size above.
    logger.warn('Sharp metadata parse failed; proceeding without validation', { error: (error as Error).message });
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks';
  const origExt = (file.name.split('.').pop() || 'png').toLowerCase();
  const isHeicLike = /heic|heif/.test(mime) || /heic|heif/.test(origExt);
  let uploadBuffer = buffer;
  let uploadMime = mime;
  let uploadExt = origExt;

  // If HEIC/HEIF, attempt to convert to JPEG for broad browser support
  if (isHeicLike) {
    try {
      const converted = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
      uploadBuffer = converted;
      uploadMime = 'image/jpeg';
      uploadExt = 'jpg';
      logger.info('Converted HEIC/HEIF to JPEG');
    } catch (convErr) {
      logger.warn('HEIC->JPEG conversion failed; storing original format', { error: (convErr as Error).message });
    }
  }

  const key = `users/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${uploadExt}`;

  try {
    logger.info('Starting upload', { userId: user.id, userEmail: user.email, name: file.name, type: mime, size, bucket, key });

    // Ensure the user exists in our local database first
    await ensureLocalUser(user);

    // Upload the original buffer (validated for MIME/size; Sharp validation is best-effort)
    const { data, error } = await supabase.storage.from(bucket).upload(key, uploadBuffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: uploadMime,
    });
    if (error) {
      logger.error('Storage upload error', { message: error.message, name: (error as any).name, statusCode: (error as any).statusCode, details: error });
      await sendUploadFailureAlert({ route: '/api/uploads', reason: error.message, userEmail: user.email, userId: user.id, fileName: file.name, mime: uploadMime, size, status: 500, reqId: logger.reqId });
      return NextResponse.json({ error: error.message, requestId: logger.reqId }, { status: 500 });
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    logger.info('Upload complete', { path: data.path, publicUrl: pub.publicUrl });
    return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl, requestId: logger.reqId });
  } catch (e: any) {
    logger.error('Unexpected error', { message: e?.message, stack: e?.stack });
    await sendUploadFailureAlert({ route: '/api/uploads', reason: e?.message || 'Unexpected error', userEmail: user.email, userId: user.id, fileName: (file as any)?.name, mime: (file as any)?.type, size: (file as any)?.size, status: 500, reqId: logger.reqId });
    return NextResponse.json({ error: 'Upload failed', requestId: logger.reqId }, { status: 500 });
  }
}
