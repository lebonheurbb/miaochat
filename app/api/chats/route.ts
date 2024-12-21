import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

// 获取用户的所有对话
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      include: { messages: true },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Failed to get chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建新对话
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title } = await request.json()

    // 创建新对话，并添加初始消息
    const chat = await prisma.chat.create({
      data: {
        title: title || '新对话',
        userId: user.id,
        messages: {
          create: {
            role: 'assistant',
            content: '你好！让本喵猜猜你今天是来讨论人生还是来听故事的呢？喵~'
          }
        }
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Failed to create chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 