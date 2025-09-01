import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { ensureLocalUser, requireUser } from '@/lib/auth-helpers'

function slugify(input: string) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Auth
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  // Parse form-data
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400, headers: res.headers })
  }

  // Basic image validation
  const mime = (file as any).type || ''
  if (!mime.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400, headers: res.headers })
  }
  const size = (file as any).size || 0
  if (size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 413, headers: res.headers })
  }

  const titleRaw = form.get('title')?.toString()?.trim()
  const title = titleRaw && titleRaw.length > 0 ? titleRaw : file.name.replace(/\.[^.]+$/, '')
  const description = form.get('description')?.toString()
  const altText = form.get('altText')?.toString()
  const isPublic = form.get('isPublic')?.toString()?.toLowerCase() !== 'false' // default true

  // tags can be CSV or JSON array
  let tags: string | undefined
  const rawTags = form.get('tags')?.toString()
  if (rawTags) {
    try {
      const parsed = JSON.parse(rawTags)
      if (Array.isArray(parsed)) tags = JSON.stringify(parsed.map((t: any) => String(t)))
    } catch {
      // treat as CSV
      tags = JSON.stringify(
        rawTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      )
    }
  }

  const galleryName = form.get('galleryName')?.toString()?.trim()
  const gallerySlugRaw = form.get('gallerySlug')?.toString()?.trim()
  let gallerySlug = gallerySlugRaw ? slugify(gallerySlugRaw) : (galleryName ? slugify(galleryName) : '')
  if (!gallerySlug) gallerySlug = 'gallery'

  // Ensure gallery exists for this user (unique per userId + slug)
  let gallery = await prisma.gallery.findUnique({ where: { userId_slug: { userId: user.id, slug: gallerySlug } } })
  if (!gallery) {
    // If slug taken, append -1, -2, ...
    let base = gallerySlug
    let i = 1
    while (await prisma.gallery.findUnique({ where: { userId_slug: { userId: user.id, slug: gallerySlug } } })) {
      gallerySlug = `${base}-${i++}`
    }
    gallery = await prisma.gallery.create({
      data: {
        userId: user.id,
        name: galleryName || base.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
        slug: gallerySlug,
        description: null,
        isPublic,
      },
    })
  }

  // Upload file to Supabase storage
  const supabase = getSupabaseServer(req, res)
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'artworks'
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const key = `users/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage.from(bucket).upload(key, file, { cacheControl: '3600', upsert: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: res.headers })
  }
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)

  // Create gallery item
  const item = await prisma.galleryItem.create({
    data: {
      galleryId: gallery.id,
      title,
      imageUrl: pub.publicUrl,
      description,
      altText,
      tags,
    },
  })

  return NextResponse.json({ gallery, item }, { status: 201, headers: res.headers })
}

