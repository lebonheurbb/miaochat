import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new NextResponse('Expected Upgrade: websocket', { status: 426 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  try {
    return new NextResponse('WebSocket connection established', { status: 101 })
  } catch (err) {
    console.error('WebSocket error:', err)
    return new NextResponse('WebSocket error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 })
} 