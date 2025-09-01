import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { artist: string } }) {
  const form = await req.formData()
  const clientName = String(form.get('clientName') || '')
  const clientEmail = String(form.get('clientEmail') || '')
  const description = String(form.get('description') || '')
  const tierId = String(form.get('tierId') || '')

  const portfolio = await prisma.portfolio.findUnique({ where: { slug: params.artist } })
  if (!portfolio) return NextResponse.redirect(new URL(`/${params.artist}/commissions`, req.url))

  const ownerId = portfolio.userId
  let type = 'Custom'
  if (tierId) {
    const tier = await prisma.commissionPrice.findFirst({ where: { id: tierId, portfolioId: portfolio.id } })
    if (tier) type = tier.title
  }

  await prisma.commission.create({
    data: {
      clientName,
      clientEmail,
      description,
      type,
      userId: ownerId,
      attachments: '',
    },
  })

  return NextResponse.redirect(new URL(`/${params.artist}/commissions?ok=1`, req.url))
}

