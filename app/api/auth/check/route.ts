import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const user = await getUserByEmail(email)
    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 