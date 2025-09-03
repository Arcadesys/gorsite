import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const form = await req.formData()
  const clientName = String(form.get('clientName') || '')
  const clientEmail = String(form.get('clientEmail') || '')
  const description = String(form.get('description') || '')
  const tierId = String(form.get('tierId') || '') || undefined

  if (!clientName || !clientEmail || !description) {
    return NextResponse.redirect(new URL(`/${artist}/commissions?error=missing`, req.url))
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { slug: artist } })
  if (!portfolio) {
    return NextResponse.redirect(new URL(`/${artist}/commissions?error=artist`, req.url))
  }

  // Determine type/price from tier if provided
  let type = 'custom'
  let price: number | null = null
  if (tierId) {
    const tier = await prisma.commissionPrice.findFirst({ where: { id: tierId, portfolioId: portfolio.id } })
    if (tier) {
      type = tier.title
      price = tier.price
    }
  }

  // Next queue position for this artist
  const last = await prisma.commission.findFirst({
    where: { userId: portfolio.userId },
    orderBy: { queuePosition: 'desc' },
    select: { queuePosition: true },
  })
  const nextPos = (last?.queuePosition || 0) + 1

  await prisma.commission.create({
    data: {
      clientName,
      clientEmail,
      description,
      type,
      price: price ?? undefined,
      attachments: '',
      userId: portfolio.userId,
      queuePosition: nextPos,
    },
  })

  return NextResponse.redirect(new URL(`/${artist}/commissions?submitted=1`, req.url))
}

