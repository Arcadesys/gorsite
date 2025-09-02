import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/base-url'

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    return NextResponse.json({ 
      baseUrl,
      env: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      message: 'Base URL detection test'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      env: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL
    }, { status: 500 })
  }
}