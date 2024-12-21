import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [users, chats, messages] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count(),
      prisma.message.count()
    ])
    return NextResponse.json({ users, chats, messages })
  } catch (error) {
    console.error('Error getting stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 