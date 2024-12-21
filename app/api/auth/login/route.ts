import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'
import { compareSync } from 'bcryptjs'

export const runtime = 'edge'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !compareSync(password, user.password)) {
      return new NextResponse('Invalid credentials', { status: 401 })
    }

    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    return new NextResponse(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 